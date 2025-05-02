// src/app/recipes/page.tsx
'use client';

import * as React from 'react';
import { Search, Filter, Heart, X, Clock, Flame, Users, Minus, Plus, PlusCircle } from 'lucide-react'; // Added Users, Minus, Plus, PlusCircle
import { sampleRecipes, sampleCuisines, recipeCategories, Recipe, RecipeCategory } from './recipe-data'; // Adjust path as necessary
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { CuisineCard } from '@/components/recipes/cuisine-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator'; // Import Separator
import { addCaloriesToLog } from '@/lib/calorie-utils'; // Import the new utility function

const DEBOUNCE_TIME = 300; // milliseconds

// Helper function to parse and adjust ingredient quantities
const adjustIngredient = (ingredient: string, currentServings: number, originalServings: number): string => {
    if (originalServings <= 0 || currentServings <= 0) return ingredient; // Avoid division by zero or nonsensical values

    const scaleFactor = currentServings / originalServings;

    // Regex to find numbers (including fractions like 1/2 or decimals like 0.5) at the beginning of the string
    const quantityMatch = ingredient.match(/^(\d+(\.\d+)?\s*(\/\s*\d+)?|\d+\/\d+|\.\d+)/);

    if (quantityMatch) {
        const quantityStr = quantityMatch[0].trim();
        const restOfIngredient = ingredient.substring(quantityMatch[0].length).trim();
        let originalQuantity: number;

        // Handle fractions
        if (quantityStr.includes('/')) {
            const parts = quantityStr.split('/');
            if (parts.length === 2) {
                const numerator = parseFloat(parts[0]);
                const denominator = parseFloat(parts[1]);
                if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                    originalQuantity = numerator / denominator;
                } else {
                    return ingredient; // Invalid fraction
                }
            } else {
                 return ingredient; // Invalid fraction format
            }
        } else {
             originalQuantity = parseFloat(quantityStr);
        }


        if (!isNaN(originalQuantity)) {
            const newQuantity = originalQuantity * scaleFactor;

            // Format the new quantity (e.g., handle decimals, maybe convert back to simple fractions if desired)
            let newQuantityStr: string;
            if (newQuantity === 0) {
                newQuantityStr = "0"; // Avoid issues with small numbers becoming empty strings
            } else if (newQuantity < 0.1) {
                newQuantityStr = newQuantity.toFixed(2); // Show more precision for very small amounts
            } else if (newQuantity < 1 && (newQuantity * 4) % 1 === 0) { // Try simple fractions (1/4, 1/2, 3/4)
                if (newQuantity === 0.25) newQuantityStr = "1/4";
                else if (newQuantity === 0.5) newQuantityStr = "1/2";
                else if (newQuantity === 0.75) newQuantityStr = "3/4";
                else newQuantityStr = newQuantity.toFixed(1); // Fallback for other fractions < 1
            }
            else {
                newQuantityStr = parseFloat(newQuantity.toFixed(1)).toString(); // Round to 1 decimal place for most cases
            }


            return `${newQuantityStr} ${restOfIngredient}`;
        }
    }

    // If no quantity found at the start, return original string or maybe prefix based on scale
    if (scaleFactor !== 1) {
        // Decide how to handle ingredients without quantities (e.g., "Salt to taste")
        // Option 1: Return as is
         return ingredient;
        // Option 2: Prefix with scale factor (might be awkward)
        // return `(${scaleFactor.toFixed(1)}x) ${ingredient}`;
    }

    return ingredient; // Return original if scaleFactor is 1
};


export default function RecipesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<RecipeCategory | null>(null);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]); // Initialize empty
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [modalServings, setModalServings] = React.useState<number>(1); // State for servings in modal


  // Load initial recipes and favorites from localStorage
   React.useEffect(() => {
     setIsLoading(true);
     let loadedRecipes = [...sampleRecipes]; // Start with the base sample recipes
     const savedFavorites = localStorage.getItem('nutri_favoriteRecipes');
     if (savedFavorites) {
       try {
           const favoriteIds = JSON.parse(savedFavorites) as string[];
           loadedRecipes = loadedRecipes.map(recipe => ({
             ...recipe,
             isFavorite: favoriteIds.includes(recipe.id),
           }));
       } catch (e) {
           console.error("Error parsing favorite recipes:", e);
           // Optionally clear corrupted data: localStorage.removeItem('nutri_favoriteRecipes');
       }
     }
     setRecipes(loadedRecipes);
     setIsLoading(false);
   }, []);


  // Debounce search term
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


    // Save favorites to localStorage
    const saveFavorites = (updatedRecipes: Recipe[]) => {
        try {
            const favoriteIds = updatedRecipes.filter(r => r.isFavorite).map(r => r.id);
            localStorage.setItem('nutri_favoriteRecipes', JSON.stringify(favoriteIds));
        } catch (e) {
            console.error("Error saving favorite recipes:", e);
             toast({
                 title: "Error Saving Favorites",
                 description: "Could not save your favorites list.",
                 variant: "destructive",
             });
        }
    };

    const toggleFavorite = (id: string) => {
        let targetRecipe: Recipe | undefined; // Variable to hold the recipe for the toast

        setRecipes(prevRecipes => {
            const updated = prevRecipes.map(recipe =>
                recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
            );
            // Find the recipe inside the updater to ensure we use the correct favorite status
            targetRecipe = updated.find(r => r.id === id);
            saveFavorites(updated); // Save to localStorage here as it depends on 'updated'
            return updated; // Return the new state
        });

        // Call toast *after* setRecipes has been called, using the targetRecipe found above
        if (targetRecipe) {
            toast({
                title: targetRecipe.isFavorite ? "Added to Favorites" : "Removed from Favorites",
                description: `${targetRecipe.name}`,
            });
        }

        // Update selectedRecipe state *after* setRecipes has been called
        // Use the targetRecipe's favorite status if it's the selected one
        if (selectedRecipe && selectedRecipe.id === id && targetRecipe) {
             setSelectedRecipe(prev => prev ? { ...prev, isFavorite: targetRecipe!.isFavorite } : null);
        } else if (selectedRecipe && selectedRecipe.id === id && !targetRecipe) {
            // Edge case: if recipe somehow not found after update (shouldn't happen), fallback
            setSelectedRecipe(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        }
    };


  const filteredRecipes = React.useMemo(() => {
    // Guard against filtering before recipes are loaded
    if (isLoading) return [];

    return recipes.filter((recipe) => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = debouncedSearchTerm
        ? recipe.name.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower)) ||
          recipe.cuisine?.toLowerCase().includes(searchLower) // Also search by cuisine
        : true;
      const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
      const matchesFavorite = showOnlyFavorites ? recipe.isFavorite : true;

      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [recipes, debouncedSearchTerm, selectedCategory, showOnlyFavorites, isLoading]);


  // Separate filtering for popular and quick sections to always show them unless search/category is active
   const popularRecipes = React.useMemo(() => {
     if (isLoading) return [];
     return recipes.filter(recipe => recipe.isPopular);
   }, [recipes, isLoading]);

   const quickRecipes = React.useMemo(() => {
       if (isLoading) return [];
       return recipes.filter(recipe => recipe.isQuick);
   }, [recipes, isLoading]);

  const handleCategoryClick = (category: RecipeCategory) => {
    setSelectedCategory(prev => (prev === category ? null : category)); // Toggle selection
    setShowOnlyFavorites(false); // Turn off favorite filter when category is clicked
  };

  const handleShowFavorites = () => {
      setShowOnlyFavorites(prev => !prev);
      setSelectedCategory(null); // Clear category filter when showing favorites
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setModalServings(recipe.servings); // Initialize modal servings with recipe default
    setIsModalOpen(true);
  };

   const closeRecipeModal = () => {
     setIsModalOpen(false);
     // Add a small delay before clearing the selected recipe to allow for fade-out animation
     setTimeout(() => {
       setSelectedRecipe(null);
     }, 300);
   };

   const incrementServings = () => {
       setModalServings(prev => prev + 1);
   };

   const decrementServings = () => {
       setModalServings(prev => Math.max(1, prev - 1)); // Ensure servings don't go below 1
   };

   // Calculate adjusted ingredients based on modalServings
   const adjustedIngredients = React.useMemo(() => {
       if (!selectedRecipe) return [];
       return selectedRecipe.ingredients.map(ing =>
           adjustIngredient(ing, modalServings, selectedRecipe.servings)
       );
   }, [selectedRecipe, modalServings]);

   // Calculate adjusted calories per serving
   const caloriesPerServing = selectedRecipe ? selectedRecipe.calories : 0; // Calories are per original serving
   // Calculate total calories for the adjusted servings
   const totalCaloriesForServings = caloriesPerServing * modalServings;

    // Function to handle adding calories to the log
    const handleAddCalories = () => {
        if (!selectedRecipe) return;
        addCaloriesToLog(selectedRecipe.name, totalCaloriesForServings);
        toast({
            title: "Calories Logged",
            description: `Added ${totalCaloriesForServings} kcal for ${modalServings} serving(s) of ${selectedRecipe.name}.`,
        });
        // Optionally close modal after adding
        // closeRecipeModal();
    };


  return (
    <div className="container mx-auto max-w-4xl p-4 pb-24"> {/* Increased max-width and added bottom padding */}
      <h1 className="mb-4 text-center text-2xl font-bold">1000+ Healthy Recipes</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes, ingredients, cuisines..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
         <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            size="icon"
            onClick={handleShowFavorites}
            aria-label={showOnlyFavorites ? "Show All Recipes" : "Show Favorite Recipes"}
            className={cn(showOnlyFavorites && "bg-destructive text-destructive-foreground hover:bg-destructive/90")} // Use theme colors more directly
        >
            <Heart className={cn("h-5 w-5", showOnlyFavorites && "fill-current")} />
         </Button>
      </div>

      {/* Category Filters */}
       <ScrollArea className="w-full whitespace-nowrap pb-3 mb-4">
        <div className="flex space-x-2">
          {recipeCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category)}
              className="rounded-full px-4 text-xs sm:text-sm" // Rounded buttons
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
       </ScrollArea>

        {/* Loading State */}
        {isLoading ? (
            <p className="text-center text-muted-foreground mt-10">Loading recipes...</p>
        ) :

        /* Display based on filters */
        (debouncedSearchTerm || selectedCategory || showOnlyFavorites) ? (
            // Show filtered results
             <div>
                <h2 className="mb-3 text-lg font-semibold">
                   {showOnlyFavorites ? `Favorite Recipes (${filteredRecipes.length})` :
                   selectedCategory ? `${selectedCategory} Recipes (${filteredRecipes.length})` :
                   `Search Results for "${debouncedSearchTerm}" (${filteredRecipes.length})`}
                </h2>
                {filteredRecipes.length > 0 ? (
                    // Use a more responsive grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} className="w-full"/> // Make cards full width within grid
                        ))}
                    </div>
                 ) : (
                    <p className="text-center text-muted-foreground mt-10">No recipes found matching your criteria.</p>
                 )}
             </div>
        ) : (
            // Show default sections (Cuisines, Popular, Quick)
            <>
                 {/* Cuisines Section */}
                  <section className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">Explore Cuisines</h2>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4 pb-3">
                            {sampleCuisines.map((cuisine) => (
                            <CuisineCard key={cuisine.name} cuisine={cuisine} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </section>

                 {/* Popular Recipes Section */}
                 <section className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">Popular Recipes</h2>
                    </div>
                     <ScrollArea className="w-full whitespace-nowrap">
                       <div className="flex space-x-4 pb-3">
                         {popularRecipes.length > 0 ? (
                           popularRecipes.map((recipe) => (
                             <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} />
                           ))
                         ) : (
                           <p className="text-muted-foreground pl-2">No popular recipes found.</p> // Adjusted text
                         )}
                       </div>
                       <ScrollBar orientation="horizontal" />
                     </ScrollArea>
                 </section>

                  {/* Quick Meals Section */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                         <h2 className="text-lg font-semibold">Quick & Easy Meals</h2> {/* Changed title */}
                    </div>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4 pb-3">
                           {quickRecipes.length > 0 ? (
                              quickRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} />
                              ))
                            ) : (
                              <p className="text-muted-foreground pl-2">No quick meals found.</p> // Adjusted text
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                 </section>
            </>
        )}


        {/* Recipe Detail Modal */}
         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
             <DialogContent className="sm:max-w-[650px] max-h-[95vh] flex flex-col p-0 overflow-hidden"> {/* Adjust width and height, remove padding */}
               {selectedRecipe && (
                 <>
                    {/* Header section with Image and Title */}
                    <DialogHeader className="relative p-0"> {/* Remove default padding */}
                        {/* Image container */}
                        <div className="relative">
                            <Image
                                src={selectedRecipe.imageUrl}
                                alt={selectedRecipe.name}
                                width={650} // Match content width
                                height={350} // Adjust height for better aspect ratio
                                className="object-cover w-full h-[300px] sm:h-[350px] rounded-t-lg" // Fixed height, object cover
                                data-ai-hint={selectedRecipe.imageHint}
                                priority // Load image eagerly when modal opens
                                unoptimized // Disable optimization if using external URLs like picsum
                            />
                             {/* Favorite and Close Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm p-2", // Styling for buttons
                                        selectedRecipe.isFavorite && "text-destructive"
                                        )}
                                    onClick={() => toggleFavorite(selectedRecipe.id)}
                                    aria-label={selectedRecipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    <Heart className={cn("h-5 w-5", selectedRecipe.isFavorite && "fill-current")} />
                                </Button>
                                <DialogClose asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={closeRecipeModal}
                                        className="rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm p-2" // Styling for buttons
                                    >
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </DialogClose>
                            </div>
                         </div>
                         {/* Text content below image */}
                        <div className="p-4 sm:p-6 space-y-3"> {/* Consistent padding */}
                            <DialogTitle className="text-2xl font-bold">{selectedRecipe.name}</DialogTitle>
                             {/* Metadata row */}
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {selectedRecipe.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Flame className="h-4 w-4" />
                                    {caloriesPerServing} kcal / serving
                                </span>
                                {selectedRecipe.cuisine && (
                                    <span className="capitalize flex items-center gap-1">
                                        {/* Icon placeholder */}
                                        {selectedRecipe.cuisine}
                                    </span>
                                )}
                                 <span className="capitalize flex items-center gap-1">
                                    {/* Icon placeholder */}
                                    {selectedRecipe.category}
                                 </span>
                            </div>
                            {/* Description */}
                             {selectedRecipe.description && (
                                 <DialogDescription className="text-base text-foreground/90 leading-relaxed">
                                    {selectedRecipe.description}
                                 </DialogDescription>
                             )}
                         </div>
                         <Separator /> {/* Separator before ingredients/procedure */}
                    </DialogHeader>

                    {/* Scrollable Content Area */}
                     <ScrollArea className="flex-grow overflow-y-auto px-4 sm:px-6 pb-6"> {/* Padding inside scroll area */}
                         {/* Servings Adjuster */}
                         <div className="flex items-center justify-between my-4 p-3 bg-muted/50 rounded-md">
                             <div className="flex items-center gap-2">
                                 <Users className="h-5 w-5 text-primary" />
                                 <span className="font-medium">Servings:</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <Button variant="outline" size="icon" onClick={decrementServings} disabled={modalServings <= 1} aria-label="Decrease servings">
                                     <Minus className="h-4 w-4" />
                                 </Button>
                                 <span className="font-semibold text-lg w-8 text-center">{modalServings}</span>
                                 <Button variant="outline" size="icon" onClick={incrementServings} aria-label="Increase servings">
                                     <Plus className="h-4 w-4" />
                                 </Button>
                             </div>
                         </div>

                        {/* Ingredients and Procedure Grid */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-4">
                            {/* Ingredients */}
                            <div>
                                <h3 className="font-semibold mb-2 text-lg border-b pb-1">Ingredients</h3>
                                <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm">
                                    {adjustedIngredients.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                             {/* Procedure */}
                            <div>
                                <h3 className="font-semibold mb-2 text-lg border-b pb-1">Procedure</h3>
                                <ol className="list-decimal list-outside pl-5 space-y-2 text-sm">
                                    {selectedRecipe.procedure.map((step, index) => (
                                        <li key={index} className="pl-1">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                         {/* Add to Log Button */}
                        <div className="mt-6">
                             <Button onClick={handleAddCalories} className="w-full">
                                 <PlusCircle className="mr-2 h-4 w-4" />
                                 Add {totalCaloriesForServings} kcal to Log ({modalServings} serving{modalServings !== 1 ? 's' : ''})
                             </Button>
                        </div>
                    </ScrollArea>
                 </>
               )}
            </DialogContent>
        </Dialog>

    </div>
  );
}
