import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator, // <-- Import ActivityIndicator
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
  const [loading, setLoading] = useState(true); // <-- Add loading state

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
    const fetchRequestsAndBids = async () => {
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

      const requestsWithBids = await Promise.all(
        data.map(async (request: any) => {
          try {
            const bidsRes = await fetch(`${FIREBASE_API}/bid/request/${request.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            let bidders: any[] = [];
            if (bidsRes.ok) {
              const bids = await bidsRes.json();
              bidders = bids.map((bid: any) => ({
                id: bid.farmer_id,
                name: bid.user ? (bid.user.first_name + " " + bid.user.last_name) : 'Unknown',
                ...bid,
              }));
            }

            // Fetch winning bid if status is not "Up for Bidding"
            let winning_bid = null;
            if (request.status !== "Up for Bidding") {

              const winRes = await fetch(`${FIREBASE_API}/request/get-winning-bid/${request.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (winRes.ok) {
                const winBid = await winRes.json();
                if (winBid && Object.keys(winBid).length > 0) {
                  winning_bid = winBid;
                }
              }
            }
            return { ...request, bidders, winning_bid };
          } catch {
            return { ...request, bidders: [], winning_bid: null };
          }
        })
      );
      setRequests(requestsWithBids);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching requests or bids:', error);
    }
  };
    fetchRequestsAndBids();
  }, []);

  // Set winning bid
  const setWinningBid = async (requestId: string, bidId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      // The backend expects reqId as a URL param and bidId in the body
      const response = await fetch(
      `${FIREBASE_API}/request/set-winning-bid/${requestId}`,
      {
        method: 'PUT',
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bidId }),
      }
      );
      if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error: ${response.status} - ${text}`);
      }
      setModalVisible(false);
      alert('Winning bid set successfully!');
    } catch (error) {
      console.error('Error setting winning bid:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DDB771" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </LinearGradient>
    );
  }

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
                        <Text style={styles.value}>{request.commodity.name}</Text>
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
                  Commodity: <Text style={styles.value}><Text style={styles.value}>{selectedRequest.commodity.name}</Text></Text>
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
                  <Text style={[styles.label, { fontSize: 16 }]}>Winning Bid:</Text>
                  {selectedRequest.winning_bid ? (
                    <View style={styles.bidderRow}>
                      <View>
                        <Text style={[styles.bidderName, { paddingBottom: 10 }]}>
                          {selectedRequest.winning_bid && selectedRequest.bidders
                            ? (() => {
                                const winner = selectedRequest.bidders.find(
                                  (bidder: any) => bidder.farmer_id === selectedRequest.winning_bid.farmer_id
                                );
                                return winner ? winner.name : 'Unknown';
                              })()
                            : 'Unknown'}
                        </Text>
                        <View style={styles.verticalDivider} />

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={() => {
                              router.push({
                                pathname: '/profilepage',
                                params: { userId: selectedRequest.winning_bid.farmer_id },
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
                                // params: { recipientId: bidder.id }, // update based 
                              })
                            }
                          >
                            <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" />
                          </TouchableOpacity>
                          </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.statusText}>You have not selected a winning bid yet</Text>
                  )}
                </View>
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { fontSize: 16 }]}>Bidders:</Text>

                  {selectedRequest.bidders && selectedRequest.bidders.length > 0 ? (
                    selectedRequest.bidders.map((bidder: any, idx: number) => (
                      selectedRequest.winning_bid && selectedRequest.winning_bid.farmer_id === bidder.farmer_id ? null : // Skip the winning bid
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
                                params: { userId: bidder.farmer_id },
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
                          {bidder.status === "Pending" ? (
                            <>
                              <TouchableOpacity
                                style={styles.acceptBtn}
                                onPress={() => setWinningBid(selectedRequest.id, bidder.id)}
                              >
                                <Text style={styles.actionText}>✔</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.rejectBtn}
                                onPress={() => console.log('Rejected', bidder.id)}
                              >
                                <Text style={styles.actionText}>✖</Text>
                              </TouchableOpacity>
                            </>
                          ) : bidder.status === "Withdrawn" ? (
                            <Text style={styles.statusText}>Withdrawn</Text>
                          ) : bidder.status === "Lost" ? (
                            <Text style={styles.statusText}>Bidding is over</Text>
                          ) : null}
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
  statusText: {
    color: '#888',
    fontStyle: 'italic',
    paddingTop: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#DDB771',
    fontSize: 18,
    fontFamily: theme.fonts.regular,
  },
});
