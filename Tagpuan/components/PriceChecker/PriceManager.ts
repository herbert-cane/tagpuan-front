import { auth } from "@/firebaseConfig";
import { PriceItem, PriceData, Category } from './PriceTypes';

// Configuration
const API_URL = "http://10.74.1.53:8080"; 

// ✅ FIX: Explicitly type the return promise as HeadersInit
const getAuthHeader = async (): Promise<HeadersInit> => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Hardcoded Categories (Static data is fine here)
export const categories: Category[] = [
  { id: 'all', name: 'All', icon: '🧺' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥦' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'meat', name: 'Meat & Poultry', icon: '🥩' },
  { id: 'fish', name: 'Fish & Seafood', icon: '🐟' },
  { id: 'rice', name: 'Rice & Grains', icon: '🍚' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
];

export const PriceManager = {
  /**
   * Fetch prices from backend
   */
  fetchPrices: async (category: string = 'all', searchQuery: string = ''): Promise<PriceData> => {
    try {
      const headers = await getAuthHeader();
      
      // Build URL: /prices?category=meat&query=pork
      let url = `${API_URL}/prices?`;
      if (category !== 'all') url += `category=${category}&`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, { headers });
      
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      
      return {
        prices: data.prices || [],
        region: data.region || "Unknown Region",
        lastUpdated: data.lastUpdated || "Just now"
      };
    } catch (error) {
      console.error("PriceManager Error:", error);
      // Fallback empty state
      return { prices: [], region: "Error", lastUpdated: "-" };
    }
  },

  getCategories: (): Category[] => {
    return categories;
  }
};