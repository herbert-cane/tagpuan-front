import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Image, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

const applicants = [
  { id: '1', name: 'Juan Dela Cruz', firstName: 'Juan', middleName: 'One', lastName: 'Dela Cruz', username: 'Juan', email: 'juandelacruz@gmail.com', role: 'Farmer', idFrontImage: require('../assets/images/main-image.png'), idBackImage: require('../assets/images/main-image.png') },
  { id: '2', name: 'Sandra Xu Yen', firstName: 'Sandra', middleName: 'Two', lastName: 'Xu Yen', username: 'Sandra', email: 'sandraxuyen@gmail.com', role: 'Merchant', idFrontImage: require('../assets/images/main-image.png'), idBackImage: require('../assets/images/main-image.png') },
  { id: '3', name: 'Ate Gina', firstName: 'Gina', middleName: 'Three', lastName: '', username: 'Gina', email: 'ategina@gmail.com', role: 'Vendor', idFrontImage: require('../assets/images/main-image.png'), idBackImage: require('../assets/images/main-image.png') },
  { id: '4', name: 'Bossing Tom', firstName: 'Tom', middleName: 'Four', lastName: '', username: 'Tom', email: 'bossingtom@gmail.com', role: 'Supplier', idFrontImage: require('../assets/images/main-image.png'), idBackImage: require('../assets/images/main-image.png') },
  { id: '5', name: 'Manang Rina', firstName: 'Rina', middleName: 'Five', lastName: '', username: 'Rina', email: 'manangrina@gmail.com', role: 'Farmer', idFrontImage: require('../assets/images/main-image.png'), idBackImage: require('../assets/images/main-image.png') },
];

type Applicant = {
  id: string;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  idFrontImage: any;
  idBackImage: any;
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
      {applicant.name}
    </Text>
  </TouchableOpacity>
);

export default function VerificationPage() {
  const [selectedApplicant, setSelectedApplicant] = useState(applicants[0]);
  const [modalVisible, setModalVisible] = useState(false);

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
          data={applicants}
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
    
      <ScrollView style={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      >

      {/* Applicant Details Section */}
      <Text style={styles.sectionTitle}>Applicant Details</Text>
      <View style={styles.detailsContainer}>
        <TextInput
          style={styles.detailInput}
          value={`First Name: ${selectedApplicant?.firstName || ''}`}
          editable={false}
        />
        <TextInput
          style={styles.detailInput}
          value={`Middle Name: ${selectedApplicant?.middleName || ''}`}
          editable={false}
        />
        <TextInput
          style={styles.detailInput}
          value={`Last Name: ${selectedApplicant?.lastName || ''}`}
          editable={false}
        />
        <TextInput
          style={styles.detailInput}
          value={`Username: ${selectedApplicant?.username || ''}`}
          editable={false}
        />
        <TextInput
          style={styles.detailInput}
          value={`Email: ${selectedApplicant?.email || ''}`}
          editable={false}
        />
        <TextInput
          style={styles.detailInput}
          value={`Role: ${selectedApplicant?.role || ''}`}
          editable={false}
        />

        {/* ID Picture */}
        {selectedApplicant?.idFrontImage && (
          <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image source={selectedApplicant.idFrontImage} style={styles.idFrontImage} />
            </TouchableOpacity>

            {/* Modal for Expanded Image */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Image
                  source={selectedApplicant.idFrontImage}
                  style={styles.expandedImage}
                  resizeMode="contain"
                />
              </View>
            </Modal>
          </>
        )}

        {selectedApplicant?.idBackImage && (
          <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image source={selectedApplicant.idBackImage} style={styles.idBackImage} />
            </TouchableOpacity>

            {/* Modal for Expanded Image */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Image
                  source={selectedApplicant.idBackImage}
                  style={styles.expandedImage}
                  resizeMode="contain"
                />
              </View>
            </Modal>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => console.log('Rejected')}>
          <Text style={styles.buttonText}>REJECT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => console.log('Accepted')}>
          <Text style={styles.buttonText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>

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
    maxWidth: '99%',
    height: 100,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DDB771',
  },
  idBackImage: {
    maxWidth: '99%',
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
});
