import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

type DropdownOptions = {
  Commodity: string[];
  ContractDuration: string[];
  PaymentTerms: string[];
  DisputeResolution: string[];
  ForceMajeure: string[];
  DeliveryAndLogistics: string[];
};

type SelectedValues = Partial<Record<keyof DropdownOptions, string>>;

const MakeRequestScreen: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({});
  const [customCommodity, setCustomCommodity] = useState('');
  const [isCustomCommodity, setIsCustomCommodity] = useState(false);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryPlace, setDeliveryPlace] = useState('');

  const dropdownOptions: DropdownOptions = {
    Commodity: ['Onion (Sibuyas)', 'Garlic (Bawang)', 'Tomatoes (Kamatis)', 'Lettuce (Litsugas)', 'Chicken (Manok)', 'Pork (Baboy)', 'Beef (Baka)', 'Corn (Mais)', 'Jackfruit (Langka)', 'Other'],
    ContractDuration: ['Single', 'Weekly', 'Monthly'],
    PaymentTerms: ['Cash on Delivery', 'Gcash', 'Maya'],
    DisputeResolution: ['Negotiation', 'Mediation', 'Arbitration'],
    ForceMajeure: ['Natural Disaster', 'Political Unrest', 'Pandemic'],
    DeliveryAndLogistics: ['Pick Up', 'Deliver']
  };

  const handleValueChange = (key: keyof DropdownOptions, value: string) => {
    setSelectedValues((prevValues) => ({ ...prevValues, [key]: value }));
    if (key === 'Commodity') {
      setIsCustomCommodity(value === 'Other');
      setCustomCommodity(value === 'Other' ? '' : value);
    }
  };

  return (
    <LinearGradient colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']} style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() =>router.push('/homepage')}>
          <Ionicons name="chevron-back" size={20} color="#DDB771" />
        </TouchableOpacity>
        <Text style={styles.title}>MAKE A REQUEST</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.formContainer}>
          <View style={styles.pickerContainer}>
            {isCustomCommodity ? (
              <TextInput
                style={styles.inputFieldInsidePicker}
                placeholder="Enter Commodity"
                value={customCommodity}
                onChangeText={setCustomCommodity}
              />
            ) : (
              <Picker
                selectedValue={selectedValues.Commodity || ''}
                onValueChange={(itemValue) => handleValueChange('Commodity', itemValue)}
                mode="dropdown"
                style={styles.picker}
              >
                <Picker.Item label="Commodity" value="" enabled={false} />
                {dropdownOptions.Commodity.map((value, i) => (
                  <Picker.Item key={i} label={value} value={value} />
                ))}
              </Picker>
            )}
          </View>

          <View style={styles.pickerContainer}>
            <TextInput
              style={styles.inputFieldInsidePicker}
              placeholder="Amount eg: 10PCS/20KG/etc."
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pesoSign}>₱</Text>
            <TextInput
              style={[styles.inputFieldInsidePicker, styles.priceInput]}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.pickerContainer}>
            <TextInput
              style={styles.inputFieldInsidePicker}
              placeholder="Delivery Place"
              value={deliveryPlace}
              onChangeText={setDeliveryPlace}
            />
          </View>

          {Object.keys(dropdownOptions).filter(key => key !== 'Commodity').map((key) => (
            <View key={key} style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedValues[key as keyof DropdownOptions] || ''}
                onValueChange={(itemValue) => handleValueChange(key as keyof DropdownOptions, itemValue)}
                mode="dropdown"
                style={styles.picker}
              >
                <Picker.Item label={`${key.replace(/([A-Z])/g, ' $1').trim()}`} value="" enabled={false} />
                {dropdownOptions[key as keyof DropdownOptions].map((value, i) => (
                  <Picker.Item key={i} label={value} value={value} />
                ))}
              </Picker>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => console.log('Request Sent', selectedValues, customCommodity, amount, price, deliveryPlace)}>
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
  backButton: { width: 30, height: 30, borderWidth: 2, borderColor: '#DDB771', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0, top: 5 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  scrollView: { alignSelf: 'stretch' },
  formContainer: { width: width * 0.75, marginTop: 20 },
  inputFieldInsidePicker: { flex: 1, fontSize: 16, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#fff', borderRadius: 5 },
  picker: { height: 55, width: '100%' },
  submitButton: { backgroundColor: '#DDB771', padding: 15, borderRadius: 8, width: width * 0.5, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#073B3A', fontWeight: 'bold', fontSize: 16 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 5, marginVertical: 5, paddingHorizontal: 10, height: 55, flexDirection: 'row', alignItems: 'center' },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  pesoSign: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  priceInput: {
    flex: 1,
  },
});

export default MakeRequestScreen;
