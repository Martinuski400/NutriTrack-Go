// src/components/recipes/recipe-card.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, Clock, Flame } from 'lucide-react';
import { Recipe } from '@/app/recipes/recipe-data'; // Assuming data structure is defined here
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onClick: () => void; // Add onClick handler for the card itself
  className?: string;
}

export function RecipeCard({ recipe, onToggleFavorite, onClick, className }: RecipeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the heart
    onToggleFavorite(recipe.id);
  };

  return (
    <Card
        // Adjusted base width, shrink-0 prevents shrinking in flexbox, w-full ensures it takes grid width
        className={cn("w-full sm:w-[250px] shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer", className)}
        onClick={onClick} // Add onClick to the card
        role="button" // Add role for accessibility
        aria-label={`View recipe details for ${recipe.name}`} // Add aria-label
        tabIndex={0} // Make card focusable
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }} // Allow activation with keyboard
        >
      <CardHeader className="p-0 relative">
        {/* Ensure image takes full card width */}
        <Image
          src={recipe.imageUrl}
          alt={recipe.name}
          width={300} // Adjusted width for card display consistency
          height={200} // Adjust height to match aspect ratio
          className="aspect-[3/2] object-cover w-full"
          data-ai-hint={recipe.imageHint} // Use imageHint here
          priority={recipe.isPopular} // Prioritize loading popular recipe images slightly
          // Removed unoptimized prop, let Next.js handle optimization if possible
        />
         <Button
            variant="ghost"
            size="icon"
            className={cn(
                "absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/50 text-white backdrop-blur-sm", // Added backdrop blur
                recipe.isFavorite && "text-destructive bg-black/50" // Use theme destructive color
                )}
            onClick={handleFavoriteClick}
            aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            <Heart className={cn("h-5 w-5", recipe.isFavorite && "fill-current")} />
         </Button>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-base font-semibold leading-tight mb-1 truncate" title={recipe.name}>{recipe.name}</CardTitle>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground"> {/* Allow wrapping */}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {recipe.calories} kcal
          </span>
           {/* Display original servings */}
           <span className="flex items-center gap-1">
             <Users className="h-3 w-3" />
             {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
           </span>
          {/* Optionally show category/cuisine badge */}
          {/* <Badge variant="outline" className="text-xs capitalize">{recipe.category}</Badge> */}
        </div>
      </CardContent>
      {/* Optional Footer can be added back if needed
      <CardFooter className="p-3 pt-0">
         {recipe.isQuick && <Badge variant="secondary">Quick</Badge>}
      </CardFooter> */}
    </Card>
  );
}
