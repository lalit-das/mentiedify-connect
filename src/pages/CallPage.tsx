import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
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
      if (!sessionId) return;
      
      try {
        // Get call session with booking and mentor details
        const { data: callSession, error: sessionError } = await supabase
          .from('call_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        // Get booking with mentor and mentee details
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            mentor:mentor_id (
              id,
              name,
              title,
              profile_image_url
            ),
            mentee:mentee_id (
              id,
              first_name,
              last_name,
              avatar
            )
          `)
          .eq('id', callSession.booking_id)
          .single();

        if (bookingError) throw bookingError;

        setSessionData({
          id: sessionId,
          mentor: {
            name: booking.mentor.name,
            title: booking.mentor.title,
            avatar: booking.mentor.profile_image_url || "/placeholder.svg"
          },
          mentee: {
            name: `${booking.mentee.first_name} ${booking.mentee.last_name}`,
            avatar: booking.mentee.avatar || "/placeholder.svg"
          },
          topic: booking.topic || "Mentorship Session",
          scheduledTime: `${booking.session_date} ${booking.session_time}`,
          sessionType: booking.session_type || "video"
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
  }, [sessionId, toast]);

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

  if (loading || !sessionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                src={sessionData.mentor.avatar}
                alt={sessionData.mentor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{sessionData.mentor.name}</h2>
                <p className="text-sm text-muted-foreground">{sessionData.mentor.title}</p>
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
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <img
                      src={sessionData.mentor.avatar}
                      alt={sessionData.mentor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle>{sessionData.mentor.name}</CardTitle>
                      <p className="text-muted-foreground">{sessionData.mentor.title}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{sessionData.scheduledTime}</Badge>
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
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              
              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-white">
                {isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                    <VideoOff className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>

              {/* Participant Info */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{sessionData.mentor.name}</span>
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
                  {chatMessages.map((msg) => (
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
                  ))}
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
            className="rounded-full p-4"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full p-4"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full p-4"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full p-4"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          {isConnected ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full p-4"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={startCall}
              className="rounded-full p-4"
              disabled={isConnecting}
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