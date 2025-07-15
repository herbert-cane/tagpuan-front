import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { db } from '../firebaseConfig'; // adjust if needed


const paymentList = [
  { id: 'cod', name: 'Cash On Delivery' },
  { id: 'gcash', name: 'GCash (E-Wallet)' },
  { id: 'maya', name: 'Maya (E-Wallet)' },
  { id: 'bank', name: 'Bank Transfer' },
];

const deliveryModes = [
  { id: 'pickup', name: 'Pickup' },
  { id: 'delivery', name: 'Delivery' },
];

const durationList = [
  { id: 'Single Order', name: 'Single Order' },
  { id: 'Weekly', name: 'Weekly' },
  { id: 'Monthly', name: 'Monthly' },
];

type SelectedFilters = {
  commodity?: string[];
  payment_terms?: string[];
  logistics?: string[];
  duration?: string[];
};


type QuestFilterProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SelectedFilters) => void;
};

const QuestFilter: React.FC<QuestFilterProps> = ({ visible, onClose, onApply }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [commodities, setCommodities] = useState<{ id: string; en_name: string; hil_name: string }[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'commodities'), (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          en_name: data.en_name ?? '',
          hil_name: data.hil_name ?? '',
        };
      });
      setCommodities(items);
    });

    return () => unsubscribe();
  }, []);


  const toggleFilter = (category: keyof SelectedFilters, value: string) => {
  setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [category]: updated,
      };
    });
  };


  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filter Quests</Text>

          <ScrollView>
            
          {/* Commodities */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>COMMODITY</Text>
            {commodities.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => toggleFilter('commodity', option.id)}
              >
                <Ionicons
                  name={selectedFilters.commodity?.includes(option.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="green"
                />
                <Text style={styles.optionText}>{option.en_name} ({option.hil_name})</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Terms */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>PAYMENT TERMS</Text>
            {paymentList.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => toggleFilter('payment_terms', option.id)}
              >
                <Ionicons
                  name={selectedFilters.payment_terms?.includes(option.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="green"
                />
                <Text style={styles.optionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logistics */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>LOGISTICS</Text>
            {deliveryModes.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => toggleFilter('logistics', option.id)}
              >
                <Ionicons
                  name={selectedFilters.logistics?.includes(option.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="green"
                />
                <Text style={styles.optionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>DURATION</Text>
            {durationList.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.option}
                onPress={() => toggleFilter('duration', option.id)}
              >
                <Ionicons
                  name={selectedFilters.duration?.includes(option.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="green"
                />
                <Text style={styles.optionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>


          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={() => onApply(selectedFilters)}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  applyButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default QuestFilter;
