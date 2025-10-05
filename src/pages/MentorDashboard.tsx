import { useState, useEffect } from "react";
import { Calendar, Clock, DollarSign, Star, Users, Video, MessageSquare, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MentorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    // Get booking details with mentor user_id
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        mentor_id,
        mentee_id,
        mentors!inner(
          id,
          user_id
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    const mentorUserId = booking.mentors.user_id;
    const menteeUserId = booking.mentee_id;

    // Find or create call session
    const { data: existingSession } = await supabase
      .from('call_sessions')
      .select('id, caller_id')
      .eq('booking_id', bookingId)
      .single();

    let sessionId = existingSession?.id;
    let isInitiator = false;

    if (!sessionId) {
      // Mentor creates new session (mentor as caller)
      const { data: newSession, error: sessionError } = await supabase
        .from('call_sessions')
        .insert({
          booking_id: bookingId,
          caller_id: mentorUserId,
          callee_id: menteeUserId,
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

    console.log('🔍 Current user ID:', user?.id);

    // Fetch mentor profile
    const { data: mentorData, error: mentorError } = await supabase
      .from('mentors')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    console.log('👤 Mentor profile found:', mentorData);

    if (mentorError && mentorError.code !== 'PGRST116') {
      throw mentorError;
    }

    if (!mentorData) {
      toast({
        title: "Mentor Profile Not Found",
        description: "Please complete your mentor application first.",
        variant: "destructive",
      });
      return;
    }

    setMentorProfile(mentorData);

    console.log('📅 Fetching bookings for mentor_id:', mentorData.id);

    // Fetch upcoming bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        session_date,
        session_time,
        session_type,
        status,
        notes,
        topic,
        price,
        mentee_id,
        mentees:users!bookings_mentee_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('mentor_id', mentorData.id)
      .in('status', ['pending', 'confirmed'])
      .gte('session_date', new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .order('session_time', { ascending: true });

    console.log('📊 Bookings found:', bookingsData?.length, bookingsData);

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    const formattedBookings = (bookingsData || []).map((booking: any) => ({
      id: booking.id,
      mentee: booking.mentees 
        ? `${booking.mentees.first_name || 'Unknown'} ${booking.mentees.last_name || 'User'}` 
        : 'Unknown Mentee',
      menteeEmail: booking.mentees?.email || '',
      time: booking.session_time,
      date: new Date(booking.session_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      topic: booking.topic || booking.notes || 'General Mentoring Session',
      type: booking.session_type === 'video' ? 'Video Call' : 
            booking.session_type === 'audio' ? 'Audio Call' : 'Chat Session',
      status: booking.status
    }));

    console.log('✅ Formatted bookings:', formattedBookings);

    setUpcomingSessions(formattedBookings);

    // ... rest of the function remains the same

      // Fetch recent messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender_id,
          senders:users!messages_sender_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError && messagesError.code !== 'PGRST116') {
        console.error('Error fetching messages:', messagesError);
      }

      const formattedMessages = (messagesData || []).map((message: any) => ({
        id: message.id,
        from: message.senders 
          ? `${message.senders.first_name} ${message.senders.last_name}` 
          : 'Unknown User',
        message: message.content,
        time: new Date(message.created_at).toLocaleDateString(),
        unread: !message.is_read
      }));

      setRecentMessages(formattedMessages);

      // Calculate stats
      const { data: totalBookings, count: totalCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: false })
        .eq('mentor_id', mentorData.id)
        .eq('status', 'completed');

      const totalSessions = totalCount || 0;
      const rating = mentorData.rating || 0;
      
      // Calculate monthly earnings
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('price')
        .eq('mentor_id', mentorData.id)
        .eq('status', 'completed')
        .gte('session_date', currentMonth + '-01');

      const monthlyEarnings = (monthlyBookings || []).reduce((sum: number, booking: any) => 
        sum + (booking.price || 0), 0
      );

      // Get unique mentee count
      const { data: uniqueMentees } = await supabase
        .from('bookings')
        .select('mentee_id')
        .eq('mentor_id', mentorData.id)
        .eq('status', 'completed');

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

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking confirmed successfully!",
      });

      // Refresh data
      fetchMentorData();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast({
        title: "Error",
        description: "Failed to confirm booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking declined.",
      });

      // Refresh data
      fetchMentorData();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        title: "Error",
        description: "Failed to decline booking. Please try again.",
        variant: "destructive",
      });
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
            <Button onClick={() => window.location.href = '/become-mentor'}>
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
          <p className="text-muted-foreground">Welcome back, {mentorProfile.name}! Here's what's happening with your mentorship.</p>
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
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>Your scheduled mentorship sessions with mentees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{session.mentee}</h4>
                            <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.topic}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {session.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.time}
                            </div>
                            <Badge variant="outline" className="text-xs">{session.type}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {session.status === 'pending' ? (
                            <>
                              <Button size="sm" onClick={() => handleAcceptBooking(session.id)}>
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeclineBooking(session.id)}>
                                Decline
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleJoinCall(session.id)}>
                                <Video className="h-3 w-3 mr-1" />
                                Join Call
                              </Button>
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Upcoming Sessions</h3>
                      <p className="text-muted-foreground">You don't have any scheduled sessions at the moment.</p>
                    </div>
                  )}
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
                {recentMessages.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Messages</h3>
                    <p className="text-muted-foreground">You don't have any messages yet.</p>
                  </div>
                )}
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
