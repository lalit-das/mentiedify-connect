import { useState, useEffect } from "react";
import { Calendar, Clock, DollarSign, Star, Users, Video, MessageSquare, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MentorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { title: "Total Sessions", value: "0", icon: Video, change: "+0%" },
    { title: "Average Rating", value: "0", icon: Star, change: "+0" },
    { title: "Active Mentees", value: "0", icon: Users, change: "+0" },
    { title: "Monthly Earnings", value: "$0", icon: DollarSign, change: "+0%" }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMentorData();
    }
  }, [user]);

  const handleJoinCall = async (bookingId: string) => {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select('mentor_id, mentee_id')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Find or create call session
      const { data: existingSession } = await supabase
        .from('call_sessions')
        .select('id, caller_id')
        .eq('booking_id', bookingId)
        .single();

      let sessionId = existingSession?.id;
      let isInitiator = false;

      if (!sessionId) {
        // Create new session (mentor as initiator)
        const { data: newSession, error: sessionError } = await supabase
          .from('call_sessions')
          .insert({
            booking_id: bookingId,
            caller_id: booking.mentor_id,
            callee_id: booking.mentee_id,
            call_type: 'video',
            status: 'initiated'
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;
        sessionId = newSession.id;
        isInitiator = true;
      } else {
        // Check if mentor is the caller
        isInitiator = existingSession.caller_id === user?.id;
      }

      // Navigate to call page
      window.location.href = `/call/${sessionId}?initiator=${isInitiator}`;
    } catch (error) {
      console.error('Error joining call:', error);
      toast({
        title: "Error",
        description: "Failed to join call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchMentorData = async () => {
    try {
      setLoading(true);

      // Fetch mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (mentorError && mentorError.code !== 'PGRST116') {
        throw mentorError;
      }

      if (!mentorData) {
        // User is not a mentor yet
        toast({
          title: "Mentor Profile Not Found",
          description: "Please complete your mentor application first.",
          variant: "destructive",
        });
        return;
      }

      setMentorProfile(mentorData);

      // Fetch upcoming bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users!bookings_mentee_id_fkey(first_name, last_name)
        `)
        .eq('mentor_id', mentorData.id)
        .eq('status', 'confirmed')
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true })
        .limit(5);

      if (bookingsError) {
        throw bookingsError;
      }

      const formattedBookings = (bookingsData || []).map((booking: any) => ({
        id: booking.id,
        mentee: `${booking.users?.first_name} ${booking.users?.last_name}`,
        time: booking.session_time,
        date: new Date(booking.session_date).toLocaleDateString(),
        topic: booking.notes || 'General Mentoring Session',
        type: booking.session_type === 'video' ? 'Video Call' : 
              booking.session_type === 'audio' ? 'Audio Call' : 'Chat Session'
      }));

      setUpcomingSessions(formattedBookings);

      // Fetch recent messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          users!messages_sender_id_fkey(first_name, last_name)
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) {
        throw messagesError;
      }

      const formattedMessages = (messagesData || []).map((message: any) => ({
        id: message.id,
        from: `${message.users?.first_name} ${message.users?.last_name}`,
        message: message.content,
        time: new Date(message.created_at).toLocaleDateString(),
        unread: !message.is_read
      }));

      setRecentMessages(formattedMessages);

      // Calculate stats
      const { data: totalBookings } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('mentor_id', mentorData.id)
        .eq('status', 'completed');

      const totalSessions = totalBookings?.length || 0;
      const rating = mentorData.rating || 0;
      const totalReviews = mentorData.total_reviews || 0;
      
      // Calculate monthly earnings (simplified)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('price')
        .eq('mentor_id', mentorData.id)
        .eq('status', 'completed')
        .gte('session_date', currentMonth + '-01');

      const monthlyEarnings = (monthlyBookings || []).reduce((sum: number, booking: any) => sum + (booking.price || 0), 0);

      // Get unique mentee count
      const { data: uniqueMentees } = await supabase
        .from('bookings')
        .select('mentee_id')
        .eq('mentor_id', mentorData.id);

      const activeMentees = new Set(uniqueMentees?.map(b => b.mentee_id)).size;

      setStats([
        { title: "Total Sessions", value: totalSessions.toString(), icon: Video, change: "+12%" },
        { title: "Average Rating", value: rating.toFixed(1), icon: Star, change: "+0.1" },
        { title: "Active Mentees", value: activeMentees.toString(), icon: Users, change: "+3" },
        { title: "Monthly Earnings", value: `$${monthlyEarnings}`, icon: DollarSign, change: "+18%" }
      ]);

    } catch (error) {
      console.error('Error fetching mentor data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Complete Your Mentor Profile</h2>
            <p className="text-muted-foreground mb-4">You need to complete your mentor application to access the dashboard.</p>
            <Button onClick={() => navigate('/become-mentor')}>
              Complete Application
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your mentorship.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>Your scheduled mentorship sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{session.mentee}</h4>
                        <p className="text-sm text-muted-foreground">{session.topic}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {session.date} at {session.time}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant="outline">{session.type}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Reschedule</Button>
                          <Button size="sm" onClick={() => handleJoinCall(session.id)}>Join Call</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your mentorship activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Update Availability
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Set Pricing
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    View Reviews
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Mentees
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Messages
                </CardTitle>
                <CardDescription>Latest messages from your mentees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{message.from}</h4>
                        {message.unread && <Badge variant="secondary" className="text-xs">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                      <p className="text-xs text-muted-foreground">{message.time}</p>
                    </div>
                    <Button size="sm" variant="outline">Reply</Button>
                  </div>
                ))}
                <Button className="w-full" variant="outline">View All Messages</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your mentorship impact and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-4">Detailed analytics coming soon</p>
                  <Button variant="outline">Request Analytics Access</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your mentor profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  Edit Profile Information
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Update Expertise Areas
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Manage Notifications
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MentorDashboard;