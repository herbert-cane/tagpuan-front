import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import QuestFilter from '../components/questfilter';
import { router } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import { onSnapshot, collection } from 'firebase/firestore';

type Quest = {
  commodity: string;
  duration: string;
  price: number;
  quantity: number;
  address: string;
  schedule: string;
  modeOfPayment: string;
  logistics: string;
};

export default function QuestsPage() {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';
  if (!FIREBASE_API) {
    throw new Error('FIREBASE_API URL is not set. Please check your environment configuration.');
  }

  const [filterVisible, setFilterVisible] = useState(false);
  const [filteredQuests, setFilteredQuests] = useState<any[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);

  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };

  const deliveryModes = [
    { id: 'pickup', name: 'Pickup' },
    { id: 'delivery', name: 'Delivery' },
  ];

  const paymentList = [
    { id: 'cod', name: 'Cash On Delivery' },
    { id: 'gcash', name: 'GCash (E-Wallet)' },
    { id: 'maya', name: 'Maya (E-Wallet)' },
    { id: 'bank', name: 'Bank Transfer' },
  ];

  const mapQuestFields = (quest: any) => {
    const commodityObj = commodities.find((c: any) => c.id === quest.commodity);
    return {
      contractorName: 'Juan Dela Cruz', // placeholder
      commodity: commodityObj
        ? `${commodityObj.en_name} (${commodityObj.hil_name})`
        : quest.commodity,
      quantity: quest.quantity + " " + quest.unit,
      price: "₱" + quest.price + "/" + quest.unit,
      schedule:
        quest.schedule && typeof quest.schedule === "object" && "_seconds" in quest.schedule
          ? `On or before ${formatDate(quest.schedule._seconds * 1000)}`
          : "Unknown",
      address: quest.address,
      duration: quest.duration,
      modeOfPayment: (() => {
        const payment = paymentList.find((p: any) => p.id === quest.payment_terms);
        return payment ? payment.name : quest.payment_terms;
      })(),
      logistics: (() => {
        const mode = deliveryModes.find((p: any) => p.id === quest.logistics);
        return mode ? mode.name : quest.logistics;
      })(),
    };
  };

  const applyFilters = (filters: {
    commodity?: string;
    payment_terms?: string;
    logistics?: string;
    duration?: string;
  }) => {
    setFilterVisible(false);

    const filtered = requests.filter((quest) => {
      return (
        (!filters.commodity || quest.commodity === filters.commodity) &&
        (!filters.payment_terms || quest.payment_terms === filters.payment_terms) &&
        (!filters.logistics || quest.logistics === filters.logistics) &&
        (!filters.duration || quest.duration === filters.duration)
      );
    }).map(mapQuestFields);

    setFilteredQuests(filtered);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        const response = await fetch(`${FIREBASE_API}/request/get/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API error: ${response.status} - ${text}`);
        }
        const data = await response.json();
        setRequests(data);
        setFilteredQuests(data.map(mapQuestFields));
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const commoditiesList = onSnapshot(
      collection(db, "commodities"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommodities(items);
        console.log('Commodities:', items);
      },
      (error) => {
        console.error("Error fetching commodities:", error);
      }
    );

    return () => commoditiesList();
  }, []);

  return (
    <LinearGradient style={styles.container} colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>QUESTS</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterContainer} onPress={() => setFilterVisible(true)}>
          <Image source={require('../assets/images/Filter.png')} style={styles.filterIcon} resizeMode="contain" />
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>

        {filteredQuests.map((quest, index) => (
          <View key={index} style={styles.questCardWrapper}>
            <TouchableOpacity style={styles.questCard} onPress={() => console.log('Quest Card Pressed')}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={38} color="#808080" />
                <View style={styles.questDetails}>

                  <View style={styles.row}>
                    <Text style={styles.label}>Contractor:</Text>
                    <Text style={styles.value}>{quest.contractorName}</Text>
                  </View>

                  {Object.entries(quest).map(([key, value]) => {
                    if (key === 'contractorName') return null; // skip duplicate
                    return (
                      <View key={key} style={styles.row}>
                        <Text style={styles.label}>
                          {key === 'modeOfPayment'
                            ? 'Mode of Payment:'
                            : key.charAt(0).toUpperCase() + key.slice(1) + ':'}
                        </Text>
                        <Text style={styles.value}>{String(value)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bidButton}
              onPress={() => {
                setSelectedQuest(quest);
                setConfirmVisible(true);
              }}
            >
              <Text style={styles.bidButtonText}>BID</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <QuestFilter visible={filterVisible} onClose={() => setFilterVisible(false)} onApply={applyFilters} />

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Bid</Text>

            {selectedQuest && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.modalDetail}>
                  <Text style={styles.modalLabel}>Contractor Name:</Text> {selectedQuest.contractorName}
                </Text>

                {Object.entries(selectedQuest).map(([key, value]) => {
                  if (key === 'contractorName') return null; // skip duplicate
                  return (
                    <Text key={key} style={styles.modalDetail}>
                      <Text style={styles.modalLabel}>
                        {key === 'modeOfPayment'
                          ? 'Mode of Payment:'
                          : key.charAt(0).toUpperCase() + key.slice(1) + ':'}
                      </Text>{' '}
                      {String(value)}
                    </Text>
                  );
                })}
              </View>
            )}

            <View style={{ marginTop: 20 }}>
              <Text style={[styles.modalDetail, { textAlign: 'center' }]}>
                <Text style={styles.modalLabel}>Are you sure you want to bid for this quest?</Text>
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#D9534F' }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#08A045' }]}
                onPress={() => {
                  console.log('Bid confirmed for:', selectedQuest);
                  setConfirmVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  scrollContainer: { flexGrow: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: '#DDB771', fontFamily: theme.fonts.regular, fontSize: 24, textAlign: 'center' },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  filterIcon: { width: 35, height: 35 },
  filterText: { color: '#FFFFFF', fontSize: 20, marginLeft: 8 },
  questCardWrapper: { marginBottom: 20, alignItems: 'center' },
  questCard: { backgroundColor: '#DDB771', padding: 16, borderRadius: 10, width: '100%', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  questDetails: { flex: 1, marginLeft: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#000', fontWeight: '600' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' },
  bidButton: { backgroundColor: '#FFFFFF', paddingVertical: 6, borderRadius: 5, alignItems: 'center', marginTop: 10, width: 80, elevation: 3 },
  bidButtonText: { fontWeight: 'bold', fontSize: 16 },
  backButton: { position: 'absolute',top: 2, right: 0, borderWidth: 2, borderColor: '#DDB771', borderRadius: 4, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#DDB771', fontSize: 24, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#073B3A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDetail: {
    fontSize: 14,
    color: '#073B3A',
    marginBottom: 4,
  },
  modalLabel: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});