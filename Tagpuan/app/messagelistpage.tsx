import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

const contacts = [
  {
    id: '1',
    name: 'Juan Dela Cruz',
    message: 'On the way na po yung orders niyo.',
    image: require('../assets/images/react-logo.png'),
    isOnline: true,
  },
  {
    id: '2',
    name: 'Bossing Tom',
    message: 'Send ko po sa inyo bukas.',
    image: require('../assets/images/main-image.png'),
    isOnline: false,
  },
  {
    id: '3',
    name: 'Sandra Xu Yen',
    message: 'Hello! Is this available?',
    image: require('../assets/images/react-logo.png'),
    isOnline: true,
  },
  {
    id: '4',
    name: 'Ate Gina',
    message: 'On the way na po yung orders niyo.',
    image: require('../assets/images/main-image.png'),
    isOnline: true,
  },
  {
    id: '5',
    name: 'Manang Rina',
    message: 'Sorry po, di po siya available.',
    image: require('../assets/images/react-logo.png'),
    isOnline: false,
  },
  {
    id: '6',
    name: 'Kuya Boy',
    message: 'Tara, kita tayo mamaya.',
    image: require('../assets/images/main-image.png'),
    isOnline: true,
  },
  {
    id: '7',
    name: 'Aling Nena',
    message: 'Saan mo nakuha yan?',
    image: require('../assets/images/react-logo.png'),
    isOnline: false,
  },
  {
    id: '8',
    name: 'Totoy',
    message: 'Pasensya na, hindi ko pa nagagawa.',
    image: require('../assets/images/main-image.png'),
    isOnline: true,
  },
  {
    id: '9',
    name: 'Ka Pedro',
    message: 'Meron pa bang stock?',
    image: require('../assets/images/react-logo.png'),
    isOnline: true,
  },
  {
    id: '10',
    name: 'Lola Biring',
    message: 'Salamat sa tulong mo kanina.',
    image: require('../assets/images/main-image.png'),
    isOnline: false,
  },
];

// Horizontal list for top contacts
const TopContactCard = ({ contact }) => (
  <View style={styles.topContactCard}>
    <Image source={contact.image} style={styles.topProfilePic} />
    {contact.isOnline && <View style={styles.onlineIndicator} />}
    <Text style={styles.topContactName} numberOfLines={1}>
      {contact.name}
    </Text>
  </View>
);

// Vertical list for messages
const ContactCard = ({ contact }) => (
  <View style={styles.contactCard}>
    <Image source={contact.image} style={styles.profilePic} />
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text style={styles.contactMessage}>{contact.message}</Text>
    </View>
    {contact.isOnline && <View style={styles.onlineIndicator} />}
  </View>
);

export default function MessageListPage() {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MESSAGES</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Top Contacts Section */}
      <Text style={styles.sectionTitle}>Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <TopContactCard contact={item} />}
        contentContainerStyle={styles.topContactsList}
      />

      {/* Message List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ContactCard contact={item} />}
        showsVerticalScrollIndicator={false}
      />

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
  // Top Contacts Section
  sectionTitle: {
    color: '#DDB771',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  topContactsList: {
    paddingTop: 24,
    paddingBottom: 56,
  },
  topContactCard: {
    alignItems: 'center',
    marginRight: 12,
    width: 70,
  },
  topProfilePic: {
    width: 60,
    height: 60,
    borderRadius: 25,
  },
  topContactName: {
    color: '#DDB771',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    width: 70,
    paddingBottom: 56,
  },
  // Online Indicator
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#08A045',
    position: 'absolute',
    right: 2,
    top: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  }, 
  // Contact Card Styles (for vertical list)
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 59, 58, 0.5)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#DDB771',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactMessage: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
