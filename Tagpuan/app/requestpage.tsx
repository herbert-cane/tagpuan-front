import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type DropdownOptions = {
  Commodity: string[];
  Amount: string[];
  Duration: string[];
  Price: string[];
  PaymentTerms: string[];
  DeliveryPlace: string[];
  DisputeResolution: string[];
  Logistics: string[];
  InputSupply: string[];
};

type SelectedValues = Partial<Record<keyof DropdownOptions, string>>;

const MakeRequestScreen: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({});

  const dropdownOptions: DropdownOptions = {
    Commodity: ['Onion (Sibuyas)', 'Garlic (Bawang)', 'Tomatoes (Kamatis)', 'Lettuce (Litsugas)', 'Chicken (Manok)', 'Pork (Baboy)', 'Beef (Baka)', 'Corn (Mais)', 'Jackfruit (Langka)'],
    Amount: ['1 kg', '5 kg', '10 kg', '20 kg', '50 kg'],
    Duration: ['1 week', '2 weeks', '1 month', '3 months', '6 months'],
    Price: ['Below PHP 50', 'PHP 50 - PHP 100', 'PHP 100 - PHP 200', 'Above PHP 200'],
    PaymentTerms: ['Cash on Delivery', 'Bank Transfer', 'Installment'],
    DeliveryPlace: ['Manila', 'Cebu', 'Davao', 'Iloilo', 'Baguio'],
    DisputeResolution: ['Negotiation', 'Mediation', 'Arbitration'],
    Logistics: ['Seller Arranged', 'Buyer Arranged'],
    InputSupply: ['Fertilizers', 'Pesticides', 'Seeds', 'None']
  };

  const handleValueChange = (key: keyof DropdownOptions, value: string) => {
    setSelectedValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  return (
    <LinearGradient colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Go Back')}>
          <Ionicons name="chevron-back" size={20} color="#DDB771" />
        </TouchableOpacity>
        <Text style={styles.title}>MAKE A REQUEST</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.formContainer}>
          {Object.keys(dropdownOptions).map((key) => (
            <View key={key} style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedValues[key as keyof DropdownOptions] || ''}
                onValueChange={(itemValue) => handleValueChange(key as keyof DropdownOptions, itemValue)}
                mode="dropdown"
                style={styles.picker}
              >
                <Picker.Item label={`--- Select ${key.replace(/([A-Z])/g, ' $1').trim()} ---`} value="" enabled={false} />
                {dropdownOptions[key as keyof DropdownOptions].map((value, i) => (
                  <Picker.Item key={i} label={value} value={value} />
                ))}
              </Picker>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => console.log('Request Sent', selectedValues)}>
          <Text style={styles.submitText}>SEND REQUEST</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 70 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 20, marginTop: 15, position: 'absolute', top: 0, zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#DDB771', textAlign: 'center', flex: 1, marginBottom: 10 },
  backButton: { width: 30, height: 30, borderWidth: 2, borderColor: '#DDB771', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: -5, top: 5 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  scrollView: { alignSelf: 'stretch', marginRight: -10 },
  formContainer: { width: width * 0.75, marginTop: 20 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 5, marginBottom: 20, paddingHorizontal: 10, width: '100%' },
  picker: { height: 55, width: '100%' },
  submitButton: { backgroundColor: '#DDB771', padding: 15, borderRadius: 8, width: width * 0.4, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default MakeRequestScreen;
