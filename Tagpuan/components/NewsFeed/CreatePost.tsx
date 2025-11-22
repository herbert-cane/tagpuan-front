import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { User } from './NewsFeedtypes';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface CreatePostProps {
  currentUser: User;
  onCreatePost: (content: string, image?: string) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onCreatePost }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Pick Image from Gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: 1, // ✅ Explicitly limit to 1
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 2. Helper: Upload to Firebase Storage
  const uploadImageToFirebase = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const filename = `posts/${currentUser.id}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", "Failed to upload image.");
      return null;
    }
  };

  // 3. Handle Post Creation
  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to post');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = image;

    if (image && !image.startsWith('http')) {
      const uploadedUrl = await uploadImageToFirebase(image);
      if (!uploadedUrl) {
        setIsUploading(false);
        return; 
      }
      finalImageUrl = uploadedUrl;
    }

    onCreatePost(content, finalImageUrl || undefined);
    
    setContent('');
    setImage('');
    setIsUploading(false);
    setShowModal(false);
  };

  const presetImages = [
    'https://images.unsplash.com/photo-1592981415071-8cdf75180613?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=300&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&h=300&fit=crop',
  ];

  return (
    <>
      {/* Create Post Trigger */}
      <TouchableOpacity 
        style={styles.createPostTrigger}
        onPress={() => setShowModal(true)}
      >
        <Image source={{ uri: currentUser.avatar }} style={styles.triggerAvatar} />
        <Text style={styles.triggerText}>What's on your mind?</Text>
        <FontAwesome name="edit" size={20} color="#666" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <FontAwesome name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Image source={{ uri: currentUser.avatar }} style={styles.userAvatar} />
            <View>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userRole}>{currentUser.role}</Text>
            </View>
          </View>

          {/* Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            numberOfLines={6}
          />

          {/* Image Preview */}
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImage('')}
              >
                <FontAwesome name="times" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Add Image Section - ✅ HIDDEN IF IMAGE EXISTS */}
          {!image && (
            <View style={styles.addImageSection}>
              <Text style={styles.sectionTitle}>Add to your post</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imageOptions}>
                  <TouchableOpacity 
                    style={styles.imageOption}
                    onPress={pickImage}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#e7f3ff' }]}>
                      <Ionicons name="images" size={24} color="#1877f2" />
                    </View>
                    <Text style={styles.imageOptionText}>Gallery</Text>
                  </TouchableOpacity>

                  {/* Presets */}
                  {presetImages.map((img, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.imageOption}
                      onPress={() => setImage(img)}
                    >
                      <Image source={{ uri: img }} style={styles.presetImage} />
                      <Text style={styles.imageOptionText}>Preset {index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Post Button */}
          <TouchableOpacity 
            style={[
              styles.postButton,
              (!content.trim() || isUploading) && styles.postButtonDisabled
            ]}
            onPress={handleCreatePost}
            disabled={!content.trim() || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  createPostTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  triggerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  triggerText: {
    flex: 1,
    marginLeft: 10,
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20, 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
  },
  contentInput: {
    padding: 20,
    fontSize: 16,
    lineHeight: 20,
    color: '#333',
    minHeight: 100,
  },
  imagePreviewContainer: {
    position: 'relative',
    margin: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imageOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageOption: {
    alignItems: 'center',
    marginRight: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  presetImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageOptionText: {
    fontSize: 12,
    color: '#666',
  },
  postButton: {
    backgroundColor: '#1877f2',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});