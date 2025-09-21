import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, Video, Phone, MessageSquare, ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BookingPage = () => {
  const { mentorId } = useParams();
  const [selectedPackage, setSelectedPackage] = useState("single");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("video");
  const [notes, setNotes] = useState("");

  // Mock mentor data - in real app, fetch based on mentorId
  const mentor = {
    id: 1,
    name: "Dr. Sarah Wilson",
    title: "Senior Product Manager",
    company: "Google",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 150,
    profileImage: "/placeholder.svg",
    expertise: ["Product Strategy", "Leadership", "Career Growth"],
    responseTime: "Usually responds within 2 hours"
  };

  const packages = [
    {
      id: "single",
      name: "Single Session",
      duration: "60 minutes",
      price: 150,
      description: "One-time mentoring session"
    },
    {
      id: "monthly",
      name: "Monthly Package",
      duration: "4 sessions (60 min each)",
      price: 540,
      originalPrice: 600,
      description: "Save 10% with monthly commitment"
    },
    {
      id: "intensive",
      name: "Intensive Package",
      duration: "8 sessions (60 min each)",
      price: 1080,
      originalPrice: 1200,
      description: "Save 10% with intensive mentoring"
    }
  ];

  const availableSlots = [
    { date: "2024-01-20", slots: ["09:00", "10:30", "14:00", "16:00"] },
    { date: "2024-01-21", slots: ["10:00", "11:30", "15:00"] },
    { date: "2024-01-22", slots: ["09:30", "13:00", "17:00"] }
  ];

  const handleBooking = () => {
    // Handle booking logic here
    console.log("Booking details:", {
      mentorId,
      package: selectedPackage,
      date: selectedDate,
      time: selectedTime,
      sessionType,
      notes
    });
  };

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
                    src={mentor.profileImage}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <p className="text-muted-foreground">{mentor.title}</p>
                    <p className="text-sm text-muted-foreground">{mentor.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{mentor.rating}</span>
                        <div className="flex ml-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">({mentor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{mentor.responseTime}</p>
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
                  disabled={!selectedDate || !selectedTime}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Booking
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