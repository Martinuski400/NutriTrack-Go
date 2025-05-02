'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GlassWater, Plus, Minus } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

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
  // Using simple state for history, replace with local storage or API later
  const [history, setHistory] = React.useState<WaterEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);


  // Effect to load data (e.g., from localStorage) on mount
  React.useEffect(() => {
    const savedIntake = localStorage.getItem('nutri_waterIntake');
    const savedGoal = localStorage.getItem('nutri_waterGoal');
    const savedHistory = localStorage.getItem('nutri_waterHistory');
    const lastEntryDate = localStorage.getItem('nutri_lastWaterEntryDate');
    const today = new Date().toISOString().split('T')[0];

    if (lastEntryDate !== today) {
      // Reset intake if it's a new day
       localStorage.setItem('nutri_waterIntake', '0');
       setCurrentIntake(0);
    } else if (savedIntake) {
        setCurrentIntake(parseInt(savedIntake, 10));
    }


    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    localStorage.setItem('nutri_lastWaterEntryDate', today);
    setIsLoading(false);
  }, []);

  // Effect to save data whenever intake, goal, or history changes
  React.useEffect(() => {
    if (!isLoading) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('nutri_waterIntake', currentIntake.toString());
        localStorage.setItem('nutri_waterGoal', dailyGoal.toString());

        // Update today's history entry or add a new one
        const todayEntryIndex = history.findIndex(entry => entry.date === today);
        let updatedHistory = [...history];
        if (todayEntryIndex > -1) {
            updatedHistory[todayEntryIndex] = { date: today, amount: currentIntake };
        } else {
            // Only add if intake is greater than 0
            if (currentIntake > 0) {
                updatedHistory.push({ date: today, amount: currentIntake });
            }
        }
         // Keep only last 7 days + today potentially
        updatedHistory = updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
        setHistory(updatedHistory); // Update state as well
        localStorage.setItem('nutri_waterHistory', JSON.stringify(updatedHistory));
        localStorage.setItem('nutri_lastWaterEntryDate', today);
    }
  }, [currentIntake, dailyGoal, isLoading]); // Removed history dependency to avoid loop


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
       const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
       return sortedHistory.map(entry => ({
           date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format date for display
           ml: entry.amount
       }));
   }, [history]);


   const chartConfig = {
       ml: {
           label: "Water (ml)",
           color: "hsl(var(--primary))", // Use primary color (Teal)
       },
   } satisfies ChartConfig;

  return (
    <div className="container mx-auto max-w-md p-4">
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
           {chartData.length > 0 ? (
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
