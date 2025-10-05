import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebRTCConfig {
  sessionId: string;
  isInitiator: boolean;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const useWebRTC = ({ sessionId, isInitiator, onRemoteStream, onConnectionStateChange }: WebRTCConfig) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingChannelRef = useRef<any>(null);

  // Initialize local media stream
  const initializeMedia = useCallback(async (audio: boolean = true, video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false, 
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false 
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError('Failed to access camera/microphone');
      console.error('Error accessing media devices:', err);
      throw err;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            sessionId,
            candidate: event.candidate.toJSON()
          }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
      onRemoteStream?.(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setIsConnected(pc.connectionState === 'connected');
      onConnectionStateChange?.(pc.connectionState);
      
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Connection failed or disconnected');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sessionId, onRemoteStream, onConnectionStateChange]);

  // Setup signaling channel
  const setupSignaling = useCallback(() => {
    const channel = supabase.channel(`webrtc-${sessionId}`, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('Received offer');
        const pc = peerConnectionRef.current || createPeerConnection();
        
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          channel.send({
            type:
