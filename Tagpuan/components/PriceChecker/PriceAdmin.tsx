import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { PriceManager } from './PriceManager';
import { PriceItem, Category } from './PriceTypes';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { auth } from '@/firebaseConfig';

// Configuration
const API_URL = "http://10.74.6.160:8080"; 

export default function PriceAdmin() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Edit Form State
  const [editPrice, setEditPrice] = useState('');
  const [editTrend, setEditTrend] = useState<'increasing' | 'decreasing' | 'stable'>('stable');

  const fetchItems = async () => {
    setLoading(true);
    const data = await PriceManager.fetchPrices('all');
    setItems(data.prices);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditPress = (item: PriceItem) => {
    setSelectedItem(item);
    setEditPrice(item.price);
    setEditTrend(item.trend);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch(`${API_URL}/prices/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          commodity: selectedItem.commodity,
          price: editPrice,
          trend: editTrend,
          category: selectedItem.category
        })
      });

      if (!response.ok) throw new Error('Update failed');

      Alert.alert("Success", "Price updated!");
      setModalVisible(false);
      fetchItems(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not update price.");
    }
  };

  const renderItem = ({ item }: { item: PriceItem }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => handleEditPress(item)}>
      <View>
        <Text style={styles.itemName}>{item.commodity}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <FontAwesome name="pencil" size={20} color="#DDB771" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Price Manager</Text>
        <TouchableOpacity onPress={fetchItems}>
          <MaterialIcons name="refresh" size={24} color="#DDB771" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {selectedItem?.commodity}</Text>
            
            <Text style={styles.label}>Current Price</Text>
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              placeholder="e.g. ₱120.00 / kg"
            />

            <Text style={styles.label}>Market Trend</Text>
            <View style={styles.trendContainer}>
              <TouchableOpacity 
                style={[styles.trendBtn, editTrend === 'increasing' && styles.trendActive]}
                onPress={() => setEditTrend('increasing')}
              >
                <Text>📈 Up</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.trendBtn, editTrend === 'stable' && styles.trendActive]}
                onPress={() => setEditTrend('stable')}
              >
                <Text>➡️ Stable</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.trendBtn, editTrend === 'decreasing' && styles.trendActive]}
                onPress={() => setEditTrend('decreasing')}
              >
                <Text>📉 Down</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnCancel]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.btnSave]} 
                onPress={handleSave}
              >
                <Text style={styles.btnText}>Save Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#073B3A', paddingTop: 50 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center' 
  },
  title: { fontSize: 22, color: '#DDB771', fontWeight: 'bold' },
  list: { padding: 20 },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  itemCategory: { color: '#ccc', fontSize: 12, textTransform: 'capitalize' },
  rightSide: { alignItems: 'flex-end', gap: 5 },
  itemPrice: { color: '#DDB771', fontSize: 16, fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { 
    backgroundColor: '#f0f0f0', 
    padding: 12, 
    borderRadius: 8, 
    fontSize: 16, 
    marginBottom: 15 
  },
  trendContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  trendBtn: { 
    flex: 1, 
    padding: 10, 
    borderRadius: 8, 
    backgroundColor: '#f0f0f0', 
    alignItems: 'center' 
  },
  trendActive: { backgroundColor: '#DDB771' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#ccc' },
  btnSave: { backgroundColor: '#08A045' },
  btnText: { color: 'white', fontWeight: 'bold' }
});