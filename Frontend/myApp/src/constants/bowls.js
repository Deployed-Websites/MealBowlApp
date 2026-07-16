// Single source of truth for bowl data. Before this file existed, bowl
// names/prices were hardcoded in HomePage.jsx, and duplicated again (with
// fuller detail - macros, ingredients, hot flag) in SpecificBowlContents.jsx.
// Changing a price meant remembering to edit both files. Now there's one
// list, and both components read from it.
//
// NOTE: the Django backend still doesn't validate order prices against
// anything - it trusts whatever bowlName/bowlTotal the frontend sends. This
// file fixes the frontend-side duplication, but the "someone could fake a
// price via devtools" gap needs a backend-side fix (a real Bowl model that
// updateOrder/updateBasket validate against) - flagged for later, not fixed
// here.

import bowl from "../assets/bowl.png";
import bowl3 from "../assets/Paneer-power-bowl.jpg";
import bowl4 from "../assets/bowl4.jpg";
import bowl5 from "../assets/bowl5.jpg";
import bowl6 from "../assets/bowl6.jpg";
import bowl7 from "../assets/bowl7.jpg";
import bowl8 from "../assets/Rajma-Chickpea-superfood-bowl.jpg";

// Same slugify logic that used to live separately in BowlImage.jsx (encode)
// and SpecificBowlContents.jsx (decode). Kept in one place now so both
// directions can never drift apart.
export function slugify(name) {
  return name
    .split("")
    .map((char) => (char === " " ? "-" : char))
    .join("");
}

export const BOWLS = [
  {
    name: "Soya Chunk High-Protein Bowl",
    price: 200,
    picture: bowl,
    hot: true,
    macros: { calories: 460, protein: 32, carbs: 30, fats: 18 },
    ingredients: [
      "100g cooked soya chunks (masala sautéed)",
      "1/2 cup mashed sweet potato or mashed potato",
      "1/4 cup steamed broccoli and beans",
      "2 tbsp roasted peanuts",
      "Sprinkle of chat masala and lemon juice",
    ],
  },
  {
    name: "Paneer Power Bowl",
    price: 300,
    picture: bowl3,
    hot: true,
    macros: { calories: 480, protein: 30, carbs: 35, fats: 20 },
    ingredients: [
      "150g Grilled paneer (cubes, tossed with spices)",
      "1/2 cup cooked brown rice or quinoa",
      "1/4 cup boiled black chana",
      "1/2 cup sautéed bell peppers, zucchini, and spinach",
      "1 tsp olive oil",
      "Toppings: Fresh coriander, lemon juice,black pepper",
    ],
  },
  {
    name: "Tofu Stir-Fry Bowl",
    price: 400,
    picture: bowl4,
    hot: true,
    macros: { calories: 480, protein: 28, carbs: 30, fats: 22 },
    ingredients: [
      "150g tofu (pan-grilled with turmeric, garlic, and pepper)",
      "1/2 cup cooked oats or barley",
      "1/4 cup capsicum, mushroom, and baby corn stir-fry",
      "1 tsp sesame oil",
      "Toppings: Toasted sesame seeds and soy sauce drizzle",
    ],
  },
  {
    name: "Chicken Tikka Macro Bowl",
    price: 500,
    picture: bowl5,
    hot: false,
    macros: { calories: 500, protein: 38, carbs: 30, fats: 22 },
    ingredients: [
      "150g grilled chicken tikka (marinated in curd + spices)",
      "1/2 cup cooked millets or jeera brown rice",
      "1/4 cup cucumber-tomato-onion salad",
      "1 tbsp hung curd mint dip",
      "1 tsp ghee for flavor",
    ],
  },
  {
    name: "Fish & Veggie Grain Bowl",
    price: 600,
    picture: bowl6,
    hot: false,
    macros: { calories: 520, protein: 36, carbs: 25, fats: 28 },
    ingredients: [
      "150g grilled fish (pomfret or salmon, spiced with turmeric, garlic)",
      "1/2 cup cooked red rice or foxtail millet",
      "1/2 avocado or 1 tsp flaxseed oil",
      "1/2 cup sautéed kale/spinach + carrots",
      "Toppings: Roasted sesame seeds, green chutney drizzle",
    ],
  },
  {
    name: "Egg Bhurji Nutrition Bowl",
    price: 700,
    picture: bowl7,
    hot: true,
    macros: { calories: 450, protein: 28, carbs: 25, fats: 20 },
    ingredients: [
      "3 egg whites + 2 whole eggs (bhurji with onion, tomato, green chili)",
      "1/2 cup cooked oats or rolled oats khichdi",
      "1/4 cup steamed cauliflower or peas",
      "1 tsp ghee or butter",
      "Toppings: Mint, lemon, and flaxseed powder",
    ],
  },
  {
    name: "Rajma Superfood Bowl",
    price: 800,
    picture: bowl8,
    hot: false,
    macros: { calories: 470, protein: 22, carbs: 38, fats: 16 },
    ingredients: [
      "3/4 cup boiled rajma (kidney beans)",
      "1/2 cup cooked red rice or millets",
      "1/2 cup mixed vegetables (carrot, peas, beans)",
      "1 tsp mustard oil or ghee",
      "Toppings: Fresh coriander, cumin powder, lemon juice",
    ],
  },
  {
    name: "Eggless Bhurji & Oats Bowl",
    price: 900,
    picture: bowl,
    hot: false,
    macros: { calories: 440, protein: 25, carbs: 35, fats: 16 },
    ingredients: [
      "1/2 cup moong dal chilla crumble (eggless bhurji style)",
      "1/2 cup cooked masala oats",
      "1/4 cup steamed peas and cauliflower",
      "1 tsp ghee or coconut oil",
      "Toppings: Mint, lemon, roasted cumin powder",
    ],
  },
].map((bowl) => ({ ...bowl, slug: slugify(bowl.name) }));

export function getBowlBySlug(slug) {
  return BOWLS.find((bowl) => bowl.slug === slug);
}
