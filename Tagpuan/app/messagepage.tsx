import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';

export default function MessagePage() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello!', isSender: false },
    { id: '2', text: 'Hi! How are you?', isSender: true },
    { id: '3', text: 'I’m good. Just finished harvesting the crops.', isSender: false },
    { id: '4', text: 'That’s great to hear!', isSender: true },
    { id: '5', text: 'I have some questions about the crop rotation.', isSender: false },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const flatListRef = useRef(null);

  // ✅ Handle Sending Messages
  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isSender: true,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage('');
  };

  // ✅ Handle File Attachment
  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type !== 'cancel') {
        console.log('File selected:', result);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MESSAGE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={require('../assets/images/react-logo.png')} style={styles.profilePic} />
        <Text style={styles.profileName}>Name</Text>
        <Text style={styles.profileInfo}>
          Insert Farmer Information here such as their Bio,{"\n"}
          Crops and Location
        </Text>
      </View>

      {/* ✅ Message Section */}
      <View style={styles.messageSection}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.isSender ? styles.sentMessage : styles.receivedMessage]}>
              {!item.isSender && (
                <Image
                  source={require('../assets/images/react-logo.png')}
                  style={styles.messageProfilePic}
                />
              )}
              <View style={[styles.messageBubble, item.isSender ? styles.sentBubble : styles.receivedBubble]}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
              {item.isSender && (
                <Image
                  source={require('../assets/images/main-image.png')}
                  style={styles.messageProfilePic}
                />
              )}
            </View>
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* ✅ Input Section */}
      <View style={styles.inputContainer}>
        {/* Attachment Button */}
        <TouchableOpacity onPress={handleAttachment}>
          <FontAwesome name="paperclip" size={24} color="#DDB771" style={styles.icon} />
        </TouchableOpacity>

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#A7E0A3"
          value={inputMessage}
          onChangeText={setInputMessage}
        />

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

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
  title: { marginTop: 8, letterSpacing: 1, color: '#DDB771', fontSize: 20 },
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
  profileInfo: { color: '#FFFFFF', fontSize: 14, textAlign: 'center' },
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
    outlineWidth: 0,
  },
  sendButton: { backgroundColor: '#6BBF59', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  sendButtonText: { color: '#073B3A', fontSize: 14, fontWeight: 'bold' },
  icon: { marginRight: 12, marginLeft: 8 },
});
