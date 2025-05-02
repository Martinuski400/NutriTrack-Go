
'use client';

import * as React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Utensils, GlassWater, Timer, Target, CheckCircle, XCircle, CalendarIcon, CircleDashed } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import FastingTracker from '@/components/fasting/fasting-tracker';
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
    // Ensure this runs only on the client side
    if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
    }

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
    const allCalorieData = JSON.parse(localStorage.getItem('nutri_daily_calories') || '{}');
    const allWaterData = JSON.parse(localStorage.getItem('nutri_daily_water') || '{}');
     // Load fasting data - Adjust if stored differently
    const allFastingDataRaw = JSON.parse(localStorage.getItem('nutri_fasting_history') || '{}'); // Changed from array to object
    const allFastingData = typeof allFastingDataRaw === 'object' && allFastingDataRaw !== null ? allFastingDataRaw : {};

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

    setCalendarData({
        calories: allCalorieData,
        water: allWaterData,
        fasting: allFastingData,
    });

    setIsLoading(false);

  }, []); // Initial load

  // Update calendar data when today's values change
  React.useEffect(() => {
    // Ensure this runs only on the client side and after initial load
     if (isLoading || typeof window === 'undefined') return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const updatedCalories = {
        ...calendarData.calories,
        [todayStr]: { total: todayCalories, goal: calorieGoal }
    };
    const updatedWater = {
        ...calendarData.water,
        [todayStr]: { total: todayWater, goal: waterGoal }
    };
    // Note: Fasting data update should ideally come from FastingTracker's state management

    setCalendarData(prev => ({
        ...prev,
        calories: updatedCalories,
        water: updatedWater,
    }));
     // Persist updated daily data
     localStorage.setItem('nutri_daily_calories', JSON.stringify(updatedCalories));
     localStorage.setItem('nutri_daily_water', JSON.stringify(updatedWater));

  }, [todayCalories, calorieGoal, todayWater, waterGoal, isLoading, calendarData.calories, calendarData.water]); // Added dependencies


  // Calendar modifiers
  const getDayModifiers = React.useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const modifiers: { [key: string]: boolean } = {};
    const calData = calendarData.calories[dateStr];
    const waterData = calendarData.water[dateStr];
    const fastingData = calendarData.fasting[dateStr];

    if (calData) {
      if (calData.total > 0 && calData.total <= calData.goal) {
        modifiers.calorieGoalMet = true;
      }
      if (calData.total > calData.goal) {
        modifiers.calorieGoalExceeded = true; // Changed name
      }
    }
    if (waterData) {
      if (waterData.total >= waterData.goal) {
        modifiers.waterGoalMet = true;
      } else if (waterData.total > 0) {
        modifiers.waterGoalPartial = true; // Changed name
      }
    }
    if (fastingData && fastingData.planKey) { // Check if planKey exists
        modifiers.fastingActive = true;
    }

    return modifiers;
  }, [calendarData]);


  const calorieProgress = calorieGoal === 0 ? 0 : Math.min(100, (todayCalories / calorieGoal) * 100);
  const waterProgress = waterGoal === 0 ? 0 : Math.min(100, (todayWater / waterGoal) * 100);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedCalorieData = selectedDateStr ? calendarData.calories[selectedDateStr] : null;
  const selectedWaterData = selectedDateStr ? calendarData.water[selectedDateStr] : null;
  const selectedFastingData = selectedDateStr ? calendarData.fasting[selectedDateStr] : null;


  // Display Loading state
  if (isLoading && typeof window !== 'undefined') {
    return (
        <div className="container mx-auto max-w-md p-4 pb-20 flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
    );
  }


  return (
    <div className="container mx-auto max-w-md p-4 pb-20"> {/* Mobile-first max-width */}
      <h1 className="mb-6 text-center text-3xl font-bold">Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Today's Summary Cards */}
          <div className="grid grid-cols-1 gap-4"> {/* Single column for mobile */}
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
            <div> {/* No spanning needed for single column */}
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
            <CardContent className="flex flex-col items-center gap-4"> {/* Stack vertically for mobile */}
                <div className="flex-shrink-0 rounded-md border w-full flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={getDayModifiers} // Use the memoized function
                        modifiersClassNames={{
                            calorieGoalMet: 'cal-goal-met',
                            calorieGoalExceeded: 'cal-goal-exceeded', // Updated name
                            waterGoalMet: 'water-goal-met',
                            waterGoalPartial: 'water-goal-partial', // Updated name
                            fastingActive: 'fasting-active',
                        }}
                    />
                 </div>
                 <div className="w-full space-y-3"> {/* Removed padding left */}
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
                                        selectedCalorieData.total > 0 && selectedCalorieData.total <= selectedCalorieData.goal && "text-green-600 dark:text-green-400" // Adjusted dark mode color
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
                                        selectedWaterData.total >= selectedWaterData.goal && "text-green-600 dark:text-green-400", // Adjusted dark mode color
                                        selectedWaterData.total > 0 && selectedWaterData.total < selectedWaterData.goal && "text-yellow-600 dark:text-yellow-400" // Adjusted dark mode color
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
                                {selectedFastingData && selectedFastingData.planKey ? ( // Check for planKey
                                    <span className="text-purple-600 dark:text-purple-400"> {/* Use theme color variable if available */}
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
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: 'hsl(var(--cal-goal-met-bg))', borderColor: 'hsl(var(--cal-goal-met-border))' }}></div> Calories Goal Met</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: 'hsl(var(--cal-goal-exceeded-bg))', borderColor: 'hsl(var(--cal-goal-exceeded-border))' }}></div> Calories Goal Exceeded</div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm relative">
                                <div className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 w-[5px] h-[5px] rounded-full" style={{ backgroundColor: 'hsl(var(--water-goal-met-indicator))' }}></div>
                            </div> Water Goal Met (Dot)
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm relative">
                                <div className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 w-[5px] h-[5px] rounded-full" style={{ backgroundColor: 'hsl(var(--water-goal-partial-indicator))' }}></div>
                             </div> Water Goal Partial (Dot)
                        </div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: 'hsl(var(--fasting-active-bg))', borderColor: 'hsl(var(--fasting-active-border))', color: 'hsl(var(--fasting-active-color))' }}>F</div> Fasting Active</div>
                    </div>
                 </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

