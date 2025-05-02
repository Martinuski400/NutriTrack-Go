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
  className?: string;
}

export function RecipeCard({ recipe, onToggleFavorite, className }: RecipeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the heart
    onToggleFavorite(recipe.id);
  };

  return (
    <Card className={cn("w-[250px] shrink-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer", className)}>
      <CardHeader className="p-0 relative">
        <Image
          src={recipe.imageUrl}
          alt={recipe.name}
          width={250}
          height={150}
          className="aspect-[3/2] object-cover w-full"
          data-ai-hint={recipe.imageHint}
        />
         <Button
            variant="ghost"
            size="icon"
            className={cn(
                "absolute top-2 right-2 rounded-full bg-black/30 hover:bg-black/50 text-white",
                recipe.isFavorite && "text-red-500 bg-black/50" // Style for favorited
                )}
            onClick={handleFavoriteClick}
            aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
            <Heart className={cn("h-5 w-5", recipe.isFavorite && "fill-current")} />
         </Button>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="text-base font-semibold leading-tight mb-1 truncate">{recipe.name}</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {recipe.calories} kcal
          </span>
        </div>
      </CardContent>
      {/* Optional: Add a footer for tags or quick actions if needed later
      <CardFooter className="p-3 pt-0">
         {recipe.isQuick && <Badge variant="secondary">Quick</Badge>}
      </CardFooter> */}
    </Card>
  );
}
