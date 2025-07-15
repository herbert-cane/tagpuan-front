import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Commodity = {
  id: string;
  hil_name: string;
  en_name: string;
};

const useCommodities = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'commodities'),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            hil_name: data.hil_name ?? '',
            en_name: data.en_name ?? '',
          };
        });
        setCommodities(items);
      },
      (error) => {
        console.error('Error fetching commodities:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return commodities;
};

type SelectedFilters = {
  commodity?: string[];        // Changed to array
  deliveryMode?: string[];     // Changed to array
  paymentTerms?: string[];     // Changed to array
};

type QuestFilterProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SelectedFilters) => void;
};

const SwipeFilter: React.FC<QuestFilterProps> = ({ visible, onClose, onApply }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const commodities = useCommodities();

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


  const toggleFilter = (category: keyof SelectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const exists = (current as string[]).includes(value);
      const updated = exists
        ? (current as string[]).filter((v) => v !== value)
        : [...(current as string[]), value];
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
          <Text style={styles.title}>Filter</Text>
          <ScrollView>
            {/* Commodities Section */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>COMMODITIES</Text>
              {commodities.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={() => toggleFilter('commodity', option.id)}
                >
                  <Ionicons
                    name={
                      selectedFilters.commodity?.includes(option.id)
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="green"
                  />
                  <Text style={styles.optionText}>
                    {option.en_name} ({option.hil_name})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Delivery Modes */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>DELIVERY MODE</Text>
              {deliveryModes.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={() => toggleFilter('deliveryMode', option.id)}
                >
                  <Ionicons
                    name={
                      selectedFilters.deliveryMode?.includes(option.id)
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="green"
                  />
                  <Text style={styles.optionText}>{option.name}</Text>
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
                  onPress={() => toggleFilter('paymentTerms', option.id)}
                >
                  <Ionicons
                    name={
                      selectedFilters.paymentTerms?.includes(option.id)
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color="green"
                  />
                  <Text style={styles.optionText}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Buttons */}
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

export default SwipeFilter;