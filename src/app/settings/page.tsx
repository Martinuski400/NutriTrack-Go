
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Globe } from 'lucide-react'; // Import Globe icon

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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Activity levels definition
const activityLevels = {
  sedentary: { label: 'Sedentary (little or no exercise)', value: 1.2 },
  lightlyActive: { label: 'Lightly active (light exercise 1-3 days/wk)', value: 1.375 },
  moderatelyActive: { label: 'Moderately active (moderate exercise 3-5 days/wk)', value: 1.55 },
  veryActive: { label: 'Very active (hard exercise 6-7 days/wk)', value: 1.725 },
  extraActive: { label: 'Extra active (very hard exercise & physical job)', value: 1.9 },
} as const;

type ActivityLevelKey = keyof typeof activityLevels;

// Language options
const languages = {
    en: { label: 'English', code: 'en' },
    es: { label: 'Español', code: 'es' },
    ca: { label: 'Català', code: 'ca' },
} as const;
type LanguageCode = keyof typeof languages;


// Combined schema for settings and profile
const settingsSchema = z.object({
  // Profile fields
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number.' })
    .int()
    .positive('Age must be positive.')
    .min(1, 'Age must be at least 1.')
    .optional(), // Make optional initially, prompt user if missing
  weight: z.coerce
    .number({ invalid_type_error: 'Weight must be a number.' })
    .positive('Weight must be positive.')
    .min(1, 'Weight must be at least 1 kg.')
    .optional(),
  height: z.coerce
    .number({ invalid_type_error: 'Height must be a number.' })
    .int()
    .positive('Height must be positive.')
    .min(50, 'Height must be at least 50 cm.')
    .optional(),
  sex: z.enum(['male', 'female'], {
    required_error: 'Please select your sex.',
  }).optional(),
  activityLevel: z.enum(Object.keys(activityLevels) as [ActivityLevelKey, ...ActivityLevelKey[]], {
    required_error: 'Please select your activity level.',
  }).optional(),

  // Goal fields
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

  // Language field
  language: z.enum(Object.keys(languages) as [LanguageCode, ...LanguageCode[]], {
     required_error: 'Please select a language.'
   }),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const DEFAULT_WATER_GOAL = 2000; // Default goal in ml
const DEFAULT_CALORIE_GOAL = 2000; // Default goal in kcal
const DEFAULT_LANGUAGE: LanguageCode = 'en'; // Default language

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [calculatedCalories, setCalculatedCalories] = React.useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = React.useState<LanguageCode>(DEFAULT_LANGUAGE); // State for language

   const form = useForm<SettingsForm>({
     resolver: zodResolver(settingsSchema),
     // Default values loaded from localStorage or defaults
     defaultValues: async () => {
        setIsLoading(true);
        let profileData: Partial<SettingsForm> = {};
        let waterGoal = DEFAULT_WATER_GOAL;
        let calorieGoal = DEFAULT_CALORIE_GOAL;
        let language = DEFAULT_LANGUAGE;

        if (typeof window !== 'undefined') {
            const savedProfile = localStorage.getItem('nutri_userProfile');
            const savedWaterGoal = localStorage.getItem('nutri_waterGoal');
            const savedCalorieGoal = localStorage.getItem('nutri_calorieGoal');
            const savedCalculatedGoal = localStorage.getItem('nutri_calculatedCalorieGoal');
            const savedLanguage = localStorage.getItem('nutri_language'); // Load language

            if (savedProfile) {
                try {
                    profileData = JSON.parse(savedProfile);
                } catch (e) { console.error("Error parsing profile", e); }
            }
            if (savedWaterGoal) {
                waterGoal = parseInt(savedWaterGoal, 10);
            }
            if (savedCalorieGoal) {
                calorieGoal = parseInt(savedCalorieGoal, 10);
            } else if (savedCalculatedGoal) {
                 calorieGoal = parseInt(savedCalculatedGoal, 10);
            }
            if (savedCalculatedGoal) {
                setCalculatedCalories(parseInt(savedCalculatedGoal, 10));
            }
             // Set language, ensure it's a valid key
            if (savedLanguage && languages[savedLanguage as LanguageCode]) {
                language = savedLanguage as LanguageCode;
            }
        }
        setCurrentLanguage(language); // Update state
        setIsLoading(false);
        return {
            age: profileData.age,
            weight: profileData.weight,
            height: profileData.height,
            sex: profileData.sex,
            activityLevel: profileData.activityLevel,
            waterGoal: waterGoal,
            calorieGoal: calorieGoal,
            language: language, // Set default language for form
        }
     }
   });


  // Calculate TDEE function
  const calculateTDEE = (values: SettingsForm): number | null => {
    if (values.age && values.weight && values.height && values.sex && values.activityLevel) {
      let bmr: number;
      if (values.sex === 'male') {
        bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age + 5;
      } else {
        bmr = 10 * values.weight + 6.25 * values.height - 5 * values.age - 161;
      }
      const activityFactor = activityLevels[values.activityLevel].value;
      return Math.round(bmr * activityFactor);
    }
    return null; // Not enough info
  };

  function onSubmit(values: SettingsForm) {
    // Recalculate TDEE based on current form values
    const tdee = calculateTDEE(values);
    let calorieGoalToSave = values.calorieGoal;

     if (tdee !== null) {
        setCalculatedCalories(tdee);
        localStorage.setItem('nutri_calculatedCalorieGoal', tdee.toString());
    } else {
        setCalculatedCalories(null);
        localStorage.removeItem('nutri_calculatedCalorieGoal');
    }


    // Save profile and settings to localStorage
    try {
        const profileToSave = {
            age: values.age,
            weight: values.weight,
            height: values.height,
            sex: values.sex,
            activityLevel: values.activityLevel,
        };
        localStorage.setItem('nutri_userProfile', JSON.stringify(profileToSave));
        localStorage.setItem('nutri_waterGoal', values.waterGoal.toString());
        localStorage.setItem('nutri_calorieGoal', calorieGoalToSave.toString());
        localStorage.setItem('nutri_language', values.language); // Save language

        setCurrentLanguage(values.language); // Update language state

        let toastDescription = `Preferences updated.`;
        if (tdee !== null) {
             toastDescription += ` Estimated daily need: ${tdee} kcal.`;
        }
        // Inform user about language change (actual UI text won't change without full i18n)
        toastDescription += ` Language set to ${languages[values.language].label}. Reload might be needed for full effect.`;


        toast({
            title: 'Account Settings Saved', // Updated title
            description: toastDescription,
        });

        // NOTE: Actual text translation requires a full localization setup (e.g., react-i18next).
        // This just saves the preference.
         // Optional: Force reload to apply changes if needed by localization library
         // window.location.reload();

    } catch (error) {
         console.error("Failed to save settings to localStorage", error);
         toast({
            title: 'Save Error',
            description: 'Could not save your settings.',
            variant: 'destructive',
         });
    }
  }

    // Function to manually trigger calculation and update goal if needed
  const handleRecalculateAndUpdateGoal = () => {
    const values = form.getValues();
    const tdee = calculateTDEE(values);
    if (tdee !== null) {
      setCalculatedCalories(tdee);
      form.setValue('calorieGoal', tdee, { shouldValidate: true });
       localStorage.setItem('nutri_calculatedCalorieGoal', tdee.toString());
      toast({
        title: 'Calorie Goal Updated',
        description: `Estimated daily calorie need recalculated to ${tdee} kcal and updated in the goal field. Save settings to confirm.`,
      });
    } else {
      toast({
        title: 'Calculation Error',
        description: 'Please fill in all profile fields (Age, Weight, Height, Sex, Activity Level) to calculate calorie needs.',
        variant: 'destructive',
      });
    }
  };


  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <h1 className="mb-6 text-center text-2xl font-bold">Account & Profile</h1> {/* Updated Title */}

      {isLoading ? (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading your account details...</p>
                </CardContent>
            </Card>
        ) : (
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                 {/* Profile Section */}
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>
                         Used to estimate calorie needs. Fill this to calculate your goal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                     value={field.value}
                                     className="flex flex-row space-x-4"
                                   >
                                     <FormItem className="flex items-center space-x-2 space-y-0">
                                       <FormControl>
                                         <RadioGroupItem value="male" />
                                       </FormControl>
                                       <FormLabel className="font-normal">
                                         Male
                                       </FormLabel>
                                     </FormItem>
                                     <FormItem className="flex items-center space-x-2 space-y-0">
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
                               value={field.value}
                             >
                               <FormControl>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Select activity level" />
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
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                    </CardContent>
                     <CardFooter>
                         <Button type="button" variant="outline" onClick={handleRecalculateAndUpdateGoal} className="w-full">
                             Recalculate Calorie Goal & Update Field
                         </Button>
                    </CardFooter>
                 </Card>

                {/* Goals Section */}
                <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Daily Goals</CardTitle>
                      <CardDescription>Adjust your personal targets.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                           control={form.control}
                           name="calorieGoal"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Calorie Goal (kcal)</FormLabel>
                               <FormControl>
                                 <Input type="number" placeholder="e.g., 2000" {...field} value={field.value ?? ''}/>
                               </FormControl>
                                <FormDescription>
                                    {calculatedCalories !== null
                                        ? `Estimated need: ${calculatedCalories} kcal. `
                                        : 'Fill profile to estimate. '}
                                    You can set your own goal here.
                                </FormDescription>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                         <FormField
                           control={form.control}
                           name="waterGoal"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Water Goal (ml)</FormLabel>
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
                    </CardContent>
                 </Card>

                 {/* Preferences Section (Added Language) */}
                 <Card className="shadow-lg">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"> <Globe className="h-5 w-5" /> Preferences</CardTitle>
                     </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {Object.entries(languages).map(([code, { label }]) => (
                                        <SelectItem key={code} value={code}>
                                        {label}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Choose the application language. (UI may need reload)
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
                    </CardContent>
                 </Card>


                 <Button type="submit" className="w-full !mt-8">Save Account Settings</Button> {/* Updated Button Text */}
               </form>
             </Form>
        )}
    </div>
  );
}
