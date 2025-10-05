import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface IncomingCall {
  sessionId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  bookingId: string;
}

export const CallNotification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!user) return;

    console.log('📞 Setting up call notification listener for user:', user.id);

    // Listen for new call sessions where user is the callee
    const channel = supabase
      .channel('call-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `callee_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 Incoming call detected:', payload);
          const callSession = payload.new;

          if (callSession.status === 'initiated') {
            try {
              // Get booking details
              const { data: booking } = await supabase
                .from('bookings')
                .select('id, mentor_id, mentee_id')
                .eq('id', callSession.booking_id)
                .single();

              if (!booking) return;

              // Get mentor details
              const { data: mentor } = await supabase
                .from('mentors')
                .select('name, profile_image_url, user_id')
                .eq('id', booking.mentor_id)
                .single();

              // Get mentee details
              const { data: mentee } = await supabase
                .from('users')
                .select('first_name, last_name, profile_image_url')
                .eq('id', booking.mentee_id)
                .single();

              // Determine caller
              const isMentorCaller = callSession.caller_id === mentor?.user_id;
              const callerName = isMentorCaller
                ? mentor?.name || 'Unknown Mentor'
                : `${mentee?.first_name} ${mentee?.last_name}` || 'Unknown User';
              const callerAvatar = isMentorCaller
                ? mentor?.profile_image_url
                : mentee?.profile_image_url;

              console.log('📞 Incoming call from:', callerName);

              setIncomingCall({
                sessionId: callSession.id,
                callerId: callSession.caller_id,
                callerName,
                callerAvatar,
                bookingId: callSession.booking_id
              });

              toast({
                title: '📞 Incoming Call',
                description: `${callerName} is calling you`,
              });
            } catch (error) {
              console.error('❌ Error fetching caller info:', error);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Call notification channel status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up call notification listener');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleAnswer = () => {
    console.log('✅ Answering call:', incomingCall?.sessionId);
    if (incomingCall) {
      navigate(`/call/${incomingCall.sessionId}?initiator=false`);
      setIncomingCall(null);
    }
  };

  const handleReject = async () => {
    console.log('❌ Rejecting call:', incomingCall?.sessionId);
    if (incomingCall) {
      try {
        await supabase
          .from('call_sessions')
          .update({ status: 'failed' })
          .eq('id', incomingCall.sessionId);

        toast({
          title: 'Call Declined',
          description: 'You declined the incoming call',
        });
      } catch (error) {
        console.error('❌ Error rejecting call:', error);
      }
    }
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-green-500 ring-offset-4 animate-pulse">
                <AvatarImage src={incomingCall.callerAvatar} />
                <AvatarFallback className="text-2xl">
                  {incomingCall.callerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 animate-bounce">
                <Video className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">{incomingCall.callerName}</CardTitle>
          <p className="text-muted-foreground text-lg">Incoming video call...</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 justify-center">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16 shadow-lg hover:scale-110 transition-transform"
              onClick={handleReject}
              title="Decline call"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600 shadow-lg hover:scale-110 transition-transform"
              onClick={handleAnswer}
              title="Answer call"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
