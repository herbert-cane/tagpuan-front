import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, onSnapshot } from "firebase/firestore";
import { storage, auth, db } from "../firebaseConfig";
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const unitOptions = ['KG', 'PCS', 'BOX', 'SACK'];

type DropdownOptions = {
  Commodity: string[];
  ContractDuration: string[];
  ModeOfPayment: string[];
  DisputeResolution: string[];
  ForceMajeure: string[];
  Logistics: string[];
};

type SelectedValues = Partial<Record<keyof DropdownOptions, string>> & { scheduleDate?: string };

const MakeRequestScreen: React.FC = () => {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL
  const [selectedValues, setSelectedValues] = useState<SelectedValues>({});
  const [customCommodity, setCustomCommodity] = useState('');
  const [isCustomCommodity, setIsCustomCommodity] = useState(false);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryPlace, setDeliveryPlace] = useState('');
  const [amountUnit, setAmountUnit] = useState('');
  const [commodities, setCommodities] = useState<Array<{ id: string; [key: string]: any }>>([]);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { type, farmerId } = useLocalSearchParams();
  
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

  const dropdownOptions: DropdownOptions = {
    Commodity: commodities.map(commodity => `${commodity.id}|${commodity.en_name}|${commodity.hil_name}`),
    ContractDuration: ['Single Order', 'Weekly', 'Monthly'],
    ModeOfPayment: paymentList.map(payment => `${payment.id}|${payment.name}`),
    DisputeResolution: ['Negotiation', 'Mediation', 'Arbitration', "None"],
    ForceMajeure: ['Natural Disaster', 'Political Unrest', 'Pandemic', "None"],
    Logistics: deliveryModes.map(mode => `${mode.id}|${mode.name}`)
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commodities"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        // Add "Other" option at the end
        const itemsWithOther = [
          ...items,
          { id: 'other', en_name: 'Other', hil_name: '' }
        ];
        setCommodities(itemsWithOther);
      },
      (error) => {
        console.error("Error fetching commodities:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleValueChange = (key: keyof DropdownOptions, value: string) => {
    setSelectedValues((prevValues) => ({ ...prevValues, [key]: value }));
    if (key === 'Commodity') {
      setIsCustomCommodity(value === 'other');
      setCustomCommodity(value === 'other' ? '' : customCommodity);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pickedDate = new Date(selectedDate);
      pickedDate.setHours(0, 0, 0, 0);

      if (pickedDate <= today) {
        setErrors((prev) => ({ ...prev, scheduleDate: true }));
        alert('Please select a future date.');
        return;
      }

      const formattedDate = pickedDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
      setSelectedValues((prev) => ({ ...prev, scheduleDate: formattedDate }));
      setErrors((prev) => ({ ...prev, scheduleDate: false }));
    }
  };

const createRequest = () => {
  // Check required fields
  const newErrors: { [key: string]: boolean } = {};
  if (!selectedValues.Commodity) newErrors.Commodity = true;
  if (!amount) newErrors.amount = true;
  if (!amountUnit) newErrors.amountUnit = true;
  if (!price) newErrors.price = true;
  if (!deliveryPlace || deliveryPlace.length <= 3 || deliveryPlace.length > 100) newErrors.deliveryPlace = true;
  
  if (isCustomCommodity && !customCommodity) newErrors.customCommodity = true;
  if (!selectedValues.ContractDuration) newErrors.ContractDuration = true;
  if (!selectedValues.ModeOfPayment) newErrors.ModeOfPayment = true;
  if (!selectedValues.Logistics) newErrors.Logistics = true;

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    alert('Please fill in all required fields.');
    return;
  }

  // If "other" is selected and no custom value is entered, show error and send empty string
  let commodityValue = '';
  if (isCustomCommodity) {
    if (!customCommodity.trim()) {
      newErrors.customCommodity = true;
      setErrors(newErrors);
      alert('Please enter a custom commodity.');
      return;
    }
    commodityValue = customCommodity.trim();
  } else if (selectedValues.Commodity && selectedValues.Commodity !== 'other') {
    commodityValue = selectedValues.Commodity;
  }

  const requestData = {
    commodity: commodityValue,
    quantity: Number(amount),
    unit: amountUnit,
    price: Number(price),
    address: deliveryPlace,
    schedule: selectedValues.scheduleDate,
    duration: selectedValues.ContractDuration,
    payment_terms: selectedValues.ModeOfPayment,
    dispute_resolution: selectedValues.DisputeResolution || '',
    force_majeure: selectedValues.ForceMajeure || '',
    logistics: selectedValues.Logistics,
    contractor_id: auth.currentUser?.uid,
  };

  (async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      let endpoint = '';
      let body = requestData;

      if (type === 'bidding') {
        endpoint = `${FIREBASE_API}/request/create`;
      } else if (type === 'direct') {
        
        endpoint = `${FIREBASE_API}/request/direct/${farmerId}`;
      } else {
        alert("Invalid request type.");
        return;
      }
      console.log('Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const responseBody = await response.text();
      if (response.ok) {
        alert("Request created successfully!");
        router.push('/homepage');
      } else {
        alert("Failed to create request.");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      alert("An error occurred while creating the request.");
    }
  })();
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
          {/* Commodity Picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValues.Commodity || ''}
              onValueChange={(itemValue) => {
          if (itemValue === 'other') {
            setIsCustomCommodity(true);
            setCustomCommodity('');
            setSelectedValues((prev) => ({ ...prev, Commodity: 'other' }));
          } else {
            setIsCustomCommodity(false);
            setCustomCommodity(itemValue);
            setSelectedValues((prev) => ({ ...prev, Commodity: itemValue }));
          }
          setErrors((prev) => ({ ...prev, Commodity: false }));
              }}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label="Commodity" value="" enabled={false} />
              {dropdownOptions.Commodity.map((commodityStr) => {
          const [id, en_name, hil_name] = commodityStr.split('|');
          return (
            <Picker.Item
              key={id}
              label={id === 'other' ? 'Other' : `${en_name} (${hil_name})`}
              value={id}
            />
          );
              })}
            </Picker>
          </View>
          {errors.Commodity && (
            <Text style={styles.errorText}>Commodity is required.</Text>
          )}
          {isCustomCommodity && (
            <>
              <TextInput
          style={[styles.inputFieldInsidePicker, { marginTop: 8 }]}
          placeholder="Enter Commodity"
          value={customCommodity}
          onChangeText={(text) => {
            setCustomCommodity(text);
            setErrors((prev) => ({ ...prev, customCommodity: false }));
          }}
              />
              {errors.customCommodity && (
          <Text style={styles.errorText}>Custom commodity is required.</Text>
              )}
            </>
          )}

          {/* Quantity and Unit */}
          <View style={styles.rowWithUnit}>
            <TextInput
              style={[styles.inputFieldInsidePicker, { flex: 1 }]}
              placeholder="Quantity"
              value={amount}
              onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '');
          setAmount(numericText);
          setErrors((prev) => ({ ...prev, amount: false }));
              }}
              keyboardType="numeric"
              inputMode="numeric"
            />
            <Picker
              selectedValue={amountUnit}
              onValueChange={(value) => {
          setAmountUnit(value);
          setErrors((prev) => ({ ...prev, amountUnit: false }));
              }}
              style={styles.unitPicker}
            >
              <Picker.Item label="Unit" value="" enabled={false} />
              {unitOptions.map((unit) => (
          <Picker.Item key={unit} label={unit} value={unit} />
              ))}
            </Picker>
          </View>
          {errors.amount && (
            <Text style={styles.errorText}>Quantity is required.</Text>
          )}
          {errors.amountUnit && (
            <Text style={styles.errorText}>Unit is required.</Text>
          )}

          {/* Price */}
          <View style={styles.rowWithUnit}>
            <Text style={styles.pesoSign}>₱</Text>
            <TextInput
              style={[styles.inputFieldInsidePicker, styles.priceInput]}
              placeholder="Price"
              value={price}
              onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, '');
          setPrice(numericText);
          setErrors((prev) => ({ ...prev, price: false }));
              }}
              keyboardType="numeric"
              inputMode="numeric"
            />
            <Text style={{ marginHorizontal: 4, fontWeight: 'bold' }}>per</Text>
            <Text style={{ marginLeft: 4 }}>{amountUnit || 'Unit'}</Text>
          </View>
          {errors.price && (
            <Text style={styles.errorText}>Price is required.</Text>
          )}

          {/* Delivery Address */}
          <View style={styles.pickerContainer}>
            <TextInput
              style={styles.inputFieldInsidePicker}
              placeholder="Delivery Address (Put N/A if Pickup)"
              value={deliveryPlace}
              onChangeText={(text) => {
          setDeliveryPlace(text);
          setErrors((prev) => ({ ...prev, deliveryPlace: false }));
              }}
            />
          </View>
          {errors.deliveryPlace && (
            <Text style={styles.errorText}>Delivery address is required. It must also be at least 3 characters long.</Text>
          )}

            {/* Schedule Date Picker */}
            <View style={styles.pickerContainer}>
              <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.inputFieldInsidePicker, { justifyContent: 'center' }]}
              >
              <Text style={{ color: selectedValues.scheduleDate ? '#000' : '#888', fontSize: 16 }}>
                {selectedValues.scheduleDate || 'Schedule Date'}
              </Text>
              </TouchableOpacity>
              {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                style={{ backgroundColor: '#fff', width: '100%' }}
              />
              )}
            </View>
            {errors.scheduleDate && (
              <Text style={styles.errorText}>Schedule date is required.</Text>
            )}

          {/* Other Dropdowns */}
          {Object.keys(dropdownOptions)
            .filter(key => key !== 'Commodity')
            .map((key) => (
              <React.Fragment key={key}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValues[key as keyof DropdownOptions] || ''}
              onValueChange={(itemValue) => {
              handleValueChange(key as keyof DropdownOptions, itemValue);
              if (
                key === 'ContractDuration' ||
                key === 'ModeOfPayment' ||
                key === 'Logistics'
              ) {
                setErrors((prev) => ({ ...prev, [key]: false }));
              }
              }}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label={`${key.replace(/([A-Z])/g, ' $1').trim()}`} value="" enabled={false} />
              {dropdownOptions[key as keyof DropdownOptions].map((value, i) => {
              if (key === 'ModeOfPayment' || key === 'Logistics') {
                const [id, name] = value.split('|');
                return (
                <Picker.Item key={`${key}-${id}-${i}`} label={name} value={id} />
                );
              }
              return (
                <Picker.Item key={`${key}-${value}-${i}`} label={value} value={value} />
              );
              })}
            </Picker>
          </View>
          <View>
            {(key === 'ContractDuration' && errors.ContractDuration) && (
              <Text style={styles.errorText}>Contract duration is required.</Text>
            )}
            {(key === 'ModeOfPayment' && errors.ModeOfPayment) && (
              <Text style={styles.errorText}>Mode of payment is required.</Text>
            )}
            {(key === 'Logistics' && errors.Logistics) && (
              <Text style={styles.errorText}>Logistics is required.</Text>
            )}
          </View>
              </React.Fragment>
            ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={createRequest}>
          <Text style={styles.submitText}>CREATE REQUEST</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: Platform.OS === 'ios' ? 2 : -2,
    marginLeft: 4,
  },
  container: { flex: 1, alignItems: 'center', padding: 20, paddingTop: 70 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 20, marginTop: 15, position: 'absolute', top: 0, zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#DDB771', textAlign: 'center', flex: 1, marginBottom: 10 },
  backButton: { width: 30, height: 30, borderWidth: 2, borderColor: '#DDB771', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0, top: 5 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  scrollView: { alignSelf: 'stretch' },
  formContainer: { width: width * 0.75, marginTop: 20 },
  inputFieldInsidePicker: { flex: 1, fontSize: 16, paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#fff', borderRadius: 5, zIndex: 2, position: 'relative' },
  picker: { height: 55, width: '100%', zIndex: 1 },
  submitButton: { backgroundColor: '#DDB771', padding: 15, borderRadius: 8, width: width * 0.5, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#073B3A', fontWeight: 'bold', fontSize: 16 },
  pickerContainer: { backgroundColor: '#fff', borderRadius: 5, marginVertical: 5, paddingHorizontal: 10, minHeight: 55, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' },
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
    flex: 1, // Make price input smaller
    minWidth: 60,
  },
  rowWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginVertical: 5,
    paddingHorizontal: 10,
    height: 55,
  },
  unitPicker: {
    width: 120,
    height: 50,
    marginLeft: 8,
    justifyContent: 'flex-end'
  },
  amountInput: {
    flex: 1, // Make amount input smaller
    minWidth: 60,
  },
});

export default MakeRequestScreen;
