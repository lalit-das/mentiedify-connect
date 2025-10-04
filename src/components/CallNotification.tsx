import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [ringingAudio] = useState(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77eeeTRAMUKfj8LZjHAY4ktjyzHksBSN2x/DdkUEKFF607OunVRQKRp/g8r5sIQUrgs/y2Yk2CBhmuOznoU0QDFCn4/C2YxwGOJLZ8s15LAUkdsfw3pFBChRete3rpVUUCkaf4O++bCEFK4PP8tmJNwgYZ7js56FNEQ1Sp+Pwtl8cBjiS2vLMeSwFJHbH8N+RQAoUXLTt66VVFApGn+DvvmwhBSuD0PLZiTcHGGi57OehTRENUqfk77ZfHAU4ktv4');
    audio.loop = true;
    return audio;
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('call-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `callee_id=eq.${user.id}`
        },
        async (payload) => {
          const callSession = payload.new;

          if (callSession.status === 'initiated') {
            try {
              const { data: booking } = await supabase
                .from('bookings')
                .select('id, mentor_id, mentee_id')
                .eq('id', callSession.booking_id)
                .single();

              if (!booking) return;

              const { data: mentor } = await supabase
                .from('mentors')
                .select('name, profile_image_url, user_id')
                .eq('id', booking.mentor_id)
                .single();

              const { data: mentee } = await supabase
                .from('users')
                .select('first_name, last_name, profile_image_url')
                .eq('id', booking.mentee_id)
                .single();

              const isMentorCaller = callSession.caller_id === mentor?.user_id;
              const callerName = isMentorCaller
                ? mentor?.name
                : `${mentee?.first_name} ${mentee?.last_name}`;
              const callerAvatar = isMentorCaller
                ? mentor?.profile_image_url
                : mentee?.profile_image_url;

              setIncomingCall({
                sessionId: callSession.id,
                callerId: callSession.caller_id,
                callerName: callerName || 'Unknown',
                callerAvatar,
                bookingId: callSession.booking_id
              });

              ringingAudio.play().catch(console.error);

              toast({
                title: 'Incoming Call',
                description: `${callerName} is calling you`,
              });
            } catch (error) {
              console.error('Error fetching caller info:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      ringingAudio.pause();
      ringingAudio.currentTime = 0;
    };
  }, [user, toast, ringingAudio]);

  const handleAnswer = () => {
    ringingAudio.pause();
    ringingAudio.currentTime = 0;

    if (incomingCall) {
      window.location.href = `/call/${incomingCall.sessionId}?initiator=false`;
    }
  };

  const handleReject = async () => {
    ringingAudio.pause();
    ringingAudio.currentTime = 0;

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
        console.error('Error rejecting call:', error);
      }
    }

    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={incomingCall.callerAvatar} />
                <AvatarFallback>
                  {incomingCall.callerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <Video className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl">{incomingCall.callerName}</CardTitle>
          <p className="text-muted-foreground">Incoming video call...</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-16 w-16"
              onClick={handleReject}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600"
              onClick={handleAnswer}
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
