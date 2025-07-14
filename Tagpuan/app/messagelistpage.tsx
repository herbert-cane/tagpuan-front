import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import { auth } from '@/firebaseConfig';
import { Buffer } from 'buffer';

interface Contact {
  id: string;
  name: string;
  message: string;
  image: string;
  isOnline: boolean;
}

export default function MessageListPage() {

  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Fetch contacts from API or database
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchContacts = async () => {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const token = await user.getIdToken();

      try {
        const response = await fetch(`${FIREBASE_API}/conversation/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const conversations = await response.json();

        // For each conversation, get the other participant's details
        const contactPromises = conversations.map(async (conv: any) => {
          const otherId = conv.participants.find((pid: string) => pid !== user.uid);
          // Fetch user details for other participant
          const userRes = await fetch(`${FIREBASE_API}/user/${otherId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!userRes.ok) throw new Error("Failed to fetch user details");
          const otherUser = await userRes.json();

          return {
            id: conv.id,
            name: otherUser.first_name + " " + otherUser.last_name || "Unknown",
            message: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].content : "No messages yet",
            image: otherUser.profile_picture || "",
            isOnline: otherUser.isOnline,
          } as Contact;
        });

        const contactsData = await Promise.all(contactPromises);
        setContacts(contactsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchContacts();
    intervalId = setInterval(fetchContacts, 500);
  }, []);
  // 
  const [loading] = useState<boolean>(false); // no more fetching

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
      <View style={styles.header}>
        <Text style={styles.title}>MESSAGES</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Contacts</Text>
      <View>
        {contacts.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>
        No contacts found.
          </Text>
        ) : (
          <>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <TopContactCard contact={item} />}
        />

        <FlatList
          data={contacts}
          style={styles.messageList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactCard contact={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
          </>
        )}
      </View>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const TopContactCard = ({ contact }: { contact: Contact }) => (
  <View style={styles.topContactCard}>
    <Image
      source={
          contact.image
            ? { uri: contact.image }
            : require("../assets/images/react-logo.png")
      }
      style={styles.topProfilePic}
    />
    {contact.isOnline && <View style={styles.onlineIndicator} />}
    <Text style={styles.topContactName} numberOfLines={1}>
      {contact.name}
    </Text>
  </View>
);

const ContactCard = ({ contact }: { contact: Contact }) => {
  const base64Image = Buffer.from(contact.image).toString("base64");

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/messagepage?conversationId=${contact.id}&name=
            ${contact.name}&image=${base64Image}`
        )
      }
    >
      <View style={styles.contactCard}>
        <Image
          source={
            contact.image
              ? { uri: contact.image }
              : require("../assets/images/react-logo.png")
          }
          style={styles.profilePic}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactMessage}>{contact.message}</Text>
        </View>
        {contact.isOnline && <View style={styles.onlineIndicator} />}
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    // flexDirection: 'column',
  },
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
    marginBottom: 24,
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
    marginBottom: 12,
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
  messageList: {
    // alignItems: 'flex-start', // ensures items align to the start (horizontally)
    // justifyContent: 'flex-start', // ensures they align to the top (vertically)
    // paddingBottom: 20,
    marginTop: 24,
  }
});

