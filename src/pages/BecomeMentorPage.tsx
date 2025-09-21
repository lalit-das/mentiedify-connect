import { useState } from "react";
import { Check, ArrowRight, Star, Users, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BecomeMentorPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    title: "",
    experience: "",
    expertise: "",
    hourlyRate: "",
    bio: ""
  });

  const benefits = [
    {
      title: "Flexible Schedule",
      description: "Set your own availability and work when it suits you",
      icon: Clock
    },
    {
      title: "Competitive Earnings",
      description: "Earn $50-300+ per hour based on your expertise",
      icon: DollarSign
    },
    {
      title: "Global Reach",
      description: "Connect with mentees from around the world",
      icon: Users
    },
    {
      title: "Build Your Brand",
      description: "Establish yourself as a thought leader in your field",
      icon: Star
    }
  ];

  const requirements = [
    "5+ years of professional experience in your field",
    "Strong communication and interpersonal skills",
    "Passion for helping others grow and succeed",
    "Reliable internet connection for video calls",
    "Commitment to maintaining professional standards"
  ];

  const process = [
    {
      step: "1",
      title: "Apply",
      description: "Submit your application with your background and expertise"
    },
    {
      step: "2",
      title: "Review",
      description: "Our team reviews your application within 48 hours"
    },
    {
      step: "3",
      title: "Interview",
      description: "Complete a brief video interview to assess fit"
    },
    {
      step: "4",
      title: "Onboard",
      description: "Complete onboarding and start accepting mentees"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Williams",
      role: "Senior Product Manager",
      company: "Google",
      quote: "Mentoring through MentiEdify has been incredibly rewarding. I've helped 50+ people advance their careers while building meaningful connections.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Tech Lead",
      company: "Amazon",
      quote: "The platform makes it easy to manage my mentoring schedule. I love seeing my mentees grow and achieve their goals.",
      rating: 5
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your Expertise,
              <br />
              <span className="text-primary">Shape the Future</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of professionals who are making a difference by mentoring 
              the next generation. Earn competitive rates while giving back to your community.
            </p>
            <Button size="lg" className="mb-8">
              Start Your Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">$150</div>
                <div className="text-sm text-muted-foreground">Average hourly rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2,500+</div>
                <div className="text-sm text-muted-foreground">Active mentors</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground">Mentor satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Mentor with MentiEdify?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join a platform designed by mentors, for mentors. We handle the logistics 
                so you can focus on what you do best.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process gets you up and running as a mentor in just a few days.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold mb-6">Requirements</h2>
                <p className="text-muted-foreground mb-8">
                  We maintain high standards to ensure the best experience for our community. 
                  Here's what we look for in our mentors:
                </p>
                <div className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                  <CardDescription>
                    Tell us about yourself and your expertise. This usually takes 5-10 minutes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Current Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        type="number"
                        min="5"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expertise">Areas of Expertise (comma separated)</Label>
                      <Input
                        id="expertise"
                        name="expertise"
                        placeholder="e.g. Product Management, Leadership, Career Development"
                        value={formData.expertise}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Desired Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        min="25"
                        max="500"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Tell us about your background, achievements, and what you're passionate about mentoring..."
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Submit Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Mentors Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Hear from successful mentors who are making a difference on our platform.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <img
                        src="/placeholder.svg"
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make an Impact?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of expert mentors and start sharing your knowledge today. 
              Your experience could be the key to someone's breakthrough.
            </p>
            <Button size="lg" variant="secondary">
              Start Your Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeMentorPage;