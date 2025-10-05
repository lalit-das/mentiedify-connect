import { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, MessageSquare, Star, Target, User, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MenteeDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [learningGoals] = useState([
    { id: 1, goal: "Master Product Management", progress: 75, target: "3 months" },
    { id: 2, goal: "Improve Leadership Skills", progress: 45, target: "6 months" },
    { id: 3, goal: "Learn System Design", progress: 20, target: "4 months" }
  ]);
  const [stats, setStats] = useState([
    { title: "Sessions Completed", value: "0", icon: BookOpen },
    { title: "Hours of Mentorship", value: "0", icon: Clock },
    { title: "Active Mentors", value: "0", icon: User },
    { title: "Average Rating Given", value: "0", icon: Star }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMenteeData();
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

    // Create or find call session
    const { data: existingSession } = await supabase
      .from('call_sessions')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    let sessionId = existingSession?.id;

    if (!sessionId) {
      // Mentee is the caller, mentor is the callee
      const { data: newSession, error: sessionError } = await supabase
        .from('call_sessions')
        .insert({
          booking_id: bookingId,
          caller_id: menteeUserId,  // Mentee user ID
          callee_id: mentorUserId,  // Mentor user ID (not mentor ID!)
          call_type: 'video',
          status: 'initiated'
        })
        .select('id')
        .single();

      if (sessionError) throw sessionError;
      sessionId = newSession.id;
    }

    // Navigate to call page as initiator
    window.location.href = `/call/${sessionId}?initiator=true`;
  } catch (error) {
    console.error('Error joining call:', error);
    toast({
      title: "Error",
      description: "Failed to join call. Please try again.",
      variant: "destructive",
    });
  }
};


  const fetchMenteeData = async () => {
    try {
      setLoading(true);

      // Fetch upcoming bookings
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('bookings')
        .select(`
          *,
          mentors(name, title)
        `)
        .eq('mentee_id', user?.id)
        .in('status', ['pending', 'confirmed'])
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .order('session_time', { ascending: true });

      if (upcomingError) {
        throw upcomingError;
      }

      const formattedUpcoming = (upcomingData || []).map((booking: any) => ({
        id: booking.id,
        mentor: booking.mentors?.name || 'Unknown Mentor',
        time: booking.session_time,
        date: new Date(booking.session_date).toLocaleDateString(),
        topic: booking.notes || 'General Mentoring Session',
        type: booking.session_type === 'video' ? 'Video Call' : 
              booking.session_type === 'audio' ? 'Audio Call' : 'Chat Session'
      }));

      setUpcomingSessions(formattedUpcoming);

      // Fetch completed sessions
      const { data: completedData, error: completedError } = await supabase
        .from('bookings')
        .select(`
          *,
          mentors(name, title),
          reviews(rating, review_text)
        `)
        .eq('mentee_id', user?.id)
        .eq('status', 'completed')
        .order('session_date', { ascending: false })
        .limit(10);

      if (completedError) {
        throw completedError;
      }

      const formattedCompleted = (completedData || []).map((booking: any) => ({
        id: booking.id,
        mentor: booking.mentors?.name || 'Unknown Mentor',
        date: new Date(booking.session_date).toLocaleDateString(),
        topic: booking.notes || 'General Mentoring Session',
        rating: booking.reviews?.[0]?.rating || 0,
        notes: booking.reviews?.[0]?.review_text || 'No review yet'
      }));

      setCompletedSessions(formattedCompleted);

      // Calculate stats
      const completedCount = completedData?.length || 0;
      const totalHours = completedCount * 1; // Assuming 1 hour per session
      
      // Get unique mentors count
      const uniqueMentors = new Set(completedData?.map(b => b.mentor_id)).size;
      
      // Calculate average rating given
      const ratingsGiven = completedData?.map(b => b.reviews?.[0]?.rating).filter(r => r) || [];
      const averageRating = ratingsGiven.length > 0 
        ? (ratingsGiven.reduce((sum: number, rating: number) => sum + rating, 0) / ratingsGiven.length).toFixed(1)
        : '0';

      setStats([
        { title: "Sessions Completed", value: completedCount.toString(), icon: BookOpen },
        { title: "Hours of Mentorship", value: totalHours.toString(), icon: Clock },
        { title: "Active Mentors", value: uniqueMentors.toString(), icon: User },
        { title: "Average Rating Given", value: averageRating, icon: Star }
      ]);

    } catch (error) {
      console.error('Error fetching mentee data:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Learning Journey</h1>
          <p className="text-muted-foreground">Track your progress and upcoming sessions with mentors.</p>
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
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
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
                        <h4 className="font-medium">{session.mentor}</h4>
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
                   <Button className="w-full" variant="outline" onClick={() => window.location.href = '/explore'}>
                     Book New Session
                   </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/explore'}>
                     <User className="mr-2 h-4 w-4" />
                     Find New Mentors
                   </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="mr-2 h-4 w-4" />
                    Set Learning Goals
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Mentors
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Leave Reviews
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Goals
                </CardTitle>
                <CardDescription>Track your progress towards your learning objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.goal}</h4>
                      <span className="text-sm text-muted-foreground">Target: {goal.target}</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{goal.progress}% complete</p>
                  </div>
                ))}
                <Button className="w-full" variant="outline">Add New Goal</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <CardDescription>Communicate with your mentors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No New Messages</h3>
                  <p className="text-muted-foreground mb-4">Start a conversation with your mentors</p>
                  <Button variant="outline">View All Conversations</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Review your completed mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{session.mentor}</h4>
                      <p className="text-sm text-muted-foreground">{session.topic}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                      <p className="text-sm">{session.notes}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-1">
                        {[...Array(session.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <Button size="sm" variant="outline">Book Again</Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">View All Sessions</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MenteeDashboard;