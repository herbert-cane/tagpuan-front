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
import { collection, getDocs, query, where } from 'firebase/firestore';
import theme from '../constants/theme';

export default function BiddingDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const mockRequest = {
      id: 'mock1',
      commodity: 'Chicken Eggs',
      contractType: 'Bulk',
      price: '₱85/kg',
      schedule: 'Within 5 days',
      delivery: 'Brgy. Dumulog, Roxas City, Capiz',
      bidders: [
        { id: 'u1', name: 'Carlos Tan', amount: '₱83/kg' },
        { id: 'u2', name: 'Ana Reyes', amount: '₱84/kg' },
      ],
    };
    setRequests([mockRequest]);
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
          requests.map((request, index) => (
            <View key={index} style={styles.cardWrapper}>
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
                    <Text style={styles.value}>{request.commodity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                    <Text style={styles.label}>Contract:</Text>
                    <Text style={styles.value}>{request.contractType}</Text>
                    </View>
                    <View style={styles.detailRow}>
                    <Text style={styles.label}>Price:</Text>
                    <Text style={styles.value}>{request.price}</Text>
                    </View>
                </View>
                </View>
              </TouchableOpacity>
            </View>
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
                <Text style={styles.label}>Commodity: <Text style={styles.value}>{selectedRequest.commodity}</Text></Text>
                <Text style={styles.label}>Contract: <Text style={styles.value}>{selectedRequest.contractType}</Text></Text>
                <Text style={styles.label}>Price: <Text style={styles.value}>{selectedRequest.price}</Text></Text>
                <Text style={styles.label}>Schedule: <Text style={styles.value}>{selectedRequest.schedule}</Text></Text>
                <Text style={styles.label}>Delivery: <Text style={styles.value}>{selectedRequest.delivery}</Text></Text>

                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { fontSize: 16 }]}>Bidders:</Text>
                  {selectedRequest.bidders && selectedRequest.bidders.length > 0 ? (
                    selectedRequest.bidders.map((bidder: any, idx: number) => (
                      <View key={idx} style={styles.bidderRow}>
                        <View>
                          <Text style={styles.bidderName}>{bidder.name}</Text>
                          <Text style={styles.bidderAmount}>{bidder.amount}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity style={styles.acceptBtn} onPress={() => console.log('Accepted', bidder.id)}>
                            <Text style={styles.actionText}>✔</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.rejectBtn} onPress={() => console.log('Rejected', bidder.id)}>
                            <Text style={styles.actionText}>✖</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noBids}>No bidders yet.</Text>
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
  noRequests: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20, fontFamily: 'NovaSquare-Regular' },
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
  bidderAmount: {
    fontSize: 13,
    color: '#08A045',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#6BBF59',
    borderRadius: 4,
    padding: 6,
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
});
