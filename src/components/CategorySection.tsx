import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Code, 
  Briefcase, 
  Palette, 
  Heart, 
  GraduationCap, 
  TrendingUp,
  Lightbulb,
  Globe,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    id: "technology",
    name: "Technology",
    icon: Code,
    description: "Software development, AI, cybersecurity, and more",
    mentorCount: "2.5K+ mentors",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    description: "Entrepreneurship, strategy, leadership, and management",
    mentorCount: "1.8K+ mentors",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "design",
    name: "Design",
    icon: Palette,
    description: "UI/UX, graphic design, product design, and branding",
    mentorCount: "1.2K+ mentors",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: Heart,
    description: "Medical advice, fitness, nutrition, and mental health",
    mentorCount: "900+ mentors",
    color: "from-red-500 to-orange-500"
  },
  {
    id: "academics",
    name: "Academics",
    icon: GraduationCap,
    description: "Research, writing, education, and academic careers",
    mentorCount: "1.5K+ mentors",
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "finance",
    name: "Finance",
    icon: TrendingUp,
    description: "Investment, accounting, financial planning, and analysis",
    mentorCount: "800+ mentors",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "creative",
    name: "Creative Arts",
    icon: Lightbulb,
    description: "Writing, music, photography, and creative industries",
    mentorCount: "600+ mentors",
    color: "from-pink-500 to-purple-500"
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Globe,
    description: "Digital marketing, content strategy, and brand building",
    mentorCount: "1.1K+ mentors",
    color: "from-teal-500 to-green-500"
  }
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Explore Mentorship Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find expert mentors in your field of interest. From technology to creative arts, 
            our diverse community of professionals is here to guide your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-gradient-card border-0 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 min-h-[50px]">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    {category.mentorCount}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-fade-in">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
          >
            View All Categories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;