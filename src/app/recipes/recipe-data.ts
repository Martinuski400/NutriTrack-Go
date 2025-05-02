export interface Recipe {
    id: string;
    name: string;
    description?: string;
    ingredients: string[];
    procedure: string[];
    imageUrl: string;
    imageHint: string;
    duration: number; // minutes
    calories: number;
    cuisine?: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink' | 'Side';
    isPopular?: boolean;
    isQuick?: boolean;
    isFavorite?: boolean; // Added favorite status
}

// Sample Recipe Data - Many more should be added for a real app
export const sampleRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Avocado Toast with Poached Egg',
      description: 'A classic healthy breakfast or light lunch.',
      ingredients: ['1 slice whole-wheat bread', '1/2 avocado', '1 large egg', 'Salt, pepper to taste', 'Red pepper flakes (optional)'],
      procedure: [
        'Toast the bread slice until golden brown.',
        'While bread is toasting, poach the egg: bring a small pot of water to a simmer, crack the egg into a small bowl, gently slide the egg into the water, and cook for 3-4 minutes for a runny yolk.',
        'Mash the avocado onto the toasted bread.',
        'Carefully remove the poached egg with a slotted spoon and place it on top of the avocado toast.',
        'Season with salt, pepper, and red pepper flakes if desired.'
      ],
      imageUrl: 'https://picsum.photos/300/200',
      imageHint: 'avocado toast egg',
      duration: 15,
      calories: 308,
      category: 'Breakfast',
      isPopular: true,
      isQuick: true,
      isFavorite: false,
    },
    {
      id: '2',
      name: 'Easy Sheet Pan Lasagna',
      description: 'A simplified lasagna baked on a sheet pan.',
      ingredients: ['1 lb ground beef', '1 onion, chopped', '2 cloves garlic, minced', '1 (24 oz) jar marinara sauce', '1 (15 oz) container ricotta cheese', '1 egg', '1/4 cup grated Parmesan cheese', '1 tsp Italian seasoning', '12 lasagna noodles, cooked', '2 cups shredded mozzarella cheese'],
      procedure: [
        'Preheat oven to 375°F (190°C). Grease a large baking sheet.',
        'In a skillet, brown the ground beef with onion and garlic. Drain fat. Stir in marinara sauce.',
        'In a bowl, mix ricotta, egg, Parmesan, and Italian seasoning.',
        'Spread a thin layer of meat sauce on the baking sheet. Arrange 4 noodles on top. Spread half the ricotta mixture over noodles. Sprinkle with 1/3 of the mozzarella. Top with 1/3 of the meat sauce.',
        'Repeat layers: 4 noodles, remaining ricotta, 1/3 mozzarella, 1/3 meat sauce.',
        'Top with remaining 4 noodles, remaining meat sauce, and remaining mozzarella.',
        'Bake for 25-30 minutes, or until bubbly and cheese is melted and golden.'
      ],
      imageUrl: 'https://picsum.photos/300/200',
      imageHint: 'lasagna sheet pan',
      duration: 60,
      calories: 550, // Approximation
      category: 'Dinner',
      isPopular: true,
      isFavorite: false,
    },
     {
      id: '3',
      name: 'Quick Berry Smoothie',
      description: 'A refreshing and quick smoothie.',
      ingredients: ['1 cup frozen mixed berries', '1/2 cup yogurt (plain or vanilla)', '1/2 cup milk (any kind)', '1 tbsp honey or maple syrup (optional)'],
      procedure: [
        'Combine all ingredients in a blender.',
        'Blend until smooth.',
        'Add more milk if needed to reach desired consistency.',
        'Pour into a glass and serve immediately.'
      ],
      imageUrl: 'https://picsum.photos/300/200',
      imageHint: 'berry smoothie',
      duration: 5,
      calories: 210, // Approximation
      category: 'Snack',
      isQuick: true,
      isFavorite: false,
    },
    {
      id: '4',
      name: 'Simple Chicken Stir-Fry',
      description: 'A fast and versatile weeknight dinner.',
      ingredients: ['1 lb boneless, skinless chicken breast, cut into strips', '1 tbsp soy sauce', '1 tsp cornstarch', '2 tbsp vegetable oil', '1 bag (12 oz) frozen stir-fry vegetables', '1/4 cup stir-fry sauce'],
      procedure: [
          'In a bowl, toss chicken with soy sauce and cornstarch.',
          'Heat 1 tbsp oil in a large skillet or wok over medium-high heat.',
          'Add chicken and stir-fry until cooked through, about 5-7 minutes. Remove chicken from skillet.',
          'Add remaining 1 tbsp oil to the skillet. Add frozen vegetables and stir-fry according to package directions until crisp-tender.',
          'Return chicken to the skillet. Add stir-fry sauce and toss to coat.',
          'Cook for 1-2 minutes more until heated through. Serve immediately, optionally with rice or noodles.'
      ],
      imageUrl: 'https://picsum.photos/300/200',
      imageHint: 'chicken stir fry vegetables',
      duration: 20,
      calories: 400, // Approximation, without rice
      category: 'Lunch',
      isQuick: true,
      isFavorite: false,
    },
     {
      id: '5',
      name: 'Greek Salad',
      description: 'A refreshing salad with classic Mediterranean flavors.',
      ingredients: ['1 cucumber, chopped', '1 red bell pepper, chopped', '1 green bell pepper, chopped', '1/2 red onion, thinly sliced', '1 cup cherry tomatoes, halved', '1/2 cup Kalamata olives, pitted', '4 oz feta cheese, crumbled', '2 tbsp olive oil', '1 tbsp red wine vinegar', '1 tsp dried oregano', 'Salt and pepper to taste'],
      procedure: [
          'In a large bowl, combine cucumber, bell peppers, red onion, tomatoes, and olives.',
          'In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.',
          'Pour the dressing over the vegetables and toss gently to coat.',
          'Sprinkle the crumbled feta cheese over the top.',
          'Serve immediately or chill for later.'
      ],
      imageUrl: 'https://picsum.photos/300/200',
      imageHint: 'greek salad feta olives',
      duration: 15,
      calories: 250, // Approximation
      category: 'Lunch',
      cuisine: 'Mediterranean',
      isQuick: true,
      isFavorite: false,
    },
     {
        id: '6',
        name: 'Spaghetti Aglio e Olio',
        description: 'Simple yet flavorful pasta with garlic and oil.',
        ingredients: ['8 oz spaghetti', '1/4 cup olive oil', '4-6 cloves garlic, thinly sliced', '1/4 tsp red pepper flakes (or to taste)', '2 tbsp chopped fresh parsley', 'Salt to taste', 'Grated Parmesan cheese (optional, for serving)'],
        procedure: [
            'Cook spaghetti according to package directions. Reserve about 1/2 cup of pasta water before draining.',
            'While pasta is cooking, heat olive oil in a large skillet over medium-low heat.',
            'Add sliced garlic and red pepper flakes. Cook slowly, stirring occasionally, until garlic is lightly golden (do not brown). About 5-8 minutes.',
            'Drain the pasta and add it directly to the skillet with the garlic oil.',
            'Add the chopped parsley and about 1/4 cup of the reserved pasta water. Toss well to coat the pasta, adding more pasta water if it seems dry.',
            'Season with salt to taste.',
            'Serve immediately, topped with grated Parmesan cheese if desired.'
        ],
        imageUrl: 'https://picsum.photos/300/200',
        imageHint: 'spaghetti garlic oil pasta',
        duration: 20,
        calories: 480, // Approximation
        category: 'Dinner',
        cuisine: 'Italian',
        isQuick: true,
        isFavorite: false,
    },
    // Add many more recipes here...
];

// Sample Cuisines
export const sampleCuisines = [
    { name: 'Italian', imageUrl: 'https://picsum.photos/150/100', imageHint: 'italian food pasta' },
    { name: 'Mexican', imageUrl: 'https://picsum.photos/150/100', imageHint: 'mexican food tacos' },
    { name: 'Indian', imageUrl: 'https://picsum.photos/150/100', imageHint: 'indian food curry' },
    { name: 'Chinese', imageUrl: 'https://picsum.photos/150/100', imageHint: 'chinese food noodles' },
    { name: 'Mediterranean', imageUrl: 'https://picsum.photos/150/100', imageHint: 'mediterranean food salad' },
    { name: 'American', imageUrl: 'https://picsum.photos/150/100', imageHint: 'american food burger' },
    // Add more cuisines
];

export const recipeCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink', 'Side'] as const;
export type RecipeCategory = typeof recipeCategories[number];
