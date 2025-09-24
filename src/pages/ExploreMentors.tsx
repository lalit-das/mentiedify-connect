import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Calendar, Award, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Mentor {
  id: string;
  name: string;
  title: string;
  bio?: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  expertise: string[];
  profile_image_url?: string;
  is_verified: boolean;
  years_experience: number;
  availability_status: string;
  session_types: string[];
}

const ExploreMentors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast({
        title: "Error",
        description: "Failed to load mentors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Technology", label: "Technology" },
    { value: "Business", label: "Business" },
    { value: "Design", label: "Design" },
    { value: "Marketing", label: "Marketing" },
    { value: "Finance", label: "Finance" }
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-50", label: "$0 - $50" },
    { value: "50-100", label: "$50 - $100" },
    { value: "100-200", label: "$100 - $200" },
    { value: "200+", label: "$200+" }
  ];

  const filteredMentors = mentors.filter(mentor => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = mentor.name.toLowerCase().includes(query);
      const matchesTitle = mentor.title?.toLowerCase().includes(query);
      const matchesExpertise = mentor.expertise?.some(skill => 
        skill.toLowerCase().includes(query)
      );
      
      if (!matchesName && !matchesTitle && !matchesExpertise) {
        return false;
      }
    }

    // Category filter (simplified - using expertise for now)
    if (selectedCategory !== "all") {
      const hasCategory = mentor.expertise?.some(skill => 
        skill.toLowerCase().includes(selectedCategory.toLowerCase())
      );
      if (!hasCategory) return false;
    }

    // Price filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(p => p.replace("+", ""));
      const rate = mentor.hourly_rate || 0;
      
      if (max) {
        if (rate < parseInt(min) || rate > parseInt(max)) return false;
      } else {
        if (rate < parseInt(min)) return false;
      }
    }

    return true;
  });

  // Sort mentors
  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price-low':
        return (a.hourly_rate || 0) - (b.hourly_rate || 0);
      case 'price-high':
        return (b.hourly_rate || 0) - (a.hourly_rate || 0);
      case 'reviews':
        return (b.total_reviews || 0) - (a.total_reviews || 0);
      default:
        return 0;
    }
  });

  const toggleFavorite = (mentorId: string) => {
    setFavorites(prev => 
      prev.includes(mentorId) 
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const handleBookSession = (mentorId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session.",
      });
      navigate('/auth');
      return;
    }
    navigate(`/booking?mentor=${mentorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mentors...</p>
        </div>
      </div>
    );
  }

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
              Showing {sortedMentors.length} mentors
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedMentors.map((mentor, index) => (
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
                      src={mentor.profile_image_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`} 
                      alt={mentor.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300"
                    />
                    {mentor.is_verified && (
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
                    <p className="text-sm font-medium text-primary">{mentor.years_experience}+ years experience</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{mentor.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-muted-foreground">({mentor.total_reviews || 0} reviews)</span>
                    </div>
                    <span className="text-lg font-bold text-primary">${mentor.hourly_rate || 0}/hr</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{mentor.availability_status}</span>
                    </div>
                    <div className="text-sm text-success font-medium">
                      {mentor.session_types?.join(', ') || 'Multiple session types available'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    )) || []}
                    {mentor.expertise && mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise.length - 3}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mentor.bio || 'Professional mentor ready to help you achieve your goals.'}
                  </p>

                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                      size="sm"
                      onClick={() => handleBookSession(mentor.id)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => navigate(`/mentor/${mentor.id}`)}
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