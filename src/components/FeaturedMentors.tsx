import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Award } from "lucide-react";

const featuredMentors = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b526?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    sessions: 247,
    price: "$120/hour",
    location: "San Francisco, CA",
    expertise: ["React", "Node.js", "System Design", "Career Growth"],
    verified: true,
    description: "10+ years of experience building scalable web applications. Specialized in helping developers transition to senior roles."
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "VP of Product",
    company: "Stripe",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    sessions: 189,
    price: "$200/hour",
    location: "New York, NY",
    expertise: ["Product Strategy", "Leadership", "Go-to-Market", "Analytics"],
    verified: true,
    description: "Led product teams from 0 to 100M+ users. Expert in product-market fit and scaling strategies."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Design Director",
    company: "Airbnb",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5.0,
    sessions: 156,
    price: "$150/hour",
    location: "San Francisco, CA",
    expertise: ["UX Design", "Design Systems", "User Research", "Team Leadership"],
    verified: true,
    description: "Award-winning designer with expertise in creating user-centered experiences for global platforms."
  },
  {
    id: 4,
    name: "David Park",
    title: "Startup Founder & CEO",
    company: "TechVenture (Acquired)",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    sessions: 203,
    price: "$180/hour",
    location: "Austin, TX",
    expertise: ["Entrepreneurship", "Fundraising", "Business Strategy", "Team Building"],
    verified: true,
    description: "Successfully built and exited 2 startups. Now helping entrepreneurs navigate the startup journey."
  }
];

const FeaturedMentors = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Featured Mentors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with industry leaders who have been where you want to go. 
            Learn from their experience and accelerate your growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredMentors.map((mentor, index) => (
            <Card 
              key={mentor.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-gradient-card border-0 overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="relative pb-4">
                <div className="relative mx-auto">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300"
                  />
                  {mentor.verified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">{mentor.title}</p>
                  <p className="text-sm font-medium text-primary">{mentor.company}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{mentor.rating}</span>
                    <span className="text-muted-foreground">({mentor.sessions})</span>
                  </div>
                  <span className="font-semibold text-primary">{mentor.price}</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{mentor.location}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 2).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 2}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.description}
                </p>

                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-fade-in">
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            View All Mentors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMentors;