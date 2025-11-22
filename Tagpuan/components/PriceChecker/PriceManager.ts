import { manualPriceData, categories } from './PriceData';
import { PriceItem, Category } from './PriceTypes';

export const PriceManager = {
  getPrices: (category: string = 'all'): PriceItem[] => {
    if (category === 'all') {
      return manualPriceData.prices;
    }
    return manualPriceData.prices.filter(item => item.category === category);
  },

  searchCommodities: (searchText: string): PriceItem[] => {
    if (!searchText.trim()) return [];
    return manualPriceData.prices.filter(item => 
      item.commodity.toLowerCase().includes(searchText.toLowerCase())
    );
  },

  getLastUpdated: (): string => {
    return manualPriceData.lastUpdated;
  },

  getRegion: (): string => {
    return manualPriceData.region;
  },

  getCategories: (): Category[] => {
    return categories;
  }
};