import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Image, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import { auth } from '@/firebaseConfig';

type Applicant = {
  id: string;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  address: string;
  image: string;
  frontIDUrl: any;
  backIDUrl: any;
  farmer_details?: {
    commodity: { id: string; name: string }[],
    modeOfDelivery: string;
  };
};

type ApplicantCardProps = {
  applicant: Applicant;
  isSelected: boolean;
  onPress: () => void;
};

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.applicantCard, isSelected && styles.selectedCard]}
    onPress={onPress}
  >
    <Text style={[styles.applicantName, isSelected && styles.selectedText]}>
      {applicant.first_name} {applicant.last_name}
    </Text>
  </TouchableOpacity>
);

export default function VerificationPage() {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';

  const [selectedApplicant, setSelectedApplicant] = useState(null as Applicant | null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'item'>('account');
  const [applicantsList, setApplicantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const deliveryModes = [
    { id: 'pickup', name: 'Pickup' },
    { id: 'delivery', name: 'Delivery' },
  ];

  useEffect(() => {
    const fetchUnverified = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${FIREBASE_API}/user/unverified`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch applicants');
        const data = await response.json();
        setApplicantsList(data);
        setSelectedApplicant(data[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    };

    fetchUnverified();
  }, []);

  if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DDB771" />
        </View>
      );
    }

  async function handleAccept() {
    if (!selectedApplicant) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${FIREBASE_API}/user/verify/${selectedApplicant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to verify user');
      Alert.alert('Success', 'User has been verified successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/verificationpage'),
        },
      ]);
    } catch (error) {
      console.error('Error verifying user:', error);
      Alert.alert('Error', 'Failed to verify user');
    }
  }

  async function handleReject() {
    if (!selectedApplicant) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${FIREBASE_API}/user/reject/${selectedApplicant.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to verify user');
      Alert.alert('Success', 'User has been verified successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/verificationpage'),
        },
      ]);
    } catch (error) {
      console.error('Error rejecting user verification:', error);
      Alert.alert('Error', 'Failed to reject user');
    }
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VERIFY</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Applicants Section */}
      <Text style={styles.sectionTitle}>Applicants</Text>
      <View style={styles.applicantContainer}>
        <FlatList
          data={applicantsList}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <ApplicantCard
              applicant={item}
              isSelected={item.id === selectedApplicant?.id}
              onPress={() => setSelectedApplicant(item)}
            />
          )}
          contentContainerStyle={styles.applicantList}
        />
      </View>

      <View style={styles.divider} />
          
      <View style={styles.tabButtonsWrapper}>
        <View style={styles.tabButtonsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'account' && styles.activeTab]}
            onPress={() => setActiveTab('account')}
          >
            <Text style={styles.tabText}>Account Verification</Text>
          </TouchableOpacity>

          {selectedApplicant?.role === "Vendor" &&
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'item' && styles.activeTab]}
            onPress={() => setActiveTab('item')}
          >
            <Text style={styles.tabText}>Item Verification</Text>
          </TouchableOpacity>}
        </View>
      </View>


      <ScrollView
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'account' ? (
          <>
            <Text style={styles.sectionTitle}>Applicant Details</Text>
            <View style={styles.detailsContainer}>
              <TextInput style={styles.detailInput} value={`First Name: ${selectedApplicant?.first_name || ''}`} editable={false} />
              {selectedApplicant?.middle_name &&
              <TextInput style={styles.detailInput} value={`Middle Name: ${selectedApplicant?.middle_name}`} editable={false} />}
              <TextInput style={styles.detailInput} value={`Last Name: ${selectedApplicant?.last_name || ''}`} editable={false} />
              <TextInput style={styles.detailInput} value={`Username: ${selectedApplicant?.username || ''}`} editable={false} />
              <TextInput style={styles.detailInput} value={`Email: ${selectedApplicant?.email || ''}`} editable={false} />
              <TextInput
                style={styles.detailInput}
                value={`Address: ${selectedApplicant?.address || 'Not specified'}`}
                editable={false}
              />
              {selectedApplicant?.role === "Farmer" && (
                <>
                  <TextInput
                    style={styles.detailInput}
                    value={
                      Array.isArray(selectedApplicant?.farmer_details?.modeOfDelivery) && selectedApplicant.farmer_details.modeOfDelivery.length > 0
                        ? `Mode of Delivery: ${selectedApplicant.farmer_details.modeOfDelivery
                            .map(id => {
                              const match = deliveryModes.find(mode => mode.id === id);
                              return match ? match.name : id;
                            })
                            .join(', ')}`
                        : 'Mode of Delivery: Not specified'
                    }
                    editable={false}
                  />
                </>
              )}
              {/* ID Picture Front */}
              {selectedApplicant?.backIDUrl && (
                <>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image source={{uri: selectedApplicant.frontIDUrl}} style={styles.idFrontImage} />
                  </TouchableOpacity>
                  <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                      <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                      <Image source={{uri: selectedApplicant.frontIDUrl}} style={styles.expandedImage} resizeMode="contain" />
                    </View>
                  </Modal>
                </>
              )}

              {/* ID Picture Back */}
              {selectedApplicant?.backIDUrl && (
                <>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image source={{uri: selectedApplicant.backIDUrl}} style={styles.idBackImage} />
                  </TouchableOpacity>
                  <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                      <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                      <Image source={{uri: selectedApplicant.backIDUrl}} style={styles.expandedImage} resizeMode="contain" />
                    </View>
                  </Modal>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.buttonText}>REJECT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.buttonText}>ACCEPT</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Item Selling Verification</Text>

            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>Item Name: Fresh Carrots</Text>
              <Text style={styles.placeholderText}>Price: ₱100</Text>
              <Text style={styles.placeholderText}>Contact: 09123456789</Text>
              <Text style={styles.placeholderText}>Status: Pending Approval</Text>
              <Image source={require('../assets/images/main-image.png')} style={styles.placeholderImage} />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.rejectButton}>
                  <Text style={styles.buttonText}>REJECT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton}>
                  <Text style={styles.buttonText}>ACCEPT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    marginTop: 8,
    letterSpacing: 1,
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 20,
  },
  backButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    borderWidth: 2,
    borderColor: '#DDB771',
    borderRadius: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#DDB771',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#DDB771',
    fontSize: 18,
    marginBottom: 16,
  },
  applicantContainer: {
    marginBottom: 12,
  },
  applicantList: {
    paddingBottom: 12,
  },
  applicantCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(7, 59, 58, 0.5)',
    borderRadius: 12,
    marginRight: 10,
    width: 100,
    height: 100,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#DDB771',
    backgroundColor: 'transparent',
  },
  applicantName: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedText: {
    color: '#DDB771',
  },
  divider: {
    width: '99%',
    height: 1,
    backgroundColor: '#DDB771',
    marginVertical: 16,
    alignSelf: 'center',
    marginBottom: 24,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailInput: {
    backgroundColor: '#F5F5F5',
    color: '#08A045',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  idFrontImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDB771',
  },
  idBackImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDB771',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  rejectButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginRight: 12,
  },
  acceptButton: {
    backgroundColor: '#DDB771',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabButtonsWrapper: {
  width: '100%',
  marginBottom: 10,
  },
  tabButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0B6E4F',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#DDB771',
  },
  tabText: {
    color: '#fff',
    fontFamily: 'NovaSquare-Regular',
    fontSize: 14,
  },
    placeholderCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  placeholderTitle: {
    color: '#073B3A',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#073B3A',
    fontSize: 14,
    marginBottom: 4,
  },
  placeholderImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginVertical: 10,
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});
