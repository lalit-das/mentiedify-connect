import { useState } from "react";
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      title: "Senior Product Manager",
      lastMessage: "Great session today! Looking forward to our next meeting.",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "John Rodriguez",
      title: "Leadership Coach",
      lastMessage: "I've prepared some resources for our discussion on team management.",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Alex Chen",
      title: "Tech Lead",
      lastMessage: "Let's dive deeper into system architecture next time.",
      timestamp: "Yesterday",
      unread: 1,
      online: true,
      avatar: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Maria Garcia",
      title: "Career Counselor",
      lastMessage: "Your career plan looks solid. A few tweaks and you'll be set!",
      timestamp: "2 days ago",
      unread: 0,
      online: false,
      avatar: "/placeholder.svg"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Dr. Sarah Wilson",
      content: "Hi! I'm looking forward to our session tomorrow. Is there anything specific you'd like to focus on?",
      timestamp: "10:30 AM",
      isMe: false
    },
    {
      id: 2,
      sender: "You",
      content: "Yes! I'd love to discuss product strategy and how to better align with stakeholders.",
      timestamp: "10:35 AM",
      isMe: true
    },
    {
      id: 3,
      sender: "Dr. Sarah Wilson",
      content: "Perfect! I have some frameworks that work really well for stakeholder alignment. We'll cover those tomorrow.",
      timestamp: "10:40 AM",
      isMe: false
    },
    {
      id: 4,
      sender: "You",
      content: "That sounds great! Should I prepare anything beforehand?",
      timestamp: "10:42 AM",
      isMe: true
    },
    {
      id: 5,
      sender: "Dr. Sarah Wilson",
      content: "Just think about a current challenge you're facing with stakeholders. We'll use that as a case study.",
      timestamp: "10:45 AM",
      isMe: false
    },
    {
      id: 6,
      sender: "Dr. Sarah Wilson",
      content: "Great session today! Looking forward to our next meeting.",
      timestamp: "Just now",
      isMe: false
    }
  ];

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle send message logic here
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Communicate with your mentors and mentees</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer border-b hover:bg-accent transition-colors ${
                      selectedConversation === conversation.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                          {conversation.unread > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSelectedConversation(0)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <img
                          src={selectedConv.avatar}
                          alt={selectedConv.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedConv.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConv.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedConv.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.isMe
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <Separator />
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;