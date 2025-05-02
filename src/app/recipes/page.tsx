'use client';

import * as React from 'react';
import { Search, Filter, Heart, X, Clock, Flame } from 'lucide-react'; // Added Clock and Flame
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

const DEBOUNCE_TIME = 300; // milliseconds

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
        setRecipes(prevRecipes => {
            const updated = prevRecipes.map(recipe =>
                recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
            );
            const targetRecipe = updated.find(r => r.id === id);
            saveFavorites(updated); // Save to localStorage
             toast({
                title: targetRecipe?.isFavorite ? "Added to Favorites" : "Removed from Favorites",
                description: `${targetRecipe?.name}`,
            });
            return updated;
        });

        // If the modal is open and the toggled recipe is the selected one, update its state
        if (selectedRecipe && selectedRecipe.id === id) {
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
    setIsModalOpen(true);
  };

   const closeRecipeModal = () => {
     setIsModalOpen(false);
     // Add a small delay before clearing the selected recipe to allow for fade-out animation
     setTimeout(() => {
       setSelectedRecipe(null);
     }, 300);
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0"> {/* Remove default padding */}
               {selectedRecipe && (
                 <>
                    <DialogHeader className="relative p-0"> {/* Remove default padding */}
                        <div className="relative"> {/* Container for image and buttons */}
                            <Image
                            src={selectedRecipe.imageUrl}
                            alt={selectedRecipe.name}
                            width={600}
                            height={300}
                            className="aspect-video object-cover w-full rounded-t-lg mb-0" // Remove bottom margin
                            data-ai-hint={selectedRecipe.imageHint}
                            />
                             <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute top-4 right-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm z-10", // Position favorite button
                                    selectedRecipe.isFavorite && "text-destructive bg-black/60" // Use destructive color from theme
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
                                    className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm z-10 p-1 opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" // Consistent styling with favorite button
                                >
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close</span>
                                </Button>
                              </DialogClose>
                         </div>
                         <div className="p-6"> {/* Add padding for text content */}
                            <DialogTitle className="text-2xl font-bold mb-1">{selectedRecipe.name}</DialogTitle>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1 mb-3">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {selectedRecipe.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Flame className="h-4 w-4" />
                                    {selectedRecipe.calories} kcal
                                </span>
                                {selectedRecipe.cuisine && (
                                    <span className="flex items-center gap-1 capitalize">
                                         {/* Consider adding a cuisine icon if available */}
                                        {selectedRecipe.cuisine}
                                    </span>
                                )}
                                 <span className="flex items-center gap-1 capitalize">
                                     {/* Consider adding a category icon */}
                                    {selectedRecipe.category}
                                 </span>
                            </div>
                             {selectedRecipe.description && (
                                 <DialogDescription className="text-base text-foreground/90"> {/* Slightly less muted */}
                                    {selectedRecipe.description}
                                 </DialogDescription>
                             )}
                         </div>

                    </DialogHeader>
                    <ScrollArea className="flex-grow overflow-y-auto px-6 pb-6 -mt-2"> {/* Add padding and adjust margin */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6"> {/* Increased gap */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Ingredients</h3> {/* Added border */}
                            <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm"> {/* Adjusted list style and spacing */}
                            {selectedRecipe.ingredients.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Procedure</h3> {/* Added border */}
                            <ol className="list-decimal list-outside pl-5 space-y-2 text-sm"> {/* Adjusted list style and spacing */}
                            {selectedRecipe.procedure.map((step, index) => (
                                <li key={index} className="pl-1">{step}</li> // Added slight padding
                            ))}
                            </ol>
                        </div>
                        </div>
                    </ScrollArea>
                 </>
               )}
            </DialogContent>
        </Dialog>

    </div>
  );
}

    