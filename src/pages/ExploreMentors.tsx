import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Calendar, Award, Heart } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b526?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 247,
    price: 120,
    location: "San Francisco, CA",
    expertise: ["React", "Node.js", "System Design", "Career Growth"],
    verified: true,
    category: "Technology",
    experience: "10+ years",
    description: "10+ years of experience building scalable web applications. Specialized in helping developers transition to senior roles.",
    availability: "Available this week"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "VP of Product",
    company: "Stripe",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 189,
    price: 200,
    location: "New York, NY",
    expertise: ["Product Strategy", "Leadership", "Go-to-Market", "Analytics"],
    verified: true,
    category: "Business",
    experience: "12+ years",
    description: "Led product teams from 0 to 100M+ users. Expert in product-market fit and scaling strategies.",
    availability: "Available next week"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Design Director",
    company: "Airbnb",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5.0,
    reviews: 156,
    price: 150,
    location: "San Francisco, CA",
    expertise: ["UX Design", "Design Systems", "User Research", "Team Leadership"],
    verified: true,
    category: "Design",
    experience: "8+ years",
    description: "Award-winning designer with expertise in creating user-centered experiences for global platforms.",
    availability: "Available today"
  },
  {
    id: 4,
    name: "David Park",
    title: "Startup Founder & CEO",
    company: "TechVenture (Acquired)",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 203,
    price: 180,
    location: "Austin, TX",
    expertise: ["Entrepreneurship", "Fundraising", "Business Strategy", "Team Building"],
    verified: true,
    category: "Business",
    experience: "15+ years",
    description: "Successfully built and exited 2 startups. Now helping entrepreneurs navigate the startup journey.",
    availability: "Available this week"
  },
  {
    id: 5,
    name: "Dr. Rachel Kim",
    title: "Clinical Psychologist",
    company: "Stanford Health",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 134,
    price: 100,
    location: "Palo Alto, CA",
    expertise: ["Mental Health", "Wellness Coaching", "Stress Management", "Work-Life Balance"],
    verified: true,
    category: "Health",
    experience: "7+ years",
    description: "Licensed clinical psychologist specializing in professional wellness and mental health strategies.",
    availability: "Available this week"
  },
  {
    id: 6,
    name: "Prof. James Wilson",
    title: "Computer Science Professor",
    company: "MIT",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 98,
    price: 80,
    location: "Cambridge, MA",
    expertise: ["Research", "Academic Writing", "PhD Guidance", "Publications"],
    verified: true,
    category: "Academics",
    experience: "20+ years",
    description: "Tenured professor with 50+ publications. Helps students and researchers navigate academic careers.",
    availability: "Available next week"
  }
];

const ExploreMentors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Technology", label: "Technology" },
    { value: "Business", label: "Business" },
    { value: "Design", label: "Design" },
    { value: "Health", label: "Health & Wellness" },
    { value: "Academics", label: "Academics" }
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-100", label: "$0 - $100" },
    { value: "100-150", label: "$100 - $150" },
    { value: "150-200", label: "$150 - $200" },
    { value: "200+", label: "$200+" }
  ];

  const filteredMentors = mentors.filter(mentor => {
    if (searchQuery && !mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    if (selectedCategory !== "all" && mentor.category !== selectedCategory) {
      return false;
    }
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(p => p.replace("+", ""));
      if (max) {
        if (mentor.price < parseInt(min) || mentor.price > parseInt(max)) return false;
      } else {
        if (mentor.price < parseInt(min)) return false;
      }
    }
    return true;
  });

  const toggleFavorite = (mentorId: number) => {
    setFavorites(prev => 
      prev.includes(mentorId) 
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Mentor
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Browse through our curated list of expert mentors across various industries. 
              Filter by expertise, price, location, and more to find your ideal match.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card p-6 rounded-2xl shadow-md mb-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, skill, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredMentors.length} mentors
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor, index) => (
              <Card 
                key={mentor.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-gradient-card border-0 overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="relative">
                  <button
                    onClick={() => toggleFavorite(mentor.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favorites.includes(mentor.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>

                  <div className="relative mx-auto">
                    <img 
                      src={mentor.image} 
                      alt={mentor.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300"
                    />
                    {mentor.verified && (
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center ring-4 ring-white">
                        <Award className="h-4 w-4 text-white" />
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-sm text-muted-foreground">({mentor.reviews} reviews)</span>
                    </div>
                    <span className="text-lg font-bold text-primary">${mentor.price}/hr</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{mentor.location}</span>
                    </div>
                    <div className="text-sm text-success font-medium">
                      {mentor.availability}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise.length - 3}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.description}
                  </p>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Load More Mentors
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExploreMentors;