import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const filterOptions = {
  commodity: ['chicken', 'beef', 'pork'],
  payment_terms: ['cod', 'bank', 'gcash', 'maya'],
  logistics: ['pickup', 'delivery'],
  duration: ['Single Order', 'Weekly', 'Monthly'],
};

type SelectedFilters = {
  commodity?: string;
  payment_terms?: string;
  logistics?: string;
  duration?: string;
};

type QuestFilterProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SelectedFilters) => void;
};

const QuestFilter: React.FC<QuestFilterProps> = ({ visible, onClose, onApply }) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  const toggleFilter = (category: keyof SelectedFilters, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? undefined : value,
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Filter Quests</Text>
          <ScrollView>
            {Object.keys(filterOptions).map((category) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category.replace('_', ' ').toUpperCase()}</Text>
                {(filterOptions as any)[category].map((option: string) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.option}
                    onPress={() => toggleFilter(category as keyof SelectedFilters, option)}
                  >
                    <Ionicons
                      name={selectedFilters[category as keyof SelectedFilters] === option ? 'checkbox' : 'square-outline'}
                      size={24}
                      color="green"
                    />
                    <Text style={styles.optionText}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
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
