export interface Recipe {
    id: string;
    name: string;
    description?: string;
    ingredients: string[];
    procedure: string[];
    imageUrl: string;
    imageHint: string; // Keywords for image search
    duration: number; // minutes
    calories: number;
    cuisine?: string;
    category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink' | 'Side';
    isPopular?: boolean;
    isQuick?: boolean;
    isFavorite?: boolean; // Added favorite status
}

// Sample Recipe Data - More can be added
export const sampleRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Avocado Toast with Poached Egg',
      description: 'A classic healthy breakfast or light lunch, featuring creamy avocado and a perfectly poached egg on whole-wheat toast.',
      ingredients: ['1 slice whole-wheat bread', '1/2 avocado', '1 large egg', 'Salt, pepper to taste', 'Red pepper flakes (optional)'],
      procedure: [
        'Toast the bread slice until golden brown.',
        'While bread is toasting, poach the egg: bring a small pot of water to a simmer, crack the egg into a small bowl, gently slide the egg into the water, and cook for 3-4 minutes for a runny yolk.',
        'Mash the avocado onto the toasted bread.',
        'Carefully remove the poached egg with a slotted spoon and place it on top of the avocado toast.',
        'Season with salt, pepper, and red pepper flakes if desired.'
      ],
      imageUrl: 'https://picsum.photos/300/201', // Unique size for variation
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
      description: 'A simplified lasagna baked on a sheet pan, offering layers of flavor without the traditional layering hassle.',
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
      imageUrl: 'https://picsum.photos/301/200', // Unique size
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
      description: 'A refreshing and quick smoothie packed with mixed berries, perfect for a fast breakfast or snack.',
      ingredients: ['1 cup frozen mixed berries', '1/2 cup yogurt (plain or vanilla)', '1/2 cup milk (any kind)', '1 tbsp honey or maple syrup (optional)'],
      procedure: [
        'Combine all ingredients in a blender.',
        'Blend until smooth.',
        'Add more milk if needed to reach desired consistency.',
        'Pour into a glass and serve immediately.'
      ],
      imageUrl: 'https://picsum.photos/300/202', // Unique size
      imageHint: 'berry smoothie yogurt',
      duration: 5,
      calories: 210, // Approximation
      category: 'Snack',
      isQuick: true,
      isFavorite: false,
    },
    {
      id: '4',
      name: 'Simple Chicken Stir-Fry',
      description: 'A fast and versatile weeknight dinner featuring tender chicken strips and crisp-tender vegetables in a savory sauce.',
      ingredients: ['1 lb boneless, skinless chicken breast, cut into strips', '1 tbsp soy sauce', '1 tsp cornstarch', '2 tbsp vegetable oil', '1 bag (12 oz) frozen stir-fry vegetables', '1/4 cup stir-fry sauce'],
      procedure: [
          'In a bowl, toss chicken with soy sauce and cornstarch.',
          'Heat 1 tbsp oil in a large skillet or wok over medium-high heat.',
          'Add chicken and stir-fry until cooked through, about 5-7 minutes. Remove chicken from skillet.',
          'Add remaining 1 tbsp oil to the skillet. Add frozen vegetables and stir-fry according to package directions until crisp-tender.',
          'Return chicken to the skillet. Add stir-fry sauce and toss to coat.',
          'Cook for 1-2 minutes more until heated through. Serve immediately, optionally with rice or noodles.'
      ],
      imageUrl: 'https://picsum.photos/302/200', // Unique size
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
      description: 'A refreshing salad bursting with classic Mediterranean flavors like cucumber, tomatoes, olives, and feta cheese.',
      ingredients: ['1 cucumber, chopped', '1 red bell pepper, chopped', '1 green bell pepper, chopped', '1/2 red onion, thinly sliced', '1 cup cherry tomatoes, halved', '1/2 cup Kalamata olives, pitted', '4 oz feta cheese, crumbled', '2 tbsp olive oil', '1 tbsp red wine vinegar', '1 tsp dried oregano', 'Salt and pepper to taste'],
      procedure: [
          'In a large bowl, combine cucumber, bell peppers, red onion, tomatoes, and olives.',
          'In a small bowl, whisk together olive oil, red wine vinegar, oregano, salt, and pepper.',
          'Pour the dressing over the vegetables and toss gently to coat.',
          'Sprinkle the crumbled feta cheese over the top.',
          'Serve immediately or chill for later.'
      ],
      imageUrl: 'https://picsum.photos/300/203', // Unique size
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
        description: 'A simple yet incredibly flavorful pasta dish featuring garlic, olive oil, and a hint of red pepper flakes.',
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
        imageUrl: 'https://picsum.photos/303/200', // Unique size
        imageHint: 'spaghetti pasta garlic oil',
        duration: 20,
        calories: 480, // Approximation
        category: 'Dinner',
        cuisine: 'Italian',
        isQuick: true,
        isFavorite: false,
    },
    {
      id: '7',
      name: 'Classic Beef Tacos',
      description: 'Flavorful ground beef filling served in crispy taco shells with your favorite toppings.',
      ingredients: ['1 lb ground beef', '1 packet taco seasoning', '3/4 cup water', '12 hard taco shells', 'Lettuce, shredded', 'Tomato, diced', 'Onion, diced', 'Shredded cheddar cheese', 'Sour cream'],
      procedure: [
          'In a large skillet, cook ground beef over medium-high heat until browned. Drain excess fat.',
          'Stir in taco seasoning and water. Bring to a simmer.',
          'Reduce heat and simmer for 5-7 minutes, stirring occasionally, until sauce has thickened slightly.',
          'Warm taco shells according to package directions.',
          'Fill taco shells with beef mixture and desired toppings like lettuce, tomato, onion, cheese, and sour cream.'
      ],
      imageUrl: 'https://picsum.photos/300/204', // Unique size
      imageHint: 'beef tacos cheese',
      duration: 25,
      calories: 350, // Approximation per taco, varies with toppings
      category: 'Dinner',
      cuisine: 'Mexican',
      isPopular: true,
      isFavorite: false,
    },
    {
      id: '8',
      name: 'Lemon Herb Roasted Chicken',
      description: 'A juicy and flavorful roasted chicken infused with lemon and herbs.',
      ingredients: ['1 (3-4 lb) whole chicken', '1 lemon, halved', '4 sprigs fresh rosemary', '4 sprigs fresh thyme', '4 cloves garlic, smashed', '2 tbsp olive oil', 'Salt and black pepper to taste'],
      procedure: [
          'Preheat oven to 425°F (220°C).',
          'Remove giblets from chicken cavity. Pat chicken dry with paper towels.',
          'Place lemon halves, rosemary, thyme, and garlic inside the chicken cavity.',
          'Place chicken in a roasting pan. Rub olive oil all over the skin.',
          'Season generously with salt and pepper.',
          'Roast for 1 hour and 15 minutes to 1 hour and 30 minutes, or until internal temperature reaches 165°F (74°C) in the thickest part of the thigh.',
          'Let chicken rest for 10-15 minutes before carving.'
      ],
      imageUrl: 'https://picsum.photos/304/200', // Unique size
      imageHint: 'roasted chicken lemon herb',
      duration: 90,
      calories: 600, // Approximation per serving
      category: 'Dinner',
      isPopular: true,
      isFavorite: false,
    },
    {
      id: '9',
      name: 'Caprese Salad Skewers',
      description: 'Easy and elegant skewers with cherry tomatoes, fresh mozzarella, and basil, drizzled with balsamic glaze.',
      ingredients: ['1 pint cherry tomatoes', '8 oz fresh mozzarella balls (bocconcini or ciliegine)', 'Fresh basil leaves', 'Balsamic glaze', 'Wooden skewers'],
      procedure: [
          'Thread one cherry tomato, one basil leaf (folded if large), and one mozzarella ball onto each skewer.',
          'Repeat the pattern if desired, depending on skewer length.',
          'Arrange skewers on a platter.',
          'Drizzle generously with balsamic glaze just before serving.'
      ],
      imageUrl: 'https://picsum.photos/300/205', // Unique size
      imageHint: 'caprese skewers mozzarella basil',
      duration: 10,
      calories: 150, // Approximation per few skewers
      category: 'Snack',
      cuisine: 'Italian',
      isQuick: true,
      isFavorite: false,
    },
     {
      id: '10',
      name: 'Vegetarian Chili',
      description: 'A hearty and flavorful chili packed with beans, vegetables, and spices.',
      ingredients: ['1 tbsp olive oil', '1 large onion, chopped', '2 bell peppers (any color), chopped', '3 cloves garlic, minced', '1 tbsp chili powder', '2 tsp cumin', '1 tsp smoked paprika', '1/2 tsp oregano', '1 (28 oz) can crushed tomatoes', '1 (15 oz) can kidney beans, rinsed and drained', '1 (15 oz) can black beans, rinsed and drained', '1 (15 oz) can corn, drained', 'Salt and pepper to taste', 'Optional toppings: sour cream, shredded cheese, cilantro, avocado'],
      procedure: [
        'Heat olive oil in a large pot or Dutch oven over medium heat.',
        'Add onion and bell peppers, cook until softened, about 5-7 minutes.',
        'Stir in garlic, chili powder, cumin, smoked paprika, and oregano. Cook for 1 minute until fragrant.',
        'Pour in crushed tomatoes. Add kidney beans, black beans, and corn.',
        'Bring to a simmer, then reduce heat to low, cover, and cook for at least 30 minutes, or longer for flavors to meld, stirring occasionally.',
        'Season with salt and pepper to taste.',
        'Serve hot with desired toppings.'
      ],
      imageUrl: 'https://picsum.photos/305/200', // Unique size
      imageHint: 'vegetarian chili beans',
      duration: 45,
      calories: 380, // Approximation per serving
      category: 'Dinner',
      isPopular: false, // Example
      isFavorite: false,
    },
    // Add many more recipes here...
];

// Sample Cuisines
export const sampleCuisines = [
    { name: 'Italian', imageUrl: 'https://picsum.photos/150/101', imageHint: 'italian food pasta pizza' },
    { name: 'Mexican', imageUrl: 'https://picsum.photos/151/100', imageHint: 'mexican food tacos burrito' },
    { name: 'Indian', imageUrl: 'https://picsum.photos/150/102', imageHint: 'indian food curry naan' },
    { name: 'Chinese', imageUrl: 'https://picsum.photos/152/100', imageHint: 'chinese food noodles dumplings' },
    { name: 'Mediterranean', imageUrl: 'https://picsum.photos/150/103', imageHint: 'mediterranean food salad hummus' },
    { name: 'American', imageUrl: 'https://picsum.photos/153/100', imageHint: 'american food burger fries' },
    { name: 'Japanese', imageUrl: 'https://picsum.photos/150/104', imageHint: 'japanese food sushi ramen' },
    { name: 'Thai', imageUrl: 'https://picsum.photos/154/100', imageHint: 'thai food green curry pad thai' },
    // Add more cuisines
];

export const recipeCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink', 'Side'] as const;
export type RecipeCategory = typeof recipeCategories[number];
