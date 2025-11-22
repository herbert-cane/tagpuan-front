import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { PriceManager } from '../components/PriceChecker/PriceManager';
import { PriceItem, Category, TrendInfo, CompactPriceCheckerProps } from '../components/PriceChecker/PriceTypes';
import { FontAwesome } from '@expo/vector-icons';

const CompactPriceChecker: React.FC<CompactPriceCheckerProps> = ({ 
  isVisible, 
  onClose 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // ✅ NEW: State for Async Data
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [region, setRegion] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // ✅ NEW: Fetch Data Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Debounce logic could go here, but for simplicity we fetch directly
      const data = await PriceManager.fetchPrices(selectedCategory, searchQuery);
      setPrices(data.prices);
      setRegion(data.region);
      setLastUpdated(data.lastUpdated);
      setLoading(false);
    };

    if (isVisible) {
        loadData();
    }
  }, [selectedCategory, searchQuery, isVisible]);

  const getTrendInfo = (trend: 'increasing' | 'decreasing' | 'stable'): TrendInfo => {
    switch (trend) {
      case 'increasing':
        return { icon: '📈', color: '#e74c3c', text: 'Up' };
      case 'decreasing':
        return { icon: '📉', color: '#2ecc71', text: 'Down' };
      case 'stable':
        return { icon: '➡️', color: '#f39c12', text: 'Stable' };
      default:
        return { icon: '➡️', color: '#7f8c8d', text: 'Stable' };
    }
  };

  const renderPriceItem = ({ item }: { item: PriceItem }) => {
    const trendInfo = getTrendInfo(item.trend);
    
    return (
      <View style={styles.priceItem}>
        <View style={styles.commodityInfo}>
          <Text style={styles.commodityName}>{item.commodity}</Text>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: `${trendInfo.color}20` }]}>
          <Text style={[styles.trendText, { color: trendInfo.color }]}>
            {trendInfo.icon}
          </Text>
        </View>
      </View>
    );
  };

  const clearFilters = (): void => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💰 Price Checker</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="close" size={24} color="#DDB771" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search commodities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#95a5a6"
          />
          {(searchQuery || selectedCategory !== 'all') && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {PriceManager.getCategories().map((category: Category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {prices.length} items • {region} • Updated: {lastUpdated}
          </Text>
        </View>

        {/* ✅ Loading State */}
        {loading ? (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#DDB771" />
            </View>
        ) : (
            /* Price List */
            <FlatList
            data={prices}
            renderItem={renderPriceItem}
            keyExtractor={(item: PriceItem) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No commodities found</Text>
                <Text style={styles.emptyStateSubtext}>
                    Try a different search or category
                </Text>
                </View>
            }
            />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B6E4F',
    paddingTop: 60,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDB771',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DDB771',
    fontFamily: 'NovaSquare-Regular',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDB771',
    fontSize: 16,
    color: '#FFFFFF',
  },
  clearButton: {
    marginLeft: 10,
    padding: 10,
  },
  clearButtonText: {
    color: '#DDB771',
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 60, // Prevent it from taking too much space
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(221, 183, 113, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(221, 183, 113, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: '#DDB771',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DDB771',
  },
  categoryTextActive: {
    color: '#0B6E4F',
    fontWeight: 'bold',
  },
  resultsInfo: {
    padding: 15,
    backgroundColor: 'rgba(221, 183, 113, 0.1)',
  },
  resultsText: {
    fontSize: 12,
    color: '#DDB771',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DDB771',
  },
  commodityInfo: {
    flex: 1,
  },
  commodityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DDB771',
  },
  trendBadge: {
    padding: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#DDB771',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(221, 183, 113, 0.7)',
    textAlign: 'center',
  },
});

export default CompactPriceChecker;