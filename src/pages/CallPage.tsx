import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const CallPage = () => {
  const { sessionId } = useParams();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Dr. Sarah Wilson", message: "Hi! Ready to start our session?", timestamp: "2:00 PM", isMe: false },
    { id: 2, sender: "You", message: "Yes, I'm ready! Looking forward to discussing product strategy.", timestamp: "2:01 PM", isMe: true }
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Mock session data
  const session = {
    id: sessionId,
    mentor: {
      name: "Dr. Sarah Wilson",
      title: "Senior Product Manager",
      company: "Google",
      avatar: "/placeholder.svg"
    },
    mentee: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg"
    },
    topic: "Product Strategy & Stakeholder Management",
    scheduledTime: "2:00 PM - 3:00 PM PST",
    sessionType: "video"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const startCall = () => {
    setIsCallActive(true);
    // WebRTC call initiation logic would go here
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    // WebRTC call termination logic would go here
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={session.mentor.avatar}
                alt={session.mentor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{session.mentor.name}</h2>
                <p className="text-sm text-muted-foreground">{session.mentor.title}</p>
              </div>
            </div>
            <Badge variant="outline">{session.sessionType} call</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Session Topic</div>
              <div className="font-medium">{session.topic}</div>
            </div>
            {isCallActive && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(callDuration)}</span>
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
          {!isCallActive ? (
            // Pre-call UI
            <div className="h-full flex items-center justify-center">
              <Card className="w-96">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <img
                      src={session.mentor.avatar}
                      alt={session.mentor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <CardTitle>{session.mentor.name}</CardTitle>
                      <p className="text-muted-foreground">{session.mentor.company}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{session.scheduledTime}</Badge>
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
                  
                  <Button onClick={startCall} className="w-full" size="lg">
                    <Video className="mr-2 h-4 w-4" />
                    Join Call
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
                  <span className="text-sm">{session.mentor.name}</span>
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
          
          {isCallActive ? (
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
            >
              <Phone className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallPage;