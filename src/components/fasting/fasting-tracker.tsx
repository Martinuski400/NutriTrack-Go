'use client';

import * as React from 'react';
import { Play, Pause, Settings, RefreshCw, Bell, BellOff } from 'lucide-react'; // Added Bell icons
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils'; // Import cn utility
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip

// Define common fasting plans
const fastingPlans = {
  '16:8': { fastingHours: 16, eatingHours: 8, label: '16:8 (16h Fast, 8h Eat)' },
  '18:6': { fastingHours: 18, eatingHours: 6, label: '18:6 (18h Fast, 6h Eat)' },
  '20:4': { fastingHours: 20, eatingHours: 4, label: '20:4 (20h Fast, 4h Eat)' },
  // 'omad': { fastingHours: 23, eatingHours: 1, label: 'OMAD (One Meal A Day)' }, // Example
};
type FastingPlanKey = keyof typeof fastingPlans;

interface FastingPlan {
  key: FastingPlanKey;
  fastingHours: number;
  eatingHours: number;
  // Start time of the *eating* window (HH:MM format)
  eatingStartTime: string;
}

type FastingPhase = 'idle' | 'fasting' | 'eating';

interface RemainingTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

const DEFAULT_PLAN_KEY: FastingPlanKey = '16:8';
const DEFAULT_EATING_START_TIME = '12:00'; // Default eating window starts at noon

// Helper to get default plan details
const getDefaultPlan = (): FastingPlan => ({
  key: DEFAULT_PLAN_KEY,
  ...fastingPlans[DEFAULT_PLAN_KEY],
  eatingStartTime: DEFAULT_EATING_START_TIME,
});

// Function to show notification (if permission granted)
const showPhaseEndNotification = (currentPhase: FastingPhase, nextPhase: FastingPhase) => {
    if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(`Fasting Phase Ended`, {
                body: `Your ${currentPhase} phase is over. Starting ${nextPhase} phase now.`,
                icon: '/icons/icon-192x192.png', // Optional: Add an icon
                badge: '/icons/icon-192x192.png', // Optional: Badge for Android
                // Note: Continuous real-time updates in the notification itself are not feasible for PWAs when closed.
                // This notification serves as an alert for the phase change.
                tag: 'fasting-phase-end', // Allows replacing previous notifications with the same tag
                renotify: true, // Notify even if a notification with the same tag exists
            });
        });
    } else if ('Notification' in window && Notification.permission === 'default') {
        console.log('Notification permission not yet requested or denied.');
        // Optionally prompt the user again here if desired, but avoid being intrusive.
    } else if ('Notification' in window && Notification.permission === 'denied') {
        console.log('Notification permission was denied.');
    } else {
        console.log('Notifications not supported by this browser or service worker not available.');
    }
};

export default function FastingTracker() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [plan, setPlan] = React.useState<FastingPlan>(getDefaultPlan());
  const [currentPhase, setCurrentPhase] = React.useState<FastingPhase>('idle');
  // Timestamp (ms) when the current phase started
  const [phaseStartTime, setPhaseStartTime] = React.useState<number | null>(null);
  const [remainingTime, setRemainingTime] = React.useState<RemainingTime | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>('default');

   // Check and store notification permission status on mount
   React.useEffect(() => {
     if ('Notification' in window) {
       setNotificationPermission(Notification.permission);
     }
     setIsLoading(false); // Moved loading state update here
   }, []);


  // Load state from localStorage
  React.useEffect(() => {
    // setIsLoading(true); // Already set in the first effect
    let loadedPlan = getDefaultPlan();
    let loadedPhase: FastingPhase = 'idle';
    let loadedStartTime: number | null = null;

    try {
        const savedPlan = localStorage.getItem('nutri_fastingPlan');
        const savedPhase = localStorage.getItem('nutri_fastingCurrentPhase');
        const savedStartTime = localStorage.getItem('nutri_fastingPhaseStartTime');

        if (savedPlan) loadedPlan = JSON.parse(savedPlan);
        if (savedPhase) loadedPhase = savedPhase as FastingPhase;
        if (savedStartTime) loadedStartTime = parseInt(savedStartTime, 10);

        // Validate loaded data
        if (!fastingPlans[loadedPlan.key as FastingPlanKey]) {
            loadedPlan = getDefaultPlan(); // Reset if plan key is invalid
        }
        if (!['idle', 'fasting', 'eating'].includes(loadedPhase)) {
            loadedPhase = 'idle'; // Reset if phase is invalid
        }
         if (isNaN(loadedStartTime ?? NaN)) {
            loadedStartTime = null; // Reset if start time is invalid
         }

    } catch (error) {
        console.error("Error loading fasting state:", error);
        // Reset to defaults on error
        loadedPlan = getDefaultPlan();
        loadedPhase = 'idle';
        loadedStartTime = null;
        localStorage.removeItem('nutri_fastingPlan');
        localStorage.removeItem('nutri_fastingCurrentPhase');
        localStorage.removeItem('nutri_fastingPhaseStartTime');
    }

    setPlan(loadedPlan);
    setCurrentPhase(loadedPhase);
    setPhaseStartTime(loadedStartTime);
    // setIsLoading(false); // Moved to the first effect
  }, []); // Removed isLoading dependency


  // Save state to localStorage
  React.useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('nutri_fastingPlan', JSON.stringify(plan));
      localStorage.setItem('nutri_fastingCurrentPhase', currentPhase);
      if (phaseStartTime !== null) {
        localStorage.setItem('nutri_fastingPhaseStartTime', phaseStartTime.toString());
      } else {
        localStorage.removeItem('nutri_fastingPhaseStartTime');
      }
    }
  }, [plan, currentPhase, phaseStartTime, isLoading]);


    // Timer logic using Date object after hydration
  React.useEffect(() => {
    if (isLoading || currentPhase === 'idle' || phaseStartTime === null) {
      setRemainingTime(null);
      setProgress(0);
      return; // Don't run timer if idle or loading
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const phaseDurationHours = currentPhase === 'fasting' ? plan.fastingHours : plan.eatingHours;
      const phaseDurationMs = phaseDurationHours * 60 * 60 * 1000;
      const phaseEndTime = phaseStartTime + phaseDurationMs;
      const totalSecondsRemaining = Math.max(0, Math.round((phaseEndTime - now) / 1000));

      if (totalSecondsRemaining === 0) {
        // Phase finished, transition to the next phase
        const nextPhase: FastingPhase = currentPhase === 'fasting' ? 'eating' : 'fasting';

         // Show notification for phase end *before* updating state
         showPhaseEndNotification(currentPhase, nextPhase);

        // Update state
        setCurrentPhase(nextPhase);
        setPhaseStartTime(phaseEndTime); // Start the new phase exactly when the old one ended

         // Show toast notification
         toast({
           title: `Time's Up!`,
           description: `Your ${currentPhase} phase has ended. Starting ${nextPhase} phase.`,
         });

      } else {
        const hours = Math.floor(totalSecondsRemaining / 3600);
        const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
        const seconds = totalSecondsRemaining % 60;
        const totalPhaseSeconds = phaseDurationHours * 3600;
        const elapsedSeconds = totalPhaseSeconds - totalSecondsRemaining;
        const currentProgress = Math.min(100, Math.max(0, (elapsedSeconds / totalPhaseSeconds) * 100));

        setRemainingTime({ hours, minutes, seconds, totalSeconds: totalSecondsRemaining });
        setProgress(currentProgress);
      }
    };

    // Run immediately and then set interval
    calculateRemaining();
    const intervalId = setInterval(calculateRemaining, 1000);

    // Cleanup interval on unmount or when phase changes
    return () => clearInterval(intervalId);

    // Exclude setRemainingTime and setProgress from deps as they are stable setters
  }, [currentPhase, phaseStartTime, plan, isLoading, toast]); // Added toast to dependency array


  const startFast = () => {
    const now = Date.now();
    setCurrentPhase('fasting');
    setPhaseStartTime(now);
    toast({ title: 'Fast Started', description: `Your ${plan.fastingHours}-hour fast has begun.` });
  };

  const startEating = () => {
    const now = Date.now();
    setCurrentPhase('eating');
    setPhaseStartTime(now);
    toast({ title: 'Eating Window Started', description: `Your ${plan.eatingHours}-hour eating window has begun.` });
  };

  const stopCycle = () => {
    setCurrentPhase('idle');
    setPhaseStartTime(null);
    setRemainingTime(null);
    setProgress(0);
    toast({ title: 'Fasting Cycle Stopped', variant: 'destructive' });
  };

  // Function to handle saving settings from the dialog
  const handleSaveSettings = (newPlanKey: FastingPlanKey, newEatingStartTime: string) => {
    const newPlanDetails = fastingPlans[newPlanKey];
    const updatedPlan: FastingPlan = {
      key: newPlanKey,
      ...newPlanDetails,
      eatingStartTime: newEatingStartTime,
    };
    setPlan(updatedPlan);

    // Optional: Reset the cycle when settings change to avoid confusion
    stopCycle();

    toast({ title: 'Settings Saved', description: `Fasting plan updated to ${newPlanDetails.label}. Cycle stopped.` });
    setIsSettingsOpen(false); // Close the dialog
  };

   // Function to request notification permission
   const requestNotificationPermission = async () => {
       if (!('Notification' in window)) {
           toast({ title: 'Notifications Not Supported', description: 'Your browser does not support notifications.', variant: 'destructive' });
           return;
       }

       if (Notification.permission === 'granted') {
            toast({ title: 'Notifications Enabled', description: 'You will be notified when fasting phases end.' });
            return; // Already granted
       }

       if (Notification.permission === 'denied') {
           toast({ title: 'Notifications Blocked', description: 'Please enable notifications in your browser settings.', variant: 'destructive' });
           return; // Permission denied
       }

       // Request permission
       const permission = await Notification.requestPermission();
       setNotificationPermission(permission); // Update state

       if (permission === 'granted') {
           toast({ title: 'Notifications Enabled', description: 'You will be notified when fasting phases end.' });
       } else {
           toast({ title: 'Notifications Not Enabled', description: 'You will not receive phase end notifications.', variant: 'destructive' });
       }
   };

  const formatTime = (time: RemainingTime | null): string => {
    if (!time) return '00:00:00';
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
  };

  const getPhaseEndTime = (): string | null => {
     if (!phaseStartTime || currentPhase === 'idle') return null;
     const durationHours = currentPhase === 'fasting' ? plan.fastingHours : plan.eatingHours;
     const endTime = new Date(phaseStartTime + durationHours * 60 * 60 * 1000);
     return endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const phaseEndTimeString = getPhaseEndTime();

  return (
    <div className="space-y-6">
        <Card className="shadow-lg overflow-hidden"> {/* Added overflow hidden for consistency */}
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                   <CardTitle className="text-xl">
                      {currentPhase === 'idle' && 'Fasting Paused'}
                      {currentPhase === 'fasting' && 'Currently Fasting'}
                      {currentPhase === 'eating' && 'Eating Window'}
                    </CardTitle>
                  <CardDescription>
                     Plan: {fastingPlans[plan.key].label}
                     {currentPhase !== 'idle' && phaseEndTimeString && ` | Ends at ${phaseEndTimeString}`}
                   </CardDescription>
               </div>
              <div className="flex items-center gap-1"> {/* Container for icons */}
                 <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={requestNotificationPermission}
                            aria-label={notificationPermission === 'granted' ? "Notifications Enabled" : "Enable Notifications"}
                            className={cn(notificationPermission === 'denied' && "text-destructive hover:text-destructive")}
                            disabled={!('Notification' in window)} // Disable if not supported
                        >
                            {notificationPermission === 'granted' ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5" />}
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                         <p>
                            {notificationPermission === 'granted' ? "Phase end notifications are enabled." :
                             notificationPermission === 'denied' ? "Notifications blocked by browser." :
                             "Click to enable phase end notifications."}
                         </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                 <DialogTrigger asChild>
                   <Button variant="ghost" size="icon" aria-label="Fasting Settings">
                     <Settings className="h-5 w-5" />
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[425px]">
                   <DialogHeader>
                     <DialogTitle>Fasting Settings</DialogTitle>
                     <DialogDescription>
                       Choose your preferred fasting plan and eating window start time. Changing settings will stop the current cycle.
                       <br/>
                       <strong className="text-destructive-foreground/90">Note:</strong> Due to platform limitations, notifications may not work reliably if the app/browser is completely closed. They work best when the app is open or running in the background.
                     </DialogDescription>
                   </DialogHeader>
                   <FastingSettingsForm currentPlan={plan} onSave={handleSaveSettings} />
                   {/* Footer is handled within FastingSettingsForm */}
                 </DialogContent>
               </Dialog>
              </div>
             </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 py-8"> {/* Added padding */}
             {isLoading ? (
               <p>Loading timer...</p>
             ) : (
                <>
                  <div className="relative h-48 w-48"> {/* Increased size */}
                       <svg className="absolute inset-0 h-full w-full" viewBox="0 0 36 36">
                          <path
                            className="text-muted" // Background circle color
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-primary transition-all duration-1000 ease-linear" // Added transition classes
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${progress.toFixed(2)}, 100`} // Use toFixed for smoother animation
                            strokeLinecap="round"
                            fill="none"
                            transform="rotate(-90 18 18)" // Start from top
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          {currentPhase === 'idle' ? (
                              <p className="text-2xl font-semibold text-muted-foreground animate-pulse">Paused</p> // Added animation
                          ) : (
                              <>
                                  <span className="text-4xl font-bold tabular-nums tracking-tight"> {/* Adjusted style */}
                                  {formatTime(remainingTime)}
                                  </span>
                                  <span className="text-sm text-muted-foreground mt-1"> {/* Added margin */}
                                  {currentPhase === 'fasting' ? 'Until Eating' : 'Until Fasting'}
                                  </span>
                               </>
                          )}
                      </div>
                   </div>
                  {/* Removed explicit Progress component */}
                </>
             )}
          </CardContent>
          <CardFooter className="flex justify-center gap-2 bg-muted/50 p-4"> {/* Added background and padding */}
            {isLoading ? (
                <Button disabled size="lg" className="flex-grow">Loading...</Button> // Increased size
            ) : currentPhase === 'idle' ? (
              <Button onClick={startFast} className="flex-grow" size="lg"> {/* Increased size */}
                <Play className="mr-2 h-5 w-5" /> Start Fast
              </Button>
            ) : (
              <>
                {currentPhase === 'fasting' && (
                  <Button onClick={startEating} variant="secondary" className="flex-grow" size="lg"> {/* Increased size */}
                    <Play className="mr-2 h-5 w-5" /> Start Eating Early
                  </Button>
                )}
                 {currentPhase === 'eating' && (
                   <Button onClick={startFast} variant="secondary" className="flex-grow" size="lg"> {/* Increased size */}
                     <Play className="mr-2 h-5 w-5" /> Start Fasting Early
                   </Button>
                 )}
                <Button onClick={stopCycle} variant="destructive" size="lg"> {/* Increased size */}
                  <RefreshCw className="mr-2 h-5 w-5" /> Stop Cycle
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

      {/* Potential Future: History or Tips */}
      {/* <Card>...</Card> */}
    </div>
  );
}


// Separate component for the settings form
interface FastingSettingsFormProps {
  currentPlan: FastingPlan;
  onSave: (planKey: FastingPlanKey, eatingStartTime: string) => void;
}

function FastingSettingsForm({ currentPlan, onSave }: FastingSettingsFormProps) {
  const [selectedPlanKey, setSelectedPlanKey] = React.useState<FastingPlanKey>(currentPlan.key);
  const [eatingStartTime, setEatingStartTime] = React.useState(currentPlan.eatingStartTime);

  const handleSave = () => {
    // Basic validation for time format HH:MM
    if (!/^\d{2}:\d{2}$/.test(eatingStartTime)) {
        alert("Please enter start time in HH:MM format (e.g., 13:00 for 1 PM).");
        return;
    }
    const [hours, minutes] = eatingStartTime.split(':').map(Number);
     if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        alert("Invalid time value. Please use HH:MM format (e.g., 09:30).");
        return;
     }

    onSave(selectedPlanKey, eatingStartTime);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="plan" className="text-right">
          Plan
        </Label>
        <Select
          value={selectedPlanKey}
          onValueChange={(value) => setSelectedPlanKey(value as FastingPlanKey)}
        >
          <SelectTrigger id="plan" className="col-span-3">
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fastingPlans).map(([key, plan]) => (
              <SelectItem key={key} value={key}>
                {plan.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="start-time" className="text-right">
          Eating Start (HH:MM)
        </Label>
        <Input
          id="start-time"
          type="time" // Use time input for better UX on supported browsers
          value={eatingStartTime}
          onChange={(e) => setEatingStartTime(e.target.value)}
          className="col-span-3"
          // Pattern for basic HH:MM validation in browsers that don't support type="time" well
          pattern="[0-2][0-9]:[0-5][0-9]"
        />
      </div>
       <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
    </div>
  );
}
