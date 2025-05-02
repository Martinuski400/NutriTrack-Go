'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  waterGoal: z.coerce
    .number({ invalid_type_error: 'Goal must be a number.' })
    .int()
    .positive('Goal must be a positive number.')
    .min(1, 'Goal must be at least 1 ml.'),
  calorieGoal: z.coerce
    .number({ invalid_type_error: 'Goal must be a number.' })
    .int()
    .positive('Goal must be a positive number.')
    .min(1, 'Goal must be at least 1 kcal.'),
    // Add other settings here if needed
    // e.g., enableNotifications: z.boolean().default(false),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const DEFAULT_WATER_GOAL = 2000; // Default goal in ml
const DEFAULT_CALORIE_GOAL = 2000; // Default goal in kcal

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);

   const form = useForm<SettingsForm>({
     resolver: zodResolver(settingsSchema),
     defaultValues: {
       waterGoal: DEFAULT_WATER_GOAL,
       calorieGoal: DEFAULT_CALORIE_GOAL,
        // enableNotifications: false,
     },
   });

    // Load settings on mount
   React.useEffect(() => {
     const savedWaterGoal = localStorage.getItem('nutri_waterGoal');
     const savedCalorieGoal = localStorage.getItem('nutri_calorieGoal');
     if (savedWaterGoal) {
       form.setValue('waterGoal', parseInt(savedWaterGoal, 10));
     }
      if (savedCalorieGoal) {
       form.setValue('calorieGoal', parseInt(savedCalorieGoal, 10));
     }
     // Load other settings if they exist
     setIsLoading(false);
   }, [form]);


  function onSubmit(values: SettingsForm) {
    // Save settings (e.g., to localStorage)
    try {
        localStorage.setItem('nutri_waterGoal', values.waterGoal.toString());
        localStorage.setItem('nutri_calorieGoal', values.calorieGoal.toString());
        // Save other settings
        toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated.',
        });
    } catch (error) {
         console.error("Failed to save settings to localStorage", error);
         toast({
            title: 'Save Error',
            description: 'Could not save your settings.',
            variant: 'destructive',
         });
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">Settings</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Goals & Preferences</CardTitle>
          <CardDescription>Adjust your daily targets and settings.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                 <p>Loading settings...</p>
            ): (
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                   control={form.control}
                   name="waterGoal"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Daily Water Goal (ml)</FormLabel>
                       <FormControl>
                         <Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''}/>
                       </FormControl>
                       <FormDescription>
                         Set your target daily water intake.
                       </FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                  <FormField
                   control={form.control}
                   name="calorieGoal"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Daily Calorie Goal (kcal)</FormLabel>
                       <FormControl>
                         <Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''}/>
                       </FormControl>
                       <FormDescription>
                         Set your target daily calorie intake. This can also be calculated on the Profile page.
                       </FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Example for Notifications - Needs implementation */}
                 {/* <FormField
                    control={form.control}
                    name="enableNotifications"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">
                            Enable Notifications
                            </FormLabel>
                            <FormDescription>
                            Receive reminders to log meals or drink water. (Requires setup)
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled // Disable until implemented
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    /> */}


                 <Button type="submit" className="w-full">Save Settings</Button>
               </form>
             </Form>
            )}
        </CardContent>
      </Card>
    </div>
  );
}