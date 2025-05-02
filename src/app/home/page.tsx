
'use client';

import * as React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Utensils, GlassWater, Timer, Target, CheckCircle, XCircle, CalendarIcon, CircleDashed } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter import
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import FastingTracker from '@/components/fasting/fasting-tracker'; // Reuse FastingTracker
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Types for historical data (adjust as needed based on actual storage)
interface DailyCalorieData {
  total: number;
  goal: number;
}
interface DailyWaterData {
  total: number;
  goal: number;
}
interface FastingHistoryEntry {
    date: string; // YYYY-MM-DD
    planKey?: string;
    // Add more details if stored, e.g., completed: boolean
}

const DEFAULT_CALORIE_GOAL = 2000;
const DEFAULT_WATER_GOAL = 2000;

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  // Today's data states
  const [todayCalories, setTodayCalories] = React.useState(0);
  const [calorieGoal, setCalorieGoal] = React.useState(DEFAULT_CALORIE_GOAL);
  const [todayWater, setTodayWater] = React.useState(0);
  const [waterGoal, setWaterGoal] = React.useState(DEFAULT_WATER_GOAL);

  // Calendar states
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [calendarData, setCalendarData] = React.useState<{
    calories: { [date: string]: DailyCalorieData };
    water: { [date: string]: DailyWaterData };
    fasting: { [date: string]: FastingHistoryEntry }; // Simplified fasting history
  }>({ calories: {}, water: {}, fasting: {} });

  // Load initial data and set up listeners/intervals if needed
  React.useEffect(() => {
    setIsLoading(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Load goals
    const savedCalorieGoal = localStorage.getItem('nutri_calorieGoal');
    const savedWaterGoal = localStorage.getItem('nutri_waterGoal');
    setCalorieGoal(savedCalorieGoal ? parseInt(savedCalorieGoal, 10) : DEFAULT_CALORIE_GOAL);
    setWaterGoal(savedWaterGoal ? parseInt(savedWaterGoal, 10) : DEFAULT_WATER_GOAL);

    // Load today's totals (or reset if new day)
    const lastCalorieDate = localStorage.getItem('nutri_lastCalorieEntryDate');
    const lastWaterDate = localStorage.getItem('nutri_lastWaterEntryDate');

    if (lastCalorieDate === todayStr) {
        const savedTotal = localStorage.getItem('nutri_calorieTotal');
        setTodayCalories(savedTotal ? parseInt(savedTotal, 10) : 0);
    } else {
        localStorage.setItem('nutri_calorieTotal', '0'); // Reset for new day
        setTodayCalories(0);
        localStorage.setItem('nutri_lastCalorieEntryDate', todayStr);
    }

    if (lastWaterDate === todayStr) {
        const savedTotal = localStorage.getItem('nutri_waterIntake');
        setTodayWater(savedTotal ? parseInt(savedTotal, 10) : 0);
    } else {
        localStorage.setItem('nutri_waterIntake', '0'); // Reset for new day
        setTodayWater(0);
        localStorage.setItem('nutri_lastWaterEntryDate', todayStr);
    }


    // Load historical data for calendar (simplified)
    // In a real app, you'd fetch this more robustly
    const allCalorieData = JSON.parse(localStorage.getItem('nutri_daily_calories') || '{}');
    const allWaterData = JSON.parse(localStorage.getItem('nutri_daily_water') || '{}');
    const allFastingDataRaw = JSON.parse(localStorage.getItem('nutri_fasting_history') || '[]');
    const allFastingData = allFastingDataRaw.reduce((acc: any, entry: any) => {
        if (entry.date) { // Assuming entry has a date property
            acc[entry.date] = entry;
        }
        return acc;
    }, {});


    // Add today's data to historical if missing
     if (!allCalorieData[todayStr]) {
        allCalorieData[todayStr] = { total: todayCalories, goal: calorieGoal };
     } else {
        // Ensure today's entry reflects current state
        allCalorieData[todayStr].total = todayCalories;
        allCalorieData[todayStr].goal = calorieGoal;
     }
     if (!allWaterData[todayStr]) {
         allWaterData[todayStr] = { total: todayWater, goal: waterGoal };
     } else {
         allWaterData[todayStr].total = todayWater;
         allWaterData[todayStr].goal = waterGoal;
     }

    // Simplification: Load fasting status for today from current state, not history for calendar marking
    // const currentFastingPhase = localStorage.getItem('nutri_fastingCurrentPhase');
    // if (currentFastingPhase === 'fasting' && !allFastingData[todayStr]) {
    //      allFastingData[todayStr] = { date: todayStr }; // Mark today if fasting and no entry exists
    // }


    setCalendarData({
        calories: allCalorieData,
        water: allWaterData,
        fasting: allFastingData,
    });

    setIsLoading(false);

    // --- Add listeners for localStorage changes if needed ---
    // This basic example relies on re-renders from state changes within components
    // For cross-tab consistency or more complex scenarios, consider BroadcastChannel or custom events.

  }, []); // Initial load

  // Update calendar data when today's values change
  React.useEffect(() => {
    if (isLoading) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    setCalendarData(prev => ({
        ...prev,
        calories: {
            ...prev.calories,
            [todayStr]: { total: todayCalories, goal: calorieGoal }
        },
        water: {
            ...prev.water,
            [todayStr]: { total: todayWater, goal: waterGoal }
        }
        // Fasting data update might need to come from FastingTracker state changes
    }));
     // Persist updated daily data (optional, might be handled by individual trackers)
     localStorage.setItem('nutri_daily_calories', JSON.stringify(calendarData.calories));
     localStorage.setItem('nutri_daily_water', JSON.stringify(calendarData.water));

  }, [todayCalories, calorieGoal, todayWater, waterGoal, isLoading]);


  // Calendar modifiers
  const calorieGoalMetModifier = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const data = calendarData.calories[dateStr];
    return data ? data.total > 0 && data.total <= data.goal : false;
  };
  const calorieGoalNotMetModifier = (date: Date): boolean => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = calendarData.calories[dateStr];
      return data ? data.total > data.goal : false;
  };
   const waterGoalMetModifier = (date: Date): boolean => {
     const dateStr = format(date, 'yyyy-MM-dd');
     const data = calendarData.water[dateStr];
     return data ? data.total >= data.goal : false;
   };
   const waterGoalNotMetModifier = (date: Date): boolean => {
       const dateStr = format(date, 'yyyy-MM-dd');
       const data = calendarData.water[dateStr];
       return data ? data.total > 0 && data.total < data.goal : false; // Only show if some intake but not met
   };
   const fastingActiveModifier = (date: Date): boolean => {
       const dateStr = format(date, 'yyyy-MM-dd');
       // Simplification: check if *any* fasting entry exists for this day
       // More complex logic needed to check if a full cycle was completed or active
       return !!calendarData.fasting[dateStr];
   };

  const calorieProgress = calorieGoal === 0 ? 0 : Math.min(100, (todayCalories / calorieGoal) * 100);
  const waterProgress = waterGoal === 0 ? 0 : Math.min(100, (todayWater / waterGoal) * 100);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedCalorieData = selectedDateStr ? calendarData.calories[selectedDateStr] : null;
  const selectedWaterData = selectedDateStr ? calendarData.water[selectedDateStr] : null;
  const selectedFastingData = selectedDateStr ? calendarData.fasting[selectedDateStr] : null;

  return (
    <div className="container mx-auto max-w-4xl p-4 pb-20"> {/* Wider container */}
      <h1 className="mb-6 text-center text-3xl font-bold">Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Today's Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Calories Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Calories</span>
                  <Target className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>
                  Goal: {isLoading ? '...' : `${calorieGoal} kcal`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={calorieProgress} aria-label={`${calorieProgress.toFixed(0)}% of calorie goal`} className="h-2" />
                <p className="text-center font-semibold">
                  {isLoading ? '...' : `${todayCalories} / ${calorieGoal} kcal`}
                </p>
              </CardContent>
               <CardFooter>
                   <Button variant="outline" size="sm" className="w-full" asChild>
                       <Link href="/calories">View & Log Calories</Link>
                   </Button>
               </CardFooter>
            </Card>

            {/* Water Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Today's Water</span>
                  <GlassWater className="h-5 w-5 text-blue-500" />
                </CardTitle>
                <CardDescription>
                  Goal: {isLoading ? '...' : `${waterGoal} ml`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={waterProgress} aria-label={`${waterProgress.toFixed(0)}% of water goal`} className="h-2 [&>div]:bg-blue-500" />
                <p className="text-center font-semibold">
                  {isLoading ? '...' : `${todayWater} / ${waterGoal} ml`}
                </p>
              </CardContent>
               <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                     <Link href="/water">View & Log Water</Link>
                  </Button>
               </CardFooter>
            </Card>

             {/* Fasting Card - Reuse existing component */}
            <div className="lg:col-span-1 sm:col-span-2"> {/* Adjust span for layout */}
                <FastingTracker />
            </div>

          </div>
            {/* Add quick links or other summary info here */}
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                   <Button variant="default" asChild><Link href="/recipes">Explore Recipes</Link></Button>
                   <Button variant="default" asChild><Link href="/settings">Adjust Settings</Link></Button>
                </CardContent>
             </Card>

        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <Card className="shadow-lg">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5"/>
                    <span>Activity Calendar</span>
               </CardTitle>
               <CardDescription>
                 Click a date to see your progress for that day.
               </CardDescription>
             </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 md:flex-row md:items-start">
                <div className="flex-shrink-0 rounded-md border">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{
                            calorieGoalMet: calorieGoalMetModifier,
                            calorieGoalNotMet: calorieGoalNotMetModifier,
                            waterGoalMet: waterGoalMetModifier,
                            waterGoalNotMet: waterGoalNotMetModifier,
                            fastingActive: fastingActiveModifier,
                        }}
                        modifiersClassNames={{
                            calorieGoalMet: 'cal-goal-met',
                            calorieGoalNotMet: 'cal-goal-exceeded',
                            waterGoalMet: 'water-goal-met',
                            waterGoalNotMet: 'water-goal-partial',
                            fastingActive: 'fasting-active',
                        }}
                    />
                 </div>
                 <div className="w-full space-y-3 md:pl-4">
                    <h3 className="font-semibold">
                      {selectedDate ? `Details for ${format(selectedDate, 'PPP')}` : 'Select a date'}
                    </h3>
                    {selectedDate ? (
                        <div className="space-y-2 text-sm">
                            {/* Calorie Details */}
                             <div className="flex items-center gap-2">
                                <Utensils className="h-4 w-4 text-muted-foreground"/>
                                {selectedCalorieData ? (
                                    <span className={cn(
                                        selectedCalorieData.total > selectedCalorieData.goal && "text-destructive",
                                        selectedCalorieData.total > 0 && selectedCalorieData.total <= selectedCalorieData.goal && "text-green-600"
                                    )}>
                                        Calories: {selectedCalorieData.total} / {selectedCalorieData.goal} kcal
                                        {selectedCalorieData.total > 0 && selectedCalorieData.total <= selectedCalorieData.goal && <CheckCircle className="inline h-4 w-4 ml-1"/>}
                                        {selectedCalorieData.total > selectedCalorieData.goal && <XCircle className="inline h-4 w-4 ml-1"/>}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">No calorie data</span>
                                )}
                             </div>
                              {/* Water Details */}
                             <div className="flex items-center gap-2">
                                <GlassWater className="h-4 w-4 text-muted-foreground"/>
                                {selectedWaterData ? (
                                    <span className={cn(
                                        selectedWaterData.total >= selectedWaterData.goal && "text-green-600",
                                        selectedWaterData.total > 0 && selectedWaterData.total < selectedWaterData.goal && "text-yellow-600"
                                    )}>
                                        Water: {selectedWaterData.total} / {selectedWaterData.goal} ml
                                        {selectedWaterData.total >= selectedWaterData.goal && <CheckCircle className="inline h-4 w-4 ml-1"/>}
                                        {selectedWaterData.total > 0 && selectedWaterData.total < selectedWaterData.goal && <CircleDashed className="inline h-4 w-4 ml-1"/>}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">No water data</span>
                                )}
                             </div>
                             {/* Fasting Details */}
                              <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4 text-muted-foreground"/>
                                {selectedFastingData ? (
                                    <span className="text-green-600">
                                        Fasting was active
                                        <CheckCircle className="inline h-4 w-4 ml-1"/>
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">No fasting data</span>
                                )}
                             </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Click on a date in the calendar to view details.</p>
                    )}

                    {/* Legend */}
                    <div className="pt-4 space-y-1 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Legend:</p>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div> Calories Goal Met</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div> Calories Goal Exceeded</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div> Water Goal Met</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div> Water Goal Partially Met</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></div> Fasting Active</div>
                    </div>
                 </div>
            </CardContent>
          </Card>
          {/* Add global styles for calendar modifiers */}
          <style jsx global>{`
              .cal-goal-met { background-color: hsl(var(--accent) / 0.2); border: 1px solid hsl(var(--accent) / 0.5); font-weight: bold; }
              .cal-goal-exceeded { background-color: hsl(var(--destructive) / 0.2); border: 1px solid hsl(var(--destructive) / 0.5); }
              .water-goal-met { position: relative; }
              .water-goal-met::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; border-radius: 50%; background-color: hsl(var(--primary)); }
              .water-goal-partial { position: relative; }
              .water-goal-partial::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; border-radius: 50%; background-color: hsl(48 96% 61%); } /* Accent color - yellow */
               .fasting-active { font-style: italic; color: hsl(262 84% 50%); } /* Example purple */
               /* Adjustments for overlapping dots/styles might be needed */
          `}</style>
        </TabsContent>
      </Tabs>
    </div>
  );
}

