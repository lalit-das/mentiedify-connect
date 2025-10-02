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
            type: 'broadcast',
            event: 'answer',
            payload: { sessionId, answer }
          });
        } catch (err) {
          console.error('Error handling offer:', err);
          setError('Failed to process call offer');
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('Received answer');
        const pc = peerConnectionRef.current;
        
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } catch (err) {
            console.error('Error handling answer:', err);
            setError('Failed to process call answer');
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        const pc = peerConnectionRef.current;
        
        if (pc && payload.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      })
      .subscribe((status) => {
        console.log('Signaling channel status:', status);
      });

    signalingChannelRef.current = channel;
    return channel;
  }, [sessionId, createPeerConnection]);

  // Start call
  const startCall = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const stream = await initializeMedia();
      const pc = createPeerConnection();
      
      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Setup signaling
      setupSignaling();

      // If initiator, create and send offer
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        signalingChannelRef.current?.send({
          type: 'broadcast',
          event: 'offer',
          payload: { sessionId, offer }
        });
      }

      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to start call');
      console.error('Error starting call:', err);
    }
  }, [initializeMedia, createPeerConnection, setupSignaling, isInitiator, sessionId]);

  // End call
  const endCall = useCallback(() => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());

    // Unsubscribe from signaling channel
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, [localStream, remoteStream]);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    initializeMedia
  };
};
