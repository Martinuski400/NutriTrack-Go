'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const activityLevels = {
  sedentary: { label: 'Sedentary (little or no exercise)', value: 1.2 },
  lightlyActive: { label: 'Lightly active (light exercise 1-3 days/wk)', value: 1.375 },
  moderatelyActive: { label: 'Moderately active (moderate exercise 3-5 days/wk)', value: 1.55 },
  veryActive: { label: 'Very active (hard exercise 6-7 days/wk)', value: 1.725 },
  extraActive: { label: 'Extra active (very hard exercise & physical job)', value: 1.9 },
} as const;

type ActivityLevelKey = keyof typeof activityLevels;

const registrationSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number.' })
    .int()
    .positive('Age must be positive.')
    .min(1, 'Age must be at least 1.'),
  weight: z.coerce
    .number({ invalid_type_error: 'Weight must be a number.' })
    .positive('Weight must be positive.')
    .min(1, 'Weight must be at least 1 kg.'),
  height: z.coerce
    .number({ invalid_type_error: 'Height must be a number.' })
    .int()
    .positive('Height must be positive.')
    .min(50, 'Height must be at least 50 cm.'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Please select your sex.',
  }),
  activityLevel: z.enum(Object.keys(activityLevels) as [ActivityLevelKey, ...ActivityLevelKey[]], {
    required_error: 'Please select your activity level.',
  }),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [calculatedCalories, setCalculatedCalories] = React.useState<number | null>(null);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      sex: undefined,
      activityLevel: undefined,
    },
  });

  function onSubmit(values: RegistrationForm) {
    // Calculate BMR using Mifflin-St Jeor
    let bmr: number;
    if (values.sex === 'male') {
      bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age + 5;
    } else {
      // female
      bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityFactor = activityLevels[values.activityLevel].value;
    const tdee = Math.round(bmr * activityFactor);

    setCalculatedCalories(tdee);

    // Store goal (optional, could be used by other pages)
    try {
        // Note: Consider storing other profile details too if needed later
        localStorage.setItem('nutri_calorieGoal', tdee.toString());
        localStorage.setItem('nutri_userProfile', JSON.stringify(values)); // Store basic profile
        toast({
        title: 'Profile Saved & Calories Calculated',
        description: `Your estimated daily calorie need is ${tdee} kcal.`,
        });
        // Optionally redirect after a delay or button click
        // setTimeout(() => router.push('/calories'), 2000);
    } catch (error) {
        console.error("Failed to save to localStorage", error);
        toast({
            title: 'Calculation Complete (Save Failed)',
            description: `Your estimated daily calorie need is ${tdee} kcal. Could not save preference.`,
            variant: 'destructive',
        });
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="mb-6 text-center text-2xl font-bold">
        User Profile & Calorie Goal
      </h1>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
          <CardDescription>
            We need this information to estimate your daily calorie needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70.5" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Sex</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Male
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Female
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your typical activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(activityLevels).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     <FormDescription>
                        Choose the option that best describes your daily activity.
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Calculate & Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
        {calculatedCalories !== null && (
            <CardFooter className="flex-col items-start space-y-2 pt-4">
                <p className="text-lg font-semibold">Estimated Daily Calorie Goal:</p>
                <p className="text-2xl font-bold text-primary">{calculatedCalories} kcal</p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/calories')}>
                    Go to Calorie Tracker
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}