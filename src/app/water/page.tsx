
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GlassWater, Plus, Minus } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import Link from 'next/link'; // Import Link

const DEFAULT_GOAL = 2000; // Default goal in ml (e.g., 2 liters)
const ADD_AMOUNT = 250; // Default amount to add in ml (e.g., 1 glass)

// Schema for adding water
const addWaterSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number.' })
    .int()
    .positive('Amount must be positive.')
    .min(1, 'Amount must be at least 1 ml.'),
});

type AddWaterForm = z.infer<typeof addWaterSchema>;

interface WaterEntry {
  date: string; // YYYY-MM-DD
  amount: number; // Total amount for the day
}

export default function WaterPage() {
  const { toast } = useToast();
  const [currentIntake, setCurrentIntake] = React.useState(0);
  const [dailyGoal, setDailyGoal] = React.useState(DEFAULT_GOAL);
  const [history, setHistory] = React.useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [todayStr, setTodayStr] = React.useState('');


   // --- Persistence for Calendar ---
   const updateDailyWaterRecord = (date: string, total: number, goal: number) => {
    if (typeof window === 'undefined') return; // Ensure client-side
     const dailyRecords = JSON.parse(localStorage.getItem('nutri_daily_water') || '{}');
     dailyRecords[date] = { total, goal };
     localStorage.setItem('nutri_daily_water', JSON.stringify(dailyRecords));
   };
   // --- End Persistence ---


  // Effect to load data (e.g., from localStorage) on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
    }
    const currentDateStr = format(new Date(), 'yyyy-MM-dd');
    setTodayStr(currentDateStr);

    const savedIntake = localStorage.getItem('nutri_waterIntake');
    const savedGoal = localStorage.getItem('nutri_waterGoal');
    const savedHistory = localStorage.getItem('nutri_waterHistory');
    const lastEntryDate = localStorage.getItem('nutri_lastWaterEntryDate');

    const currentGoal = savedGoal ? parseInt(savedGoal, 10) : DEFAULT_GOAL;
    setDailyGoal(currentGoal);

    let intakeToday = 0;
    if (lastEntryDate !== currentDateStr) {
      // Reset intake if it's a new day
       localStorage.setItem('nutri_waterIntake', '0');
       setCurrentIntake(0);
    } else if (savedIntake) {
        intakeToday = parseInt(savedIntake, 10);
        setCurrentIntake(intakeToday);
    }
    localStorage.setItem('nutri_lastWaterEntryDate', currentDateStr);

    // Load history and ensure today is included/updated
    let loadedHistory: WaterEntry[] = [];
    if (savedHistory) {
        try {
            loadedHistory = JSON.parse(savedHistory);
        } catch (e) { console.error("Error parsing water history", e); }
    }

    // Ensure today's entry exists or is updated in the history used for the chart
    const todayEntryIndex = loadedHistory.findIndex(entry => entry.date === currentDateStr);
    if (todayEntryIndex > -1) {
        loadedHistory[todayEntryIndex] = { date: currentDateStr, amount: intakeToday };
    } else if (intakeToday > 0) { // Only add if intake > 0
        loadedHistory.push({ date: currentDateStr, amount: intakeToday });
    }
    // Keep only last 7 days + today potentially, sorted
    loadedHistory = loadedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
    setHistory(loadedHistory);

    // Update the separate daily record for the calendar view
    updateDailyWaterRecord(currentDateStr, intakeToday, currentGoal);


    setIsLoading(false);
  }, []); // Load once on mount

  // Effect to save data whenever intake changes
  React.useEffect(() => {
     if (typeof window === 'undefined' || isLoading || !todayStr) return; // Ensure client-side, loaded, and todayStr is set

    localStorage.setItem('nutri_waterIntake', currentIntake.toString());
    localStorage.setItem('nutri_waterGoal', dailyGoal.toString());

    // Update today's history entry for the chart
    const todayEntryIndex = history.findIndex(entry => entry.date === todayStr);
    let updatedHistory = [...history];
    if (todayEntryIndex > -1) {
        // If today's entry exists, update it
        updatedHistory[todayEntryIndex] = { date: todayStr, amount: currentIntake };
    } else if (currentIntake > 0) {
        // If today's entry doesn't exist and intake > 0, add it
        updatedHistory.push({ date: todayStr, amount: currentIntake });
    } else if (todayEntryIndex > -1 && currentIntake === 0) {
        // If entry exists but intake is 0, remove it (optional, keeps chart cleaner)
        updatedHistory.splice(todayEntryIndex, 1);
    }

    // Sort and limit history before saving
    updatedHistory = updatedHistory
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort ascending for chart
        .slice(-7); // Keep last 7 entries

    // This state update was potentially causing infinite loops if history was a dependency
    // setHistory(updatedHistory);
     const currentHistoryJson = JSON.stringify(history);
     const updatedHistoryJson = JSON.stringify(updatedHistory);
     if (currentHistoryJson !== updatedHistoryJson) {
         setHistory(updatedHistory); // Only update if the history actually changed
     }


    localStorage.setItem('nutri_waterHistory', JSON.stringify(updatedHistory));

    // Update the separate daily record for the calendar view
    updateDailyWaterRecord(todayStr, currentIntake, dailyGoal);

  }, [currentIntake, dailyGoal, isLoading, todayStr]); // Removed history from dependencies


  const form = useForm<AddWaterForm>({
    resolver: zodResolver(addWaterSchema),
    defaultValues: {
      amount: ADD_AMOUNT,
    },
  });

  const addWater = (amount: number) => {
    if (amount <= 0) return;
    const newIntake = currentIntake + amount;
    setCurrentIntake(newIntake);
    toast({
      title: 'Water Added',
      description: `Added ${amount}ml. Keep it up!`,
    });
  };

    const removeWater = (amount: number) => {
      if (amount <= 0) return;
      const newIntake = Math.max(0, currentIntake - amount); // Ensure intake doesn't go below 0
      setCurrentIntake(newIntake);
      toast({
          title: 'Water Removed',
          description: `Removed ${amount}ml.`,
          variant: 'destructive',
      });
    }

  function onSubmit(values: AddWaterForm) {
    addWater(values.amount);
    // Optionally reset form amount, or keep it for quick re-entry
     form.reset({ amount: ADD_AMOUNT });
  }

  const progressPercentage = isLoading ? 0 : Math.min(100, (currentIntake / dailyGoal) * 100);

  // Prepare data for the chart (last 7 days including today if available)
   const chartData = React.useMemo(() => {
       // History should be sorted ascending now
       return history.map(entry => ({
           date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format date for display
           ml: entry.amount
       }));
   }, [history]);


   const chartConfig = {
       ml: {
           label: "Water (ml)",
           color: "hsl(var(--primary))", // Use primary color
       },
   } satisfies ChartConfig;

  return (
    <div className="container mx-auto max-w-md p-4 pb-20"> {/* Added padding-bottom */}
       <div className="mb-4">
         <Button variant="outline" asChild>
             {/* Ensure Link is the direct child when using asChild */}
             <Link href="/">← Back to Home</Link>
         </Button>
       </div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        Water Tracker
      </h1>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Intake</span>
            <GlassWater className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            Goal: {dailyGoal}ml
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} aria-label={`${progressPercentage.toFixed(0)}% of daily goal`} className="h-3 [&>div]:animate-pulse [&>div]:transition-all [&>div]:duration-500" />
          <p className="text-center text-lg font-semibold">
            {isLoading ? 'Loading...' : `${currentIntake} / ${dailyGoal} ml`}
          </p>
          <div className="flex justify-center gap-2">
             <Button onClick={() => removeWater(ADD_AMOUNT)} variant="outline" size="icon" aria-label={`Remove ${ADD_AMOUNT}ml`}>
                 <Minus />
             </Button>
             <Button onClick={() => addWater(ADD_AMOUNT)} variant="default" size="icon" aria-label={`Add ${ADD_AMOUNT}ml`}>
                <Plus />
             </Button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Custom Amount</FormLabel>
                    <FormControl>
                       <Input type="number" placeholder="Custom amount (ml)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage className="text-xs"/>
                  </FormItem>
                )}
              />
              <Button type="submit" aria-label="Add custom amount">Add</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
         <CardHeader>
           <CardTitle>Water Intake History (Last 7 Days)</CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
               <p className="text-center text-muted-foreground">Loading chart...</p>
           ) : chartData.length > 0 ? (
               <ChartContainer config={chartConfig} className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                     <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                     <RechartsTooltip
                        cursor={false}
                       content={<ChartTooltipContent indicator="dot" />}
                     />
                     <Bar dataKey="ml" fill="var(--color-ml)" radius={4} />
                   </BarChart>
                 </ResponsiveContainer>
               </ChartContainer>
             ) : (
               <p className="text-center text-muted-foreground">No historical data yet.</p>
             )}
         </CardContent>
       </Card>
    </div>
  );
}

