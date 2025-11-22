export interface PriceItem {
  id: number;
  commodity: string;
  price: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface PriceData {
  lastUpdated: string;
  region: string;
  prices: PriceItem[];
}

export interface TrendInfo {
  icon: string;
  color: string;
  text: string;
}

export interface CompactPriceCheckerProps {
  isVisible: boolean;
  onClose: () => void;
}