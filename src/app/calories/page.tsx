'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';

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
}

export default function CaloriesPage() {
  const { toast } = useToast();
  const [loggedEntries, setLoggedEntries] = React.useState<LoggedEntry[]>([]);
  const [totalCalories, setTotalCalories] = React.useState(0);

  const form = useForm<CalorieEntry>({
    resolver: zodResolver(calorieEntrySchema),
    defaultValues: {
      mealType: undefined,
      foodItem: '',
      calories: undefined,
    },
  });

  function onSubmit(values: CalorieEntry) {
    const newEntry: LoggedEntry = { ...values, id: Date.now().toString() };
    setLoggedEntries((prev) => [newEntry, ...prev]);
    setTotalCalories((prev) => prev + values.calories);
    toast({
      title: 'Entry Added',
      description: `${values.foodItem} (${values.calories} kcal) added to ${values.mealType}.`,
    });
    form.reset(); // Reset form after submission
  }

    const deleteEntry = (id: string) => {
      const entryToDelete = loggedEntries.find(entry => entry.id === id);
      if (entryToDelete) {
          setLoggedEntries(prev => prev.filter(entry => entry.id !== id));
          setTotalCalories(prev => prev - entryToDelete.calories);
           toast({
             title: "Entry Deleted",
             description: `${entryToDelete.foodItem} removed.`,
             variant: "destructive",
           });
      }
    }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Calorie Tracker
      </h1>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Log New Entry</CardTitle>
          <CardDescription>Add a food item you consumed.</CardDescription>
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
                      defaultValue={field.value}
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
           {loggedEntries.length === 0 ? (
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
