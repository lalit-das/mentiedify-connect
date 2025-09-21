import { useState } from "react";
import { Camera, Edit3, MapPin, Calendar, Award, BookOpen, Users, Star, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data - in real app, fetch from Supabase
  const user = {
    id: 1,
    name: "Emma Johnson",
    title: "Product Manager",
    company: "TechCorp",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    profileImage: "/placeholder.svg",
    bio: "Passionate product manager with 5+ years of experience in scaling digital products. I love mentoring aspiring PMs and sharing insights about product strategy, user research, and team leadership.",
    expertise: ["Product Strategy", "User Research", "Team Leadership", "Agile Development"],
    interests: ["AI/ML", "SaaS", "Mobile Apps", "UX Design"],
    stats: {
      sessionsCompleted: 42,
      hoursOfMentorship: 63,
      rating: 4.8,
      totalReviews: 28
    },
    goals: [
      { name: "Complete Advanced Product Strategy Course", progress: 75, target: "Dec 2024" },
      { name: "Mentor 50+ aspiring PMs", progress: 84, target: "Jan 2025" },
      { name: "Launch 3 successful product features", progress: 33, target: "Jun 2024" }
    ]
  };

  const achievements = [
    { id: 1, title: "First Session Complete", description: "Completed your first mentoring session", date: "March 2023", icon: BookOpen },
    { id: 2, title: "Rising Star", description: "Received 10+ five-star reviews", date: "June 2023", icon: Star },
    { id: 3, title: "Mentor of the Month", description: "Top-rated mentor for July 2023", date: "July 2023", icon: Award },
    { id: 4, title: "Community Builder", description: "Helped 25+ mentees achieve their goals", date: "September 2023", icon: Users }
  ];

  const recentActivity = [
    { id: 1, type: "session", description: "Completed session with Alex Chen on Product Strategy", date: "2 days ago" },
    { id: 2, type: "review", description: "Received 5-star review from Sarah Wilson", date: "3 days ago" },
    { id: 3, type: "goal", description: "Updated learning goal: Advanced Product Strategy", date: "1 week ago" },
    { id: 4, type: "achievement", description: "Earned 'Community Builder' achievement", date: "2 weeks ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full p-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                    <p className="text-lg text-muted-foreground mb-2">{user.title} at {user.company}</p>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                      <Calendar className="h-4 w-4 ml-4 mr-1" />
                      Joined {user.joinDate}
                    </div>
                    <p className="text-sm max-w-2xl">{user.bio}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{user.stats.sessionsCompleted}</div>
              <p className="text-sm text-muted-foreground">Sessions Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{user.stats.hoursOfMentorship}</div>
              <p className="text-sm text-muted-foreground">Hours of Mentorship</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{user.stats.rating}</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{user.stats.totalReviews}</div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
                <CardDescription>Track your progress towards your professional objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.goals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className="text-sm text-muted-foreground">Target: {goal.target}</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{goal.progress}% complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Milestones you've reached in your mentorship journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <achievement.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle>Areas of Interest</CardTitle>
                <CardDescription>Topics and fields you're passionate about</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" className="mt-4">
                  Add More Interests
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

export default ProfilePage;