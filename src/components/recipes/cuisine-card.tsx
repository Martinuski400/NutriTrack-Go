'use client';

import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Cuisine {
    name: string;
    imageUrl: string;
    imageHint: string; // Add imageHint
}

interface CuisineCardProps {
  cuisine: Cuisine;
  className?: string;
}

export function CuisineCard({ cuisine, className }: CuisineCardProps) {
  return (
    <Card className={cn("w-[150px] shrink-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer relative", className)}>
      <Image
        src={cuisine.imageUrl}
        alt={cuisine.name}
        width={150}
        height={100}
        className="aspect-[3/2] object-cover w-full"
        data-ai-hint={cuisine.imageHint} // Use imageHint here
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <CardContent className="absolute bottom-0 left-0 p-2 w-full">
        <CardTitle className="text-sm font-semibold text-white leading-tight truncate">{cuisine.name}</CardTitle>
      </CardContent>
    </Card>
  );
}
