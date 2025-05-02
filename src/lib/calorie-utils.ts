// src/lib/calorie-utils.ts
import { format } from 'date-fns';

// Define the structure for a logged calorie entry (matching calories/page.tsx)
interface LoggedEntry {
    id: string;
    date: string;
    mealType: string; // Default to 'Recipe' or allow selection later
    foodItem: string;
    calories: number;
}

/**
 * Adds a calorie entry (from a recipe) to the daily log stored in localStorage.
 * Handles fetching existing entries, updating total calories, and saving back.
 *
 * @param recipeName The name of the recipe (used as foodItem).
 * @param calories The total calories to add for the specified servings.
 */
export function addCaloriesToLog(recipeName: string, calories: number): void {
    if (typeof window === 'undefined' || calories <= 0) return; // Client-side only and positive calories

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastEntryDate = localStorage.getItem('nutri_lastCalorieEntryDate');
    const savedEntries = localStorage.getItem('nutri_calorieEntries');
    const savedTotal = localStorage.getItem('nutri_calorieTotal');
    const savedGoal = localStorage.getItem('nutri_calorieGoal');

    let currentEntries: LoggedEntry[] = [];
    let currentTotal = 0;
    const defaultGoal = 2000; // Match default from other pages
    const currentGoal = savedGoal ? parseInt(savedGoal, 10) : defaultGoal;

    if (lastEntryDate !== todayStr) {
        // New day, reset everything before adding
        localStorage.removeItem('nutri_calorieEntries');
        localStorage.removeItem('nutri_calorieTotal');
        localStorage.setItem('nutri_lastCalorieEntryDate', todayStr);
        currentEntries = [];
        currentTotal = 0;
    } else {
        // Same day, load existing data
        if (savedEntries) {
            try {
                const parsedEntries = JSON.parse(savedEntries);
                // Filter to be absolutely sure only today's entries are loaded
                currentEntries = parsedEntries.filter((entry: LoggedEntry) => entry.date === todayStr);
            } catch (e) {
                console.error("Error parsing calorie entries:", e);
                currentEntries = []; // Reset on error
            }
        }
        if (savedTotal) {
            currentTotal = parseInt(savedTotal, 10);
        }
    }

    // Create the new entry
    const newEntry: LoggedEntry = {
        id: Date.now().toString(), // Simple unique ID
        date: todayStr,
        mealType: 'Recipe', // Assign a specific meal type or make it dynamic later
        foodItem: recipeName,
        calories: calories,
    };

    // Update state and save
    const updatedEntries = [newEntry, ...currentEntries];
    const updatedTotal = currentTotal + calories;

    try {
        localStorage.setItem('nutri_calorieEntries', JSON.stringify(updatedEntries));
        localStorage.setItem('nutri_calorieTotal', updatedTotal.toString());

        // Update the daily record used by the home page calendar
        const dailyRecords = JSON.parse(localStorage.getItem('nutri_daily_calories') || '{}');
        dailyRecords[todayStr] = { total: updatedTotal, goal: currentGoal };
        localStorage.setItem('nutri_daily_calories', JSON.stringify(dailyRecords));

        // Optional: Dispatch a custom event to notify other components (like HomePage)
        // This avoids needing complex state management just for this update
        window.dispatchEvent(new CustomEvent('caloriesUpdated', { detail: { total: updatedTotal, goal: currentGoal } }));

    } catch (error) {
        console.error("Failed to save calorie log to localStorage", error);
        // Potentially show an error toast here as well
    }
}
