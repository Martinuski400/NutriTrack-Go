'use client';

import * as React from 'react';
import { Search, Filter, Heart, X } from 'lucide-react';
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
  const [recipes, setRecipes] = React.useState<Recipe[]>(sampleRecipes);
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false);

  // Debounce search term
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

   // Load favorites from localStorage
   React.useEffect(() => {
     const savedFavorites = localStorage.getItem('nutri_favoriteRecipes');
     if (savedFavorites) {
       const favoriteIds = JSON.parse(savedFavorites) as string[];
       setRecipes(prevRecipes =>
         prevRecipes.map(recipe => ({
           ...recipe,
           isFavorite: favoriteIds.includes(recipe.id),
         }))
       );
     }
   }, []);

    // Save favorites to localStorage
    const saveFavorites = (updatedRecipes: Recipe[]) => {
        const favoriteIds = updatedRecipes.filter(r => r.isFavorite).map(r => r.id);
        localStorage.setItem('nutri_favoriteRecipes', JSON.stringify(favoriteIds));
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
    return recipes.filter((recipe) => {
      const matchesSearch = debouncedSearchTerm
        ? recipe.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          recipe.ingredients.some(ing => ing.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        : true;
      const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true;
      const matchesFavorite = showOnlyFavorites ? recipe.isFavorite : true;

      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [recipes, debouncedSearchTerm, selectedCategory, showOnlyFavorites]);


  const popularRecipes = filteredRecipes.filter(recipe => recipe.isPopular && recipe.category === (selectedCategory ?? recipe.category));
  const quickRecipes = filteredRecipes.filter(recipe => recipe.isQuick && recipe.category === (selectedCategory ?? recipe.category));

  const handleCategoryClick = (category: RecipeCategory) => {
    setSelectedCategory(prev => (prev === category ? null : category)); // Toggle selection
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
            placeholder="Search for a meal or ingredient"
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
            className={cn(showOnlyFavorites && "text-red-500 border-red-500")}
        >
            <Heart className={cn("h-5 w-5", showOnlyFavorites && "fill-current")} />
         </Button>
        {/* <Button variant="outline" size="icon" aria-label="Filter">
          <Filter className="h-4 w-4" />
        </Button> */}
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


        {/* Display based on filters */}
        {debouncedSearchTerm || selectedCategory || showOnlyFavorites ? (
            // Show filtered results
             <div>
                <h2 className="mb-3 text-lg font-semibold">
                   {showOnlyFavorites ? "Favorite Recipes" :
                   selectedCategory ? `${selectedCategory} Recipes` :
                   `Search Results for "${debouncedSearchTerm}"`}
                </h2>
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} className="w-full"/> // Make cards full width within grid
                    ))}
                    </div>
                 ) : (
                    <p className="text-center text-muted-foreground">No recipes found matching your criteria.</p>
                 )}
             </div>
        ) : (
            // Show default sections (Cuisines, Popular, Quick)
            <>
                 {/* Cuisines Section */}
                  <section className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">Cuisines</h2>
                    {/* <Button variant="link" className="p-0 h-auto text-primary">See all</Button> */}
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
                    {/* <Button variant="link" className="p-0 h-auto text-primary">See all</Button> */}
                    </div>
                     <ScrollArea className="w-full whitespace-nowrap">
                       <div className="flex space-x-4 pb-3">
                         {popularRecipes.length > 0 ? (
                           popularRecipes.map((recipe) => (
                             <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} />
                           ))
                         ) : (
                           <p className="text-muted-foreground pl-2">No popular recipes in this category.</p>
                         )}
                       </div>
                       <ScrollBar orientation="horizontal" />
                     </ScrollArea>
                 </section>

                  {/* Quick Meals Section */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold">10-Minute Meals</h2> {/* Changed title */}
                    {/* <Button variant="link" className="p-0 h-auto text-primary">See all</Button> */}
                    </div>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4 pb-3">
                           {quickRecipes.length > 0 ? (
                              quickRecipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} onClick={() => openRecipeModal(recipe)} />
                              ))
                            ) : (
                              <p className="text-muted-foreground pl-2">No quick meals in this category.</p>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                 </section>
            </>
        )}


        {/* Recipe Detail Modal */}
         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
               {selectedRecipe && (
                 <>
                    <DialogHeader className="relative pr-10"> {/* Add padding for close button */}
                        <Image
                        src={selectedRecipe.imageUrl}
                        alt={selectedRecipe.name}
                        width={600}
                        height={300}
                        className="aspect-video object-cover w-full rounded-t-lg -mt-6 -mx-6 mb-4" // Adjust margins
                        data-ai-hint={selectedRecipe.imageHint}
                        />
                         <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute top-8 right-8 rounded-full bg-black/30 hover:bg-black/50 text-white z-10", // Position higher
                                selectedRecipe.isFavorite && "text-red-500 bg-black/50"
                                )}
                            onClick={() => toggleFavorite(selectedRecipe.id)}
                            aria-label={selectedRecipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                            <Heart className={cn("h-5 w-5", selectedRecipe.isFavorite && "fill-current")} />
                         </Button>
                        <DialogTitle className="text-2xl font-bold">{selectedRecipe.name}</DialogTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {selectedRecipe.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                                <Flame className="h-4 w-4" />
                                {selectedRecipe.calories} kcal
                            </span>
                        </div>
                         {selectedRecipe.description && (
                             <DialogDescription className="mt-2 text-base">
                                {selectedRecipe.description}
                             </DialogDescription>
                         )}
                          <DialogClose
                            onClick={closeRecipeModal}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-background/50 hover:bg-background/80 p-1" // Added styling for visibility
                           >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                          </DialogClose>
                    </DialogHeader>
                    <ScrollArea className="flex-grow overflow-y-auto pr-6 -mr-6"> {/* Make content scrollable */}
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Ingredients</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedRecipe.ingredients.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-lg">Procedure</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                            {selectedRecipe.procedure.map((step, index) => (
                                <li key={index}>{step}</li>
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
