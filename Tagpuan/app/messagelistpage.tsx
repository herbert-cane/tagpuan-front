import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import { AuthContext } from './authcontext';

interface Contact {
  id: string;
  name: string;
  message: string;
  image: string;
  isOnline: boolean;
}

export default function MessageListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const { token } = useContext(AuthContext)!;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        if (!apiUrl) {
          throw new Error("API URL is undefined. Check your environment variables.");
        }
        
        const response = await fetch(`${apiUrl}/conversation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (!Array.isArray(data)) {
          throw new Error("Expected an array but got: " + JSON.stringify(data));
        }
    
          const formattedContacts: Contact[] = data.map((conv: any) => {
          const participant = conv.participants?.[0] || {};
          const lastMessage = conv.messages?.length ? conv.messages[conv.messages.length - 1] : null;
    
          return {
            id: conv._id,
            name: `${participant.first_name ?? "Unknown"} ${participant.last_name ?? "User"}`,
            message: lastMessage ? lastMessage.content : "No messages yet",
            image: participant.profile_picture,
            isOnline: participant.isOnline,
          };
        });
    
        setContacts(formattedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };      

    fetchContacts();
  }, []);

  // Loading Indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
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
        <Text style={styles.title}>MESSAGES</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
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

// Top Contact Card
const TopContactCard = ({ contact }: { contact: Contact }) => (
  <View style={styles.topContactCard}>
    <Image 
    source={
      contact.image
        ? { uri: `data:image/png;base64,${contact.image}` }
        : require("../assets/images/react-logo.png")
    }
    
    style={styles.topProfilePic} />
    {contact.isOnline && <View style={styles.onlineIndicator} />}
    <Text style={styles.topContactName} numberOfLines={1}>
      {contact.name}
    </Text>
  </View>
);

// Contact Card
const ContactCard = ({ contact }: { contact: Contact }) => (
  <TouchableOpacity onPress={() => router.push(`/messagepage?conversationId=${contact.id}&name=${contact.name}`)}>
    <View style={styles.contactCard}>
      <Image 
      source={
        contact.image
          ? { uri: `data:image/png;base64,${contact.image}` }
          : require("../assets/images/react-logo.png")
      }
      style={styles.profilePic} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactMessage}>{contact.message}</Text>
      </View>
      {contact.isOnline && <View style={styles.onlineIndicator} />}
    </View>
  </TouchableOpacity>
);

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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
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
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  },
});

