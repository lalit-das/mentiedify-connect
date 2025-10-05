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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false); // ⭐ Prevent multiple initializations

  const createMockStream = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    
    let hue = 0;
    const animate = () => {
      if (ctx) {
        hue = (hue + 1) % 360;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `hsl(${hue}, 50%, 20%)`);
        gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 50%, 30%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Camera Not Available', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('(Testing Mode)', canvas.width / 2, canvas.height / 2);
        ctx.font = '18px Arial';
        ctx.fillStyle = '#888888';
        ctx.fillText('WebContainer Environment', canvas.width / 2, canvas.height / 2 + 40);
        const time = new Date().toLocaleTimeString();
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666666';
        ctx.fillText(time, canvas.width / 2, canvas.height / 2 + 80);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    
    // @ts-ignore
    const videoStream = canvas.captureStream(30);
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 0;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.001;
    oscillator.connect(gainNode);
    const audioDestination = audioContext.createMediaStreamDestination();
    gainNode.connect(audioDestination);
    oscillator.start();
    
    const mockStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);
    
    console.log('✅ Created mock stream');
    return mockStream;
  }, []);

  const initializeMedia = useCallback(async () => {
    try {
      console.warn('⚠️ Using mock stream for testing');
      const mockStream = createMockStream();
      setLocalStream(mockStream);
      return mockStream;
    } catch (err) {
      setError('Failed to create media stream');
      console.error('❌ Error:', err);
      throw err;
    }
  }, [createMockStream]);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log('⚠️ Peer connection already exists, reusing');
      return peerConnectionRef.current;
    }

    console.log('🔗 Creating new peer connection');
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    pc.onicecandidate = (event) => {
      if (event.candidate && signalingChannelRef.current) {
        console.log('🧊 Sending ICE candidate');
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { sessionId, candidate: event.candidate.toJSON() }
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('📹 Received remote track');
      setRemoteStream(event.streams[0]);
      onRemoteStream?.(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', pc.connectionState);
      const connected = pc.connectionState === 'connected';
      setIsConnected(connected);
      onConnectionStateChange?.(pc.connectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [sessionId, onRemoteStream, onConnectionStateChange]);

  const setupSignaling = useCallback(() => {
    if (signalingChannelRef.current) {
      console.log('⚠️ Signaling channel already exists, skipping setup');
      return signalingChannelRef.current;
    }

    console.log('📡 Setting up signaling channel for session:', sessionId);
    
    const channel = supabase.channel(`webrtc-${sessionId}`, {
      config: {
        broadcast: { 
          self: false,
          ack: false
        }
      }
    });

    channel
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        console.log('📨 Received offer');
        const pc = peerConnectionRef.current || createPeerConnection();
        
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          console.log('📤 Sending answer');
          channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: { sessionId, answer }
          });
        } catch (err) {
          console.error('❌ Error handling offer:', err);
        }
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        console.log('📨 Received answer');
        const pc = peerConnectionRef.current;
        
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
            console.log('✅ Answer processed');
          } catch (err) {
            console.error('❌ Error handling answer:', err);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        console.log('📨 Received ICE candidate');
        const pc = peerConnectionRef.current;
        
        if (pc && payload.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            console.log('✅ ICE candidate added');
          } catch (err) {
            console.error('❌ Error adding ICE candidate:', err);
          }
        }
      })
      .subscribe((status) => {
        console.log('📡 Signaling channel status:', status);
      });

    signalingChannelRef.current = channel;
    return channel;
  }, [sessionId, createPeerConnection]);

  const startCall = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log('⚠️ Call already initialized, skipping');
      return;
    }

    console.log('🚀 Starting call...');
    setIsConnecting(true);
    isInitializedRef.current = true;

    try {
      const stream = await initializeMedia();
      const pc = createPeerConnection();
      
      stream.getTracks().forEach(track => {
        console.log('➕ Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      setupSignaling();

      if (isInitiator) {
        console.log('👋 Creating offer (initiator)');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        signalingChannelRef.current?.send({
          type: 'broadcast',
          event: 'offer',
          payload: { sessionId, offer }
        });
      } else {
        console.log('👂 Waiting for offer');
      }

      setIsConnecting(false);
      console.log('✅ Call started');
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to start call');
      isInitializedRef.current = false;
      console.error('❌ Error:', err);
    }
  }, [initializeMedia, createPeerConnection, setupSignaling, isInitiator, sessionId]);

  const endCall = useCallback(() => {
    console.log('☎️ Ending call...');
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    
    localStream?.getTracks().forEach(track => track.stop());
    
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    isInitializedRef.current = false;
    
    console.log('✅ Call ended');
  }, [localStream]);

  const toggleAudio = useCallback((enabled: boolean) => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
      console.log(`🎤 Audio ${enabled ? 'enabled' : 'disabled'}`);
    });
  }, [localStream]);

  const toggleVideo = useCallback((enabled: boolean) => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
      console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
    });
  }, [localStream]);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

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
