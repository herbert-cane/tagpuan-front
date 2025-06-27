import { useState, useRef } from 'react';
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

interface Message {
  id: string;
  text: string;
  isSender: boolean;
}

export default function MessagePage() {
  const { name } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi there!', isSender: false },
    { id: '2', text: 'Hello!', isSender: true },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isSender: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled) {
        console.log('File selected:', result.assets[0]);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

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
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MESSAGE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/messagelistpage')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require("../assets/images/react-logo.png")}
          style={styles.profilePic}
        />
        <Text style={styles.profileName}>{name}</Text>
      </View>

      {/* Message Section */}
      <View style={styles.messageSection}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.isSender ? styles.sentMessage : styles.receivedMessage]}>
              {!item.isSender && (
                <Image
                  source={require("../assets/images/react-logo.png")}
                  style={styles.messageProfilePic}
                />
              )}
              <View style={[styles.messageBubble, item.isSender ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              {item.isSender && (
                <Image
                  source={require("../assets/images/react-logo.png")}
                  style={styles.messageProfilePic}
                />
              )}
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

        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
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
  profileSection: { alignItems: 'center', marginBottom: 20 },
  profilePic: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  profileName: { color: '#DDB771', fontSize: 22, fontWeight: 'bold' },
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
