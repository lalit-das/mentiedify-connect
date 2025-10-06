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
      // First, stop any existing local stream to release devices
      if (localStream) {
        console.log('🧹 Stopping existing stream before requesting new one...');
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped existing track:', track.kind);
        });
        setLocalStream(null);
      }

      console.log('🎤 Requesting media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false, 
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false 
      });
      setLocalStream(stream);
      console.log('✅ Media devices acquired:', stream.getTracks().map(t => t.kind));
      return stream;
    } catch (err: any) {
      const errorMessage = err.name === 'NotReadableError' 
        ? 'Camera/microphone is already in use. Please close other tabs or applications using your devices.'
        : 'Failed to access camera/microphone. Please check your permissions.';
      setError(errorMessage);
      console.error('❌ Error accessing media devices:', err.name, err.message);
      throw err;
    }
  }, [localStream]);

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
    return new Promise<any>((resolve, reject) => {
      const channel = supabase.channel(`webrtc-${sessionId}`, {
        config: {
          broadcast: { self: false }
        }
      });

      channel
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          console.log('📥 Received offer');
          let pc = peerConnectionRef.current;
          
          // If no peer connection exists, we need to set up media first
          if (!pc) {
            console.log('⚠️ No peer connection, initializing...');
            try {
              const stream = await initializeMedia();
              pc = createPeerConnection();
              stream.getTracks().forEach(track => {
                pc!.addTrack(track, stream);
              });
              console.log('✅ Media and peer connection initialized for receiver');
            } catch (err) {
              console.error('❌ Failed to initialize media for receiver:', err);
              setError('Failed to initialize camera/microphone');
              return;
            }
          }
          
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
          if (status === 'SUBSCRIBED') {
            signalingChannelRef.current = channel;
            resolve(channel);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Channel subscription failed: ${status}`));
          }
        });
    });
  }, [sessionId, createPeerConnection, initializeMedia]);

  // Start call
  const startCall = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎬 Starting call...');
      
      // Initialize media first
      const stream = await initializeMedia();
      console.log('✅ Media initialized');
      
      // Create peer connection
      const pc = createPeerConnection();
      console.log('✅ Peer connection created');
      
      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      console.log('✅ Local tracks added');

      // Setup signaling and wait for it to be ready
      console.log('📡 Setting up signaling...');
      const channel = await setupSignaling();
      console.log('✅ Signaling channel ready');

      // If initiator, create and send offer after signaling is ready
      if (isInitiator) {
        console.log('👤 User is initiator, creating offer...');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        console.log('📤 Sending offer');
        channel.send({
          type: 'broadcast',
          event: 'offer',
          payload: { sessionId, offer }
        });
      } else {
        console.log('👥 User is receiver, waiting for offer...');
      }

      setIsConnecting(false);
    } catch (err) {
      setIsConnecting(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start call';
      setError(errorMessage);
      console.error('❌ Error starting call:', err);
    }
  }, [initializeMedia, createPeerConnection, setupSignaling, isInitiator, sessionId]);

  // End call
  const endCall = useCallback(() => {
    console.log('🧹 Cleaning up call...');
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop all local tracks first
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped local track:', track.kind);
      });
    }
    
    // Stop all remote tracks
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped remote track:', track.kind);
      });
    }

    // Unsubscribe from signaling channel
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    
    console.log('✅ Call cleanup complete');
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
      console.log('🧹 Component unmounting, cleaning up...');
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
