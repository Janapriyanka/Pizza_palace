/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pizza } from '../types';

export const PIZZAS: Pizza[] = [
  {
    id: 'p1',
    name: 'Classic Margherita',
    description: 'A timeless Italian masterpiece with rich San Marzano tomato sauce, fresh creamy mozzarella cheese, fragrant sweet basil leaves, and a drizzle of extra virgin olive oil.',
    price: 299,
    image: '/pizzas/margherita.png',
    category: 'Classic',
    isVeg: true,
    rating: 4.8,
    reviewsCount: 142,
    ingredients: ['Tomato Sauce', 'Fresh Mozzarella', 'Basil Leaves', 'Olive Oil'],
    isFeatured: true
  },
  {
    id: 'p2',
    name: 'Premium Pepperoni',
    description: 'The absolute crowd favorite piled high with double-cured dynamic pepperoni slices, fresh mozzarella cheese, and our signature slow-simmered marinara sauce on hand-tossed dough.',
    price: 399,
    image: '/pizzas/pepperoni.png',
    category: 'Signature',
    isVeg: false,
    rating: 4.9,
    reviewsCount: 289,
    ingredients: ['Pepperoni', 'Mozzarella', 'Marinara Sauce', 'Oregano'],
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'BBQ Smoked Chicken',
    description: 'Smokehouse grill meets Italian kitchen. Tender roasted chicken breast tossed in hickory BBQ sauce, red onions, charred bell peppers, cilantro, and authentic smoked Gouda cheese.',
    price: 449,
    image: '/pizzas/bbq_chicken.png',
    category: 'Signature',
    isVeg: false,
    rating: 4.7,
    reviewsCount: 198,
    ingredients: ['BBQ Chicken', 'Red Onions', 'Cilantro', 'Mozzarella', 'Smoked Gouda'],
    isFeatured: true
  },
  {
    id: 'p4',
    name: 'Garden Fresh Supreme',
    description: 'A vibrant garden of fresh vegetables including sweet bell peppers, red onions, juicy cherry tomatoes, sliced black olives, earthy mushrooms, and young spinach topped with light mozzarella.',
    price: 349,
    image: '/pizzas/garden_fresh.png',
    category: 'Veggie',
    isVeg: true,
    rating: 4.6,
    reviewsCount: 115,
    ingredients: ['Bell Peppers', 'Onions', 'Olives', 'Mushrooms', 'Spinach', 'Cherry Tomatoes'],
    isFeatured: false
  },
  {
    id: 'p5',
    name: 'Quattro Formaggi (Four Cheese)',
    description: 'The ultimate cheese lover\'s dream. An incredibly luscious, rich blend of imported Mozzarella, aged Gorgonzola blue, sharp Parmesan, and creamy fresh Ricotta cheese.',
    price: 429,
    image: '/pizzas/four_cheese.png',
    category: 'Classic',
    isVeg: true,
    rating: 4.7,
    reviewsCount: 94,
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta', 'Garlic Oil'],
    isFeatured: false
  },
  {
    id: 'p6',
    name: 'Spicy Paneer Tikka Spice',
    description: 'An appetizing fusion marvel. Tender cubes of tandoori-marinated paneer, spicy red chilies, green capsicum, and juicy red onions with an aromatic mint-coriander drizzle.',
    price: 399,
    image: '/pizzas/paneer_tikka.png',
    category: 'Veggie',
    isVeg: true,
    rating: 4.5,
    reviewsCount: 81,
    ingredients: ['Paneer Tikka', 'Capsicum', 'Red Chillies', 'Mint Chutney', 'Onions'],
    isFeatured: false
  },
  {
    id: 'p7',
    name: 'The Ultimate Meat Supreme',
    description: 'Powerhouse combo packed with high-quality cured meats including sweet Italian pork sausage, seasoned pepperoni, shaved cured ham, crispy bacon bits, and chopped beef mince.',
    price: 499,
    image: '/pizzas/meat_supreme.png',
    category: 'Supreme',
    isVeg: false,
    rating: 4.9,
    reviewsCount: 312,
    ingredients: ['Sausage', 'Pepperoni', 'Ham', 'Bacon', 'Beef Mince', 'Mozzarella'],
    isFeatured: true
  },
  {
    id: 'p8',
    name: 'Truffle Mushroom Fusion',
    description: 'An elegant gourmet delicacy featuring wild forest mushrooms, drizzled with premium Black Truffle oil, fresh rosemary, sea salt, baby arugula, and shaved Parmesan flakes.',
    price: 549,
    image: '/pizzas/truffle_mushroom.png',
    category: 'Supreme',
    isVeg: true,
    rating: 4.8,
    reviewsCount: 156,
    ingredients: ['Wild Mushrooms', 'Truffle Oil', 'Rosemary', 'Arugula', 'Parmesan'],
    isFeatured: false
  }
];

export const CATEGORIES = ['All', 'Classic', 'Signature', 'Supreme', 'Veggie'] as const;

export const SIZE_MULTIPLIERS = {
  Small: 0.8, // 20% discount from base
  Medium: 1.0, // base price
  Large: 1.3 // 30% mark up
} as const;

export const CRUST_PREMIUMS = {
  'Classic Crust': 0,
  'Thick Crust': 50,
  'Thin Crust': 30,
  'Cheese Burst': 99
} as const;

export const EXTRA_TOPPING_PRICE = 49;
export const EXTRA_CHEESE_PRICE = 69;

export const AVAILABLE_TOPPINGS = [
  'Pepperoni',
  'Italian Sausage',
  'BBQ Chicken',
  'Paneer Tikka',
  'Extra Mozzarella',
  'Mushrooms',
  'Black Olives',
  'Sweet Corn',
  'Jalapenos',
  'Pineapple',
  'Bell Peppers',
  'Red Onions',
  'Fresh Jalapeno'
];
