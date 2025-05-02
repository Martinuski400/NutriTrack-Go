
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Plus, Trash2, Target } from 'lucide-react'; // Added Target icon
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress'; // Import Progress
import Link from 'next/link'; // Import Link

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

const calorieEntrySchema = z.object({
  mealType: z.enum(mealTypes, {
    required_error: 'Please select a meal type.',
  }),
  foodItem: z.string().min(1, 'Food item cannot be empty.'),
  calories: z.coerce
    .number({ invalid_type_error: 'Calories must be a number.' })
    .int()
    .positive('Calories must be a positive number.')
    .min(1, 'Calories must be at least 1.'),
});

type CalorieEntry = z.infer<typeof calorieEntrySchema>;

interface LoggedEntry extends CalorieEntry {
  id: string;
  date: string; // Add date to each entry
}

const DEFAULT_CALORIE_GOAL = 2000; // Fallback default

export default function CaloriesPage() {
  const { toast } = useToast();
  const [loggedEntries, setLoggedEntries] = React.useState<LoggedEntry[]>([]);
  const [totalCalories, setTotalCalories] = React.useState(0);
  const [calorieGoal, setCalorieGoal] = React.useState<number | null>(null); // Use null initially
  const [isLoading, setIsLoading] = React.useState(true);
  const todayStr = format(new Date(), 'yyyy-MM-dd');


    // --- Persistence for Calendar ---
    const updateDailyCalorieRecord = (date: string, total: number, goal: number) => {
      const dailyRecords = JSON.parse(localStorage.getItem('nutri_daily_calories') || '{}');
      dailyRecords[date] = { total, goal };
      localStorage.setItem('nutri_daily_calories', JSON.stringify(dailyRecords));
    };
    // --- End Persistence ---


   // Load data on mount
   React.useEffect(() => {
     const savedEntries = localStorage.getItem('nutri_calorieEntries');
     const savedTotal = localStorage.getItem('nutri_calorieTotal');
     const savedGoal = localStorage.getItem('nutri_calorieGoal'); // Get goal from storage
     const lastEntryDate = localStorage.getItem('nutri_lastCalorieEntryDate');

     if (lastEntryDate !== todayStr) {
       // Reset entries and total if it's a new day
       localStorage.removeItem('nutri_calorieEntries');
       localStorage.removeItem('nutri_calorieTotal');
       setLoggedEntries([]);
       setTotalCalories(0);
       localStorage.setItem('nutri_lastCalorieEntryDate', todayStr);
       // Clear today's record before setting new one
        updateDailyCalorieRecord(todayStr, 0, savedGoal ? parseInt(savedGoal, 10) : DEFAULT_CALORIE_GOAL);
     } else {
       if (savedEntries) {
          const parsedEntries = JSON.parse(savedEntries);
          // Ensure loaded entries are only for today
          setLoggedEntries(parsedEntries.filter((entry: LoggedEntry) => entry.date === todayStr));
       }
       if (savedTotal) {
         setTotalCalories(parseInt(savedTotal, 10));
       }
     }

     // Set goal from localStorage or default
     const currentGoal = savedGoal ? parseInt(savedGoal, 10) : DEFAULT_CALORIE_GOAL;
     setCalorieGoal(currentGoal);
      // Update today's record on initial load too
     updateDailyCalorieRecord(todayStr, totalCalories, currentGoal);


     setIsLoading(false);
   }, []); // Removed totalCalories dependency to avoid loop on init

   // Save data whenever entries or total change
   React.useEffect(() => {
     if (!isLoading && calorieGoal !== null) {
       // Filter entries to save only today's
       const todaysEntries = loggedEntries.filter(entry => entry.date === todayStr);
       localStorage.setItem('nutri_calorieEntries', JSON.stringify(todaysEntries));
       localStorage.setItem('nutri_calorieTotal', totalCalories.toString());
       // Save daily record for calendar
       updateDailyCalorieRecord(todayStr, totalCalories, calorieGoal);
     }
   }, [loggedEntries, totalCalories, calorieGoal, isLoading, todayStr]);

  const form = useForm<CalorieEntry>({
    resolver: zodResolver(calorieEntrySchema),
    defaultValues: {
      mealType: undefined,
      foodItem: '',
      calories: undefined,
    },
  });


  function onSubmit(values: CalorieEntry) {
    const newEntry: LoggedEntry = { ...values, id: Date.now().toString(), date: todayStr };
    setLoggedEntries((prev) => [newEntry, ...prev]);
    setTotalCalories((prev) => prev + values.calories);
    toast({
      title: 'Entry Added',
      description: `${values.foodItem} (${values.calories} kcal) added to ${values.mealType}.`,
    });
    form.reset(); // Reset form after submission
  }

  const deleteEntry = (id: string) => {
    const entryToDelete = loggedEntries.find((entry) => entry.id === id);
    if (entryToDelete) {
      setLoggedEntries((prev) => prev.filter((entry) => entry.id !== id));
      setTotalCalories((prev) => prev - entryToDelete.calories);
      toast({
        title: 'Entry Deleted',
        description: `${entryToDelete.foodItem} removed.`,
        variant: 'destructive',
      });
    }
  };

  const progressPercentage = calorieGoal === null || calorieGoal === 0 ? 0 : Math.min(100, (totalCalories / calorieGoal) * 100);


  return (
    <div className="container mx-auto max-w-md p-4 pb-20"> {/* Added padding-bottom */}
      <div className="mb-4">
         <Button variant="outline" asChild>
             <Link href="/home">← Back to Home</Link>
         </Button>
       </div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        Calorie Tracker
      </h1>

        {/* Goal Progress Card */}
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Progress</span>
            <Target className="h-6 w-6 text-primary" />
          </CardTitle>
          <CardDescription>
            Goal: {isLoading ? 'Loading...' : `${calorieGoal ?? 'Not set'} kcal`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
           <Progress value={progressPercentage} aria-label={`${progressPercentage.toFixed(0)}% of daily calorie goal`} className="h-3" />
           <p className="text-center text-lg font-semibold">
               {isLoading ? 'Loading...' : `${totalCalories} / ${calorieGoal ?? 'N/A'} kcal`}
           </p>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Log New Entry</CardTitle>
          <CardDescription>Add a food item you consumed today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Controlled component
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a meal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mealTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Item</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Apple, Chicken Salad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 95" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Today's Log</CardTitle>
          <CardDescription>Total Calories: {totalCalories} kcal</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-center text-muted-foreground">Loading entries...</p>
          ): loggedEntries.length === 0 ? (
            <p className="text-center text-muted-foreground">No entries yet for today.</p>
          ) : (
            <ul className="space-y-3">
              {loggedEntries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{entry.foodItem}</p>
                    <p className="text-sm text-muted-foreground">{entry.mealType} - {entry.calories} kcal</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete entry</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
