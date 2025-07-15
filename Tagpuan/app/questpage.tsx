import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import QuestFilter from '../components/questfilter';
import { router } from 'expo-router';
import { auth } from '@/firebaseConfig';

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
  const [loading, setLoading] = useState(true);

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

  const formatDate = (timestamp: number) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };

  const mapQuestFields = (quest: any, contractorName: string) => {
    return {
      contractId: quest.id,
      contractor: contractorName,
      contractorProfilePic: quest.contractorDetails?.profile_picture || null,
      commodity: quest.commodity.name,
      quantity: quest.quantity + ' ' + quest.unit,
      price: '₱' + quest.price + '/' + quest.unit,
      schedule:
        quest.schedule && typeof quest.schedule === 'object' && '_seconds' in quest.schedule
          ? `On or before ${formatDate(quest.schedule._seconds * 1000)}`
          : 'Unknown',
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
      hasActiveBid: quest.hasActiveBid,
      bidStatus: quest.bidStatus || null,
      bidId: quest.bidId || null,
      status: quest.status,
    };
  };

  const applyFilters = (rawFilters: {
    commodity?: string[];
    payment_terms?: string[];
    logistics?: string[];
    duration?: string[];
  }) => {
    setFilterVisible(false);

    const filters = {
      commodity: rawFilters.commodity?.length ? rawFilters.commodity : undefined,
      payment_terms: rawFilters.payment_terms?.length ? rawFilters.payment_terms : undefined,
      logistics: rawFilters.logistics?.length ? rawFilters.logistics : undefined,
      duration: rawFilters.duration?.length ? rawFilters.duration : undefined,
    };

    const hasNoFilters = !filters.commodity && !filters.payment_terms && !filters.logistics && !filters.duration;

    if (hasNoFilters) {
      setFilteredQuests(requests.map((quest: any) => mapQuestFields(quest, quest.contractorName)));
      return;
    }

    const filtered = requests.filter((quest) => {
      return (
        (!filters.commodity || filters.commodity.includes(quest.commodity.id)) &&
        (!filters.payment_terms || filters.payment_terms.includes(quest.payment_terms)) &&
        (!filters.logistics || filters.logistics.includes(quest.logistics)) &&
        (!filters.duration || filters.duration.includes(quest.duration))
      );
    }).map((quest: any) => mapQuestFields(quest, quest.contractorName));

    setFilteredQuests(filtered);
  };

  const fetchRequests = async () => {
    let requestsLoaded = false;

    const checkLoading = () => {
      if (requestsLoaded) setLoading(false);
    };

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

      const questsWithDetails = await Promise.all(
        data.map(async (quest: any) => {
          try {
            const contractorRes = await fetch(`${FIREBASE_API}/user/${quest.contractor_id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (!contractorRes.ok) {
              const text = await contractorRes.text();
              throw new Error(`API error: ${contractorRes.status} - ${text}`);
            }
            const contractorData = await contractorRes.json();
            const contractorName = contractorData.first_name + " " + contractorData.last_name || 'Unknown Contractor';
            const contractorProfilePic = contractorData.profile_picture || null;

            // Check if user has active bid for this request
            const bidCheckRes = await fetch(`${FIREBASE_API}/bid/check/${quest.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            let hasActiveBid = false;
            if (bidCheckRes.ok) {
              const bidCheckData = await bidCheckRes.json();
              hasActiveBid = !!bidCheckData.hasActiveBid.hasActiveBid;
              quest.bidStatus = bidCheckData.hasActiveBid.status ?? null;
              quest.bidId = bidCheckData.hasActiveBid.id ?? null;
            }

            return { ...quest, contractorName, contractorProfilePic, contractorDetails: contractorData, hasActiveBid, bidStatus: quest.bidStatus, bidId: quest.bidId };
          } catch (error) {
            console.error('Error fetching user details or bid status:', error);
            return { ...quest, contractorName: 'Unknown Contractor', contractorProfilePic: null, contractorDetails: {}, hasActiveBid: false };
          }
        })
      );

      setRequests(questsWithDetails);
      setFilteredQuests(questsWithDetails.map((quest: any) => mapQuestFields(quest, quest.contractorName)));
      requestsLoaded = true;
      checkLoading();
    } catch (error) {
      console.error('Error fetching requests:', error);
      requestsLoaded = true;
      checkLoading();
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  const createBid = async () => {
    if (!selectedQuest) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const response = await fetch(`${FIREBASE_API}/bid/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: selectedQuest.contractId,
          farmer_id: user.uid,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        alert(`Error creating bid: ${text}`);
        throw new Error(`API error: ${response.status} - ${text}`);
      }
      await fetchRequests();
      alert('Bid created successfully!');
      setConfirmVisible(false);
      fetchRequests();
    } catch (error) {
      console.error('Error creating bid:', error);
    }
  };

  const withdrawBid = async () => {
    if (!selectedQuest) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const response = await fetch(`${FIREBASE_API}/bid/withdraw/${selectedQuest.bidId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        alert(`Error withdrawing bid: ${text}`);
        throw new Error(`API error: ${response.status} - ${text}`);
      }
      await fetchRequests();
      alert('Bid withdrawn successfully!');
      setConfirmVisible(false);
    } catch (error) {
      console.error('Error withdrawing bid:', error);
    }
  };

  const rebid = async () => {
    if (!selectedQuest) return;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const response = await fetch(`${FIREBASE_API}/bid/rebid/${selectedQuest.bidId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        alert(`Error withdrawing bid: ${text}`);
        throw new Error(`API error: ${response.status} - ${text}`);
      }
      await fetchRequests();
      alert('Successfully confirmed re-bidding!');
      setConfirmVisible(false);
    } catch (error) {
      console.error('Error withdrawing bid:', error);
    }
  };

  const bidButtonOptions = [
    {
      condition: (isActive: boolean, status?: string, questStatus?: string) =>
        !isActive && questStatus === 'Up for Bidding',
      text: 'Bid',
      color: '#FFF',
      modalColor: '#08A045',
    },
    {
      condition: (isActive: boolean, status?: string, questStatus?: string) =>
        isActive && status === 'Pending' && questStatus === 'Up for Bidding',
      text: 'Withdraw',
      color: '#D9534F',
      modalColor: '#D9534F',
    },
    {
      condition: (isActive: boolean, status?: string, questStatus?: string) =>
        isActive && status === 'Withdrawn' && questStatus === 'Up for Bidding',
      text: 'Re-bid',
      color: '#FFF',
      modalColor: '#08A045',
    },
    {
      condition: (isActive: boolean, status?: string, questStatus?: string) =>
        isActive && (status === 'Won' || status === 'Lost' || status === 'Withdrawn') && questStatus !== 'Up for Bidding',
      text: 'View',
      color: '#FFE699',
    },
  ];

  if (!loading && filteredQuests.length === 0) {
    return (
      <LinearGradient
        style={styles.container}
        colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
            There are no quests that meet your conditions.
          </Text>
          <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
             Please check back again later or adjust your filters.
          </Text>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ marginTop: 10 }}>
            <Text style={{ color: '#DDB771', textDecorationLine: 'underline' }}>
              Adjust Filters
            </Text>
          </TouchableOpacity>
        </View>
  
        <QuestFilter
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={applyFilters}
        />
      </LinearGradient>
      );
    }

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

        {filteredQuests.map((quest, index) => {
          if (!quest.hasActiveBid && quest.status !== 'Up for Bidding') return null;
          return (
            <View key={quest.contractId ?? index} style={styles.questCardWrapper}>
              <TouchableOpacity
                style={styles.questCard}
                onPress={() => {
                  setSelectedQuest(quest);
                  setConfirmVisible(true);
                }}
              >
                <View style={styles.cardHeader}>
                  {quest.contractorProfilePic ? (
                    <Image
                      source={{ uri: quest.contractorProfilePic }}
                      style={{ width: 38, height: 38, borderRadius: 19 }}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={38} color="#808080" />
                  )}
                  <View style={styles.questDetails}>
                    {Object.entries(quest).map(([key, value]) => {
                      if (
                        key === 'contractorProfilePic' ||
                        key === 'hasActiveBid' ||
                        key === 'contractId' ||
                        key === 'bidId' ||
                        key === 'bidStatus' ||
                        key === 'status'
                      )
                        return null;
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
              {bidButtonOptions.map((option, idx) =>
                option.condition(quest.hasActiveBid, quest.bidStatus, quest.status) ? (
                  <TouchableOpacity
                    key={option.text + '-' + idx}
                    style={[
                      styles.bidButton,
                      { backgroundColor: option.color },
                    ]}
                    onPress={() => {
                      setSelectedQuest(quest);
                      setConfirmVisible(true);
                    }}
                  >
                    <Text style={styles.bidButtonText}>{option.text}</Text>
                  </TouchableOpacity>
                ) : null
              )}
            </View>
          );
        })}
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
            {selectedQuest && (
              <View style={{ marginBottom: 10 }}>
                {selectedQuest.status !== 'Up for Bidding' ? (
                  <Text style={styles.modalTitle}>Bid Details</Text>
                ) : selectedQuest.hasActiveBid
                  ? selectedQuest.bidStatus === 'Pending'
                    ? <Text style={styles.modalTitle}>Withdraw Bid</Text>
                    : <Text style={styles.modalTitle}>Re-bid</Text>
                  : <Text style={styles.modalTitle}>Confirm Bid</Text>}

                {Object.entries(selectedQuest).map(([key, value]) => {
                  if (
                    key === 'contractorProfilePic' ||
                    key === 'hasActiveBid' ||
                    key === 'contractId' ||
                    key === 'bidId' ||
                    key === 'bidStatus' ||
                    key === 'status'
                  )
                    return null;
                  return (
                    <View key={key} style={styles.row}>
                      <Text style={styles.modalDetail}>
                        {key === 'modeOfPayment'
                          ? 'Mode of Payment:'
                          : key.charAt(0).toUpperCase() + key.slice(1) + ':'}
                      </Text>
                      <Text style={styles.modalLabel}>{String(value)}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={[styles.modalActions, { flexDirection: 'column', alignItems: 'stretch' }]}>
              <>
                {selectedQuest && selectedQuest.hasActiveBid && selectedQuest.bidStatus === 'Won' && selectedQuest.status !== 'Up for Bidding'
                  ? (<Text style={styles.modalStatus}>You have won this bid.</Text>)
                  : selectedQuest && selectedQuest.status !== 'Up for Bidding'
                  ? (<Text style={styles.modalStatus}>This quest is no longer available.</Text>)
                  : null}
                <Text
                  style={[
                    styles.modalDetail,
                    { textAlign: 'center' },
                    selectedQuest && selectedQuest.hasActiveBid && selectedQuest.bidStatus === 'Pending'
                      ? { color: '#D9534F' }
                      : {}
                  ]}
                >
                    {selectedQuest && selectedQuest.status === 'Up for Bidding'
                    ? selectedQuest.hasActiveBid
                      ? selectedQuest.bidStatus === 'Pending'
                      ? 'Are you sure you want to withdraw your bid?'
                      : 'Are you sure you want to re-bid for this quest?'
                      : 'Are you sure you want bid for this quest?'
                    : ''}
                </Text>

                {selectedQuest && selectedQuest.status === 'Up for Bidding' &&
                  bidButtonOptions.map((option, idx) =>
                    selectedQuest && option.condition(selectedQuest.hasActiveBid, selectedQuest.bidStatus, selectedQuest.status) ? (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.modalButton, { backgroundColor: option.modalColor, marginVertical: 5, width: '100%' }]}
                        onPress={() => {
                          if (option.text === 'Bid') {
                            createBid();
                          } else if (option.text === 'Withdraw') {
                            withdrawBid();
                          } else if (option.text === 'Re-bid') {
                            rebid();
                          }
                          setConfirmVisible(false);
                        }}
                      >
                        <Text style={styles.modalButtonText}>{option.text}</Text>
                      </TouchableOpacity>
                    ) : null
                  )}

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#808080', marginVertical: 5, width: '100%' }]}
                  onPress={() => setConfirmVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
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
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 5,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  },
  loadingText: {
    marginTop: 16,
    color: '#DDB771',
    fontSize: 18,
    fontWeight: 'bold',
  },
  withdrawButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: 120,
    elevation: 3,
  },
});