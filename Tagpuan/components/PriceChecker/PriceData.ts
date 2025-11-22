import { PriceData, Category } from '../types/priceTypes';

export const manualPriceData: PriceData = {
  lastUpdated: "2024-01-15",
  region: "Metro Manila",
  prices: [
    // GRAINS
    { id: 1, commodity: "Rice (Well Milled)", price: "48-52 PHP/kg", trend: "stable", category: "grains" },
    { id: 2, commodity: "Rice (Regular Milled)", price: "42-46 PHP/kg", trend: "stable", category: "grains" },
    { id: 3, commodity: "Corn (Yellow)", price: "20-24 PHP/kg", trend: "increasing", category: "grains" },
    
    // VEGETABLES
    { id: 4, commodity: "Tomato", price: "65-85 PHP/kg", trend: "decreasing", category: "vegetables" },
    { id: 5, commodity: "Onion (Red)", price: "130-160 PHP/kg", trend: "stable", category: "vegetables" },
    { id: 6, commodity: "Potato", price: "75-95 PHP/kg", trend: "stable", category: "vegetables" },
    { id: 7, commodity: "Cabbage", price: "45-65 PHP/kg", trend: "increasing", category: "vegetables" },
    { id: 8, commodity: "Carrot", price: "80-100 PHP/kg", trend: "stable", category: "vegetables" },
    
    // LIVESTOCK & POULTRY
    { id: 9, commodity: "Chicken (Dressed)", price: "165-185 PHP/kg", trend: "stable", category: "poultry" },
    { id: 10, commodity: "Pork (Kasim)", price: "290-330 PHP/kg", trend: "stable", category: "livestock" },
    { id: 11, commodity: "Egg (Medium)", price: "7-8 PHP/piece", trend: "stable", category: "poultry" },
    
    // FRUITS
    { id: 12, commodity: "Banana (Lakatan)", price: "50-70 PHP/kg", trend: "stable", category: "fruits" },
    { id: 13, commodity: "Mango", price: "80-120 PHP/kg", trend: "decreasing", category: "fruits" },
    { id: 14, commodity: "Pineapple", price: "40-60 PHP/kg", trend: "stable", category: "fruits" },
  ]
};

export const categories: Category[] = [
  { id: 'all', name: 'All', icon: '📦' },
  { id: 'grains', name: 'Grains', icon: '🌾' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'livestock', name: 'Livestock', icon: '🐖' },
  { id: 'poultry', name: 'Poultry', icon: '🐔' }
];