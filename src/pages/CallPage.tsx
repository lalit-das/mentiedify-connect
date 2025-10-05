import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Settings, 
  MoreVertical,
  Clock,
  Users,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CallPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [participantInfo, setParticipantInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Determine if current user is the initiator
  const isInitiator = searchParams.get('initiator') === 'true';

  // WebRTC hook
  const {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error: webrtcError,
    startCall: startWebRTCCall,
    endCall: endWebRTCCall,
    toggleAudio: toggleWebRTCAudio,
    toggleVideo: toggleWebRTCVideo,
  } = useWebRTC({
    sessionId: sessionId || 'default',
    isInitiator,
    onRemoteStream: (stream) => {
      console.log('Remote stream received');
    },
    onConnectionStateChange: (state) => {
      console.log('Connection state changed:', state);
      if (state === 'connected') {
        toast({
          title: "Connected",
          description: "Call connected successfully",
        });
      }
    }
  });

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId || !user) return;
      
      try {
        // Get call session
        const { data: callSession, error: sessionError } = await supabase
          .from('call_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        // Get booking with full details
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', callSession.booking_id)
          .single();

        if (bookingError) throw bookingError;

        // Get mentor details
        const { data: mentorData, error: mentorError } = await supabase
          .from('mentors')
          .select('*')
          .eq('id', booking.mentor_id)
          .single();

        if (mentorError) throw mentorError;

        // Get mentee details
        const { data: menteeData, error: menteeError } = await supabase
          .from('users')
          .select('*')
          .eq('id', booking.mentee_id)
          .maybeSingle();

        if (menteeError) {
          console.error('Error fetching mentee:', menteeError);
        }

        // ⭐ THE FIX: Determine role based on BOTH user_id AND caller_id
        const isMentorByUserId = mentorData.user_id === user.id;
        const isMenteeByUserId = booking.mentee_id === user.id;
        
        // User is mentor if their user ID matches the mentor's user_id
        const isMentor = isMentorByUserId;

        console.log('📞 Call Session Info:', {
          currentUserId: user.id,
          mentorUserId: mentorData.user_id,
          menteeUserId: booking.mentee_id,
          callerId: callSession.caller_id,
          calleeId: callSession.callee_id,
          isMentorByUserId,
          isMenteeByUserId,
          finalIsMentor: isMentor
        });

        // ⭐ Set participant info based on user role
        if (isMentor) {
          // Current user is MENTOR, show MENTEE info
          setParticipantInfo({
            name: menteeData ? `${menteeData.first_name} ${menteeData.last_name}` : 'Mentee',
            title: 'Mentee',
            avatar: menteeData?.profile_image_url || "/placeholder.svg"
          });
        } else {
          // Current user is MENTEE, show MENTOR info
          setParticipantInfo({
            name: mentorData.name,
            title: mentorData.title,
            avatar: mentorData.profile_image_url || "/placeholder.svg"
          });
        }

        setSessionData({
          id: sessionId,
          bookingId: booking.id,
          topic: booking.topic || booking.notes || "Mentorship Session",
          scheduledTime: `${new Date(booking.session_date).toLocaleDateString()} ${booking.session_time}`,
          sessionType: booking.session_type || "video",
          isMentor
        });

      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, user, toast]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Show WebRTC errors
  useEffect(() => {
    if (webrtcError) {
      toast({
        title: "Call Error",
        description: webrtcError,
        variant: "destructive",
      });
    }
  }, [webrtcError, toast]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    toggleWebRTCAudio(newState);
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    toggleWebRTCVideo(newState);
  };

  const startCall = async () => {
    try {
      await startWebRTCCall();
      toast({
        title: "Joining Call",
        description: "Connecting to the session...",
      });
    } catch (err) {
      console.error('Error starting call:', err);
      toast({
        title: "Failed to Start Call",
        description: "Please check your camera and microphone permissions",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    endWebRTCCall();
    toast({
      title: "Call Ended",
      description: "The call has been terminated",
    });
    
    // Navigate back to appropriate dashboard
    setTimeout(() => {
      if (sessionData?.isMentor) {
        navigate('/mentor-dashboard');
      } else {
        navigate('/mentee-dashboard');
      }
    }, 1500);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: "You",
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  if (loading || !sessionData || !participantInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={participantInfo.avatar}
                alt={participantInfo.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{participantInfo.name}</h2>
                <p className="text-sm text-muted-foreground">{participantInfo.title}</p>
              </div>
            </div>
            <Badge variant="outline">{sessionData.sessionType} call</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Session Topic</div>
              <div className="font-medium">{sessionData.topic}</div>
            </div>
            {isConnected && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}
            {isConnecting && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-slate-900">
          {!isConnected && !isConnecting ? (
            // Pre-call UI
            <div className="h-full flex items-center justify-center">
              <Card className="w-96">
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4 mb-4">
                    <img
                      src={participantInfo.avatar}
                      alt={participantInfo.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle className="text-xl">{participantInfo.name}</CardTitle>
                      <p className="text-muted-foreground">{participantInfo.title}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {sessionData.scheduledTime}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">Ready to start your session?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Make sure your microphone and camera are working properly.
                    </p>
                  </div>
                  
                  {/* Device Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Microphone</span>
                      <Badge variant={isAudioEnabled ? "default" : "secondary"}>
                        {isAudioEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Camera</span>
                      <Badge variant={isVideoEnabled ? "default" : "secondary"}>
                        {isVideoEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button onClick={startCall} className="w-full" size="lg" disabled={isConnecting}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Join Call
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Active call UI
            <div className="h-full relative">
              {/* Remote Video */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                  <Users className="h-16 w-16 mb-4 text-slate-600" />
                  <p className="text-lg">Waiting for {participantInfo.name}...</p>
                </div>
              )}
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                {isVideoEnabled && localStream ? (
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover mirror"
                    autoPlay
                    muted
                    playsInline
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                    <VideoOff className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>

              {/* Participant Info */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium">{participantInfo.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <Card className="w-80 m-4 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Session Chat</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isMe
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <Separator />
              <div className="p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-14 w-14"
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-14 w-14"
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={showChat ? "default" : "outline"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full h-14 w-14"
            title="Toggle chat"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-14 w-14"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          {isConnected ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full h-14 w-14"
              title="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={startCall}
              className="rounded-full h-14 w-14 bg-green-600 hover:bg-green-700"
              disabled={isConnecting}
              title="Start call"
            >
              {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallPage;
