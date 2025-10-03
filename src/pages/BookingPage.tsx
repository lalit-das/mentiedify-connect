import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Video, Phone, MessageSquare, ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("video");
  const [notes, setNotes] = useState("");
  const [mentor, setMentor] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!mentorId) {
      navigate('/explore');
      return;
    }
    fetchMentorData();
  }, [mentorId, navigate]);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      
      // Fetch mentor details
      const { data: mentorData, error: mentorError } = await supabase
        .from('mentors')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (mentorError) {
        throw mentorError;
      }

      if (!mentorData) {
        toast({
          title: "Mentor not found",
          description: "The mentor you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/explore');
        return;
      }

      setMentor(mentorData);

      // Fetch mentor availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_available', true);

      if (availabilityError) {
        throw availabilityError;
      }

      setAvailability(availabilityData || []);
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      toast({
        title: "Error",
        description: "Failed to load mentor information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const packages = [
    {
      id: "single",
      name: "Single Session",
      duration: "60 minutes",
      price: mentor?.hourly_rate || 150,
      description: "One-time mentoring session"
    },
    {
      id: "monthly",
      name: "Monthly Package", 
      duration: "4 sessions (60 min each)",
      price: Math.round((mentor?.hourly_rate || 150) * 4 * 0.9),
      originalPrice: (mentor?.hourly_rate || 150) * 4,
      description: "Save 10% with monthly commitment"
    },
    {
      id: "intensive",
      name: "Intensive Package",
      duration: "8 sessions (60 min each)", 
      price: Math.round((mentor?.hourly_rate || 150) * 8 * 0.9),
      originalPrice: (mentor?.hourly_rate || 150) * 8,
      description: "Save 10% with intensive mentoring"
    }
  ];

  // Generate available slots from mentor availability
  const generateAvailableSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Next 14 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const dayAvailability = availability.filter(avail => avail.day_of_week === dayOfWeek);
      
      if (dayAvailability.length > 0) {
        const daySlots = [];
        dayAvailability.forEach(avail => {
          // Generate hourly slots between start and end time
          const startHour = parseInt(avail.start_time.split(':')[0]);
          const endHour = parseInt(avail.end_time.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            daySlots.push(`${hour.toString().padStart(2, '0')}:00`);
          }
        });
        
        if (daySlots.length > 0) {
          slots.push({
            date: date.toISOString().split('T')[0],
            slots: daySlots.sort()
          });
        }
      }
    }
    
    return slots;
  };

  const availableSlots = generateAvailableSlots();

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBooking(true);
      
      const selectedPkg = packages.find(p => p.id === selectedPackage);
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          session_date: selectedDate,
          session_time: selectedTime,
          session_type: sessionType,
          package_type: selectedPackage,
          price: selectedPkg?.price || 0,
          duration: 60,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Booking confirmed!",
        description: "Your session has been booked. The mentor will be notified.",
      });

      // Navigate to dashboard or booking confirmation page
      navigate('/mentee-dashboard');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
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

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
            <p className="text-muted-foreground mb-4">The mentor you're looking for doesn't exist.</p>
            <Link to="/explore">
              <Button>Browse Mentors</Button>
            </Link>
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
        <div className="mb-6">
          <Link to="/explore" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentors
          </Link>
          <h1 className="text-3xl font-bold">Book a Session</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mentor Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={mentor.profile_image_url || "/placeholder.svg"}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <p className="text-muted-foreground">{mentor.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{mentor.rating || 0}</span>
                        <div className="flex ml-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">({mentor.total_reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Usually responds within {mentor.response_time_hours || 24} hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose a Package</CardTitle>
                <CardDescription>Select the mentoring package that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage} className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={pkg.id} id={pkg.id} />
                      <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{pkg.name}</h4>
                            <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                            <p className="text-sm text-muted-foreground">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${pkg.price}</div>
                            {pkg.originalPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                ${pkg.originalPrice}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Session Type */}
            <Card>
              <CardHeader>
                <CardTitle>Session Type</CardTitle>
                <CardDescription>Choose how you'd like to conduct your session</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={sessionType} onValueChange={setSessionType} className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                      <Video className="h-4 w-4" />
                      Video Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="audio" id="audio" />
                    <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                      <Phone className="h-4 w-4" />
                      Audio Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="chat" id="chat" />
                    <Label htmlFor="chat" className="flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4" />
                      Text Chat
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>Choose your preferred session date and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableSlots.map((daySlot) => (
                  <div key={daySlot.date} className="space-y-2">
                    <h4 className="font-medium">
                      {new Date(daySlot.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {daySlot.slots.map((time) => (
                        <Button
                          key={`${daySlot.date}-${time}`}
                          variant={selectedDate === daySlot.date && selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedDate(daySlot.date);
                            setSelectedTime(time);
                          }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Session Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
                <CardDescription>Let your mentor know what you'd like to focus on</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your goals, specific topics you'd like to discuss, or any questions you have..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Package</span>
                  <span>{packages.find(p => p.id === selectedPackage)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Session Type</span>
                  <span className="capitalize">{sessionType} Call</span>
                </div>
                {selectedDate && selectedTime && (
                  <div className="flex justify-between">
                    <span>Date & Time</span>
                    <span>
                      {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${packages.find(p => p.id === selectedPackage)?.price}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || booking}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {booking ? "Processing..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;