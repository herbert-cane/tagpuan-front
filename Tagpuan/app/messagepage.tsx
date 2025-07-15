import { useState, useRef, useEffect } from 'react';
import {
  FlatList, Text, View, Image, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import theme from '../constants/theme';
import { Buffer } from 'buffer';
import { auth, db } from '@/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";

interface Message {
  id: string;
  text: string;
  isSender: boolean;
}

export default function MessagePage() {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const { name, image, conversationId, otherId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<any>>(null);

  const trimmedName = typeof name === 'string' ? name.trim() : '';

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }
      const uid = userId || auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
        } else {
          console.warn("No user document found for UID:", uid);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const decodedImage = typeof image === 'string'
    ? Buffer.from(image, 'base64').toString('utf-8')
    : '';

  useEffect(() => {
    if (!conversationId || !auth.currentUser?.uid) return;

    const conversationRef = doc(db, "conversations", conversationId as string);

    const unsubscribe = onSnapshot(conversationRef, async (docSnap) => {
      const data = docSnap.data();
      if (!data || !Array.isArray(data.messages)) return;

      const sortedMessages = data.messages
        .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0))
        .map((msg: any, idx: number) => ({
          id: msg.timestamp?.seconds?.toString() || idx.toString(),
          text: msg.content,
          isSender: msg.sender_id === auth.currentUser?.uid,
        }));

      setMessages(sortedMessages);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // Mark hasUnread as false for this user
      await updateDoc(conversationRef, {
        [`hasUnread.${auth.currentUser?.uid}`]: false,
      });
    });

    return () => unsubscribe();
  }, [conversationId]);


  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled) {
        console.log('File selected:', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Failed to pick document. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${FIREBASE_API}/conversation/send/${conversationId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      const newMessage: Message = {
        id: result.id || Date.now().toString(),
        text: inputMessage,
        isSender: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputMessage('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MESSAGE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileSection}
        activeOpacity={0.7}
        onPress={() => {
        router.push({
          pathname: '/profilepage',
          params: { userId: otherId },
          });
        }}
      >
        <Image
          source={decodedImage ? { uri: decodedImage } : require("../assets/images/react-logo.png")}
          style={styles.profilePic}
        />
        <Text style={styles.profileName}>{trimmedName}</Text>
      </TouchableOpacity>

      {/* Message Section */}
      <View style={styles.messageSection}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            `${item.timestamp?.toString?.() ?? 'no-time'}_${index}`
          }
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.isSender ? styles.sentMessage : styles.receivedMessage]}>
              {!item.isSender && (
                <Image
                  source={decodedImage
                      ? { uri: decodedImage }
                      : require("../assets/images/react-logo.png")
                  }
                  style={styles.messageProfilePic}
                />               
              )}
              <View style={[styles.messageBubble, item.isSender ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
        style={styles.inputContainer}
      >
        <TouchableOpacity onPress={handleAttachment}>
          <FontAwesome name="paperclip" size={24} color="#DDB771" style={styles.icon} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#A7E0A3"
          value={inputMessage}
          onChangeText={setInputMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  title: { marginTop: 8, letterSpacing: 1, color: '#DDB771', fontSize: 20, fontFamily: theme.fonts.regular },
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
  backText: { color: '#DDB771', fontSize: 24, fontWeight: 'bold' },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileName: {
    color: '#DDB771',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  messageSection: {
    flex: 1,
    paddingBottom: 60,
    marginTop: 24,
  },
  messageContainer: { flexDirection: 'row', marginBottom: 12 },
  messageBubble: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, maxWidth: '80%' },
  messageText: { fontSize: 14 },
  receivedMessage: { alignSelf: 'flex-start' },
  sentMessage: { alignSelf: 'flex-end' },
  receivedBubble: { backgroundColor: '#FFFFFF' },
  sentBubble: { backgroundColor: '#A7E0A3' },
  messageProfilePic: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0B6E4F',
    borderRadius: 24,
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#0B6E4F',
  },
  sendButton: { backgroundColor: '#6BBF59', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  sendButtonText: { color: '#073B3A', fontSize: 14, fontWeight: 'bold' },
  icon: { marginRight: 12, marginLeft: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});
