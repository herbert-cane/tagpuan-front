import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import theme from '../constants/theme';

export default function BiddingDashboard() {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';
  if (!FIREBASE_API) {
    throw new Error('FIREBASE_API URL is not set. Please check your environment configuration.');
  }
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Helper function to format a timestamp (milliseconds) to a readable date
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


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        const response = await fetch(`${FIREBASE_API}/request/user`, {
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
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const [commodities, setCommodities] = useState<any[]>([]);

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
    <LinearGradient colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>REQUESTS</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        {requests.length === 0 ? (
          <Text style={styles.noRequests}>You haven't posted any requests yet.</Text>
        ) : (
          requests.map((request) => (
            request ? (
              <View key={request.id} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={styles.requestCard}
                  onPress={() => {
                    setSelectedRequest(request);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.cardHeader}>
                  <View style={styles.iconWrapper}>
                      <Ionicons name="document-text-outline" size={36} color="#808080" />
                  </View>
                  <View style={styles.requestDetails}>
                      <View style={styles.detailRow}>
                      <Text style={styles.label}>Commodity:</Text>
                      <Text style={styles.value}>
                        {
                          (() => {
                            const commodityObj = commodities.find(c => c.id === request.commodity);
                            return commodityObj
                              ? `${commodityObj.en_name} (${commodityObj.hil_name})`
                              : request.commodity;
                          })()
                        }
                      </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Quantity: <Text style={styles.value}>{request.quantity} {request.unit}</Text></Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Price: </Text>
                        <Text style={styles.value}>₱{request.price}/{request.unit}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>
                          Schedule:{" "}
                            <Text style={styles.value}>
                            On or before{" "}
                            {request.schedule && typeof request.schedule === "object" && "_seconds" in request.schedule
                              ? formatDate(request.schedule._seconds * 1000)
                              : "Unknown"}
                            </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Details</Text>

            {selectedRequest && (
              <>
              <Text style={styles.label}>
                Commodity: <Text style={styles.value}>
                  {(() => {
                    const commodityObj = commodities.find(c => c.id === selectedRequest.commodity);
                    return commodityObj
                      ? `${commodityObj.en_name} (${commodityObj.hil_name})`
                      : selectedRequest.commodity;
                  })()}
                </Text>
              </Text>
                <Text style={styles.label}>Quantity: <Text style={styles.value}>{selectedRequest.quantity} {selectedRequest.unit}</Text></Text>
                <Text style={styles.label}>Price: <Text style={styles.value}>₱{selectedRequest.price}/{selectedRequest.unit}</Text></Text>
                <Text style={styles.label}>
                  Schedule:{" "}
                    <Text style={styles.value}>
                    On or before{" "}
                    {selectedRequest.schedule && typeof selectedRequest.schedule === "object" && "_seconds" in selectedRequest.schedule
                      ? formatDate(selectedRequest.schedule._seconds * 1000)
                      : "Unknown"}
                    </Text>
                </Text>
                <Text style={styles.label}>
                  Delivery:{" "}
                  <Text style={styles.value}>
                    {
                      (() => {
                        const mode = deliveryModes.find(m => m.id === selectedRequest.logistics);
                        return mode ? mode.name : selectedRequest.logistics;
                      })()
                    }
                  </Text>
                </Text>
                <Text style={styles.label}>
                  Payment Method:{" "}
                  <Text style={styles.value}>
                    {
                      (() => {
                        const mode = paymentList.find(m => m.id === selectedRequest.payment_terms);
                        return mode ? mode.name : selectedRequest.payment_terms;
                      })()
                    }
                  </Text>
                </Text>

                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { fontSize: 16 }]}>Bidders:</Text>
                  {selectedRequest.bidders && selectedRequest.bidders.length > 0 ? (
                    selectedRequest.bidders.map((bidder: any, idx: number) => (
                      <View key={idx} style={styles.bidderRow}>
                        <View>
                          <Text style={styles.bidderName}>{bidder.name}</Text>
                        </View>

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => {
                              router.push({
                                pathname: '/profilepage',
                                // params: { userId: bidder.id },
                              });
                            }}
                          >
                            <Ionicons name="person-outline" size={20} color="#fff" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.messageBtn}
                            onPress={() =>
                              router.push({
                                pathname: '/messagepage',
                                params: { recipientId: bidder.id }, // update based on your routing
                              })
                            }
                          >
                            <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" />
                          </TouchableOpacity>

                          {/* Vertical Divider */}
                          <View style={styles.verticalDivider} />

                          {/* Accept / Reject */}
                          <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => console.log('Accepted', bidder.id)}
                          >
                            <Text style={styles.actionText}>✔</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => console.log('Rejected', bidder.id)}
                          >
                            <Text style={styles.actionText}>✖</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noBids}>No bids yet.</Text>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  scrollContainer: { flexGrow: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: '#DDB771', fontFamily: theme.fonts.regular, fontSize: 24, textAlign: 'center' },
  backButton: { position: 'absolute', top: 2, right: 0, borderWidth: 2, borderColor: '#DDB771', borderRadius: 4, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#DDB771', fontSize: 24, fontWeight: 'bold' },
  cardWrapper: { marginBottom: 20, alignItems: 'center' },
  requestCard: { backgroundColor: '#DDB771', padding: 16, borderRadius: 10, width: '100%', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  requestDetails: { flex: 1, marginLeft: 10 },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#073B3A',
    marginLeft: 8, // <-- space between label and value
  },
  noRequests: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20, fontFamily: theme.fonts.regular },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#DDB771',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#073B3A',
    fontFamily: 'NovaSquare-Regular',
  },
  bidderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  bidderName: {
    fontSize: 14,
    color: '#073B3A',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    // gap is not supported in React Native; use marginRight on children instead
  },
  acceptBtn: {
    backgroundColor: '#6BBF59',
    borderRadius: 4,
    padding: 6,
    marginRight: 8, // Add spacing between buttons
  },
  rejectBtn: {
    backgroundColor: '#D9534F',
    borderRadius: 4,
    padding: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noBids: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#888',
  },
  profileBtn: {
    backgroundColor: '#0B6E4F',
    borderRadius: 4,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Add spacing between buttons
  },
  messageBtn: {
    backgroundColor: '#08A045',
    borderRadius: 4,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Add spacing between buttons
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },
});
