import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import theme from '../constants/theme';

export default function ItemListingPage() {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      if (photos.length < 5) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    }
  };

  return (
    <LinearGradient
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SELL ITEM</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>

        <TextInput
          style={styles.input}
          placeholder="Type:"
          placeholderTextColor="#999"
          value={type}
          onChangeText={setType}
        />

        <TextInput
          style={styles.input}
          placeholder="Item Name:"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Price:"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Contact:"
          placeholderTextColor="#999"
          value={contact}
          onChangeText={setContact}
        />

        <Text style={styles.label}>Photos</Text>
        <View style={styles.photoContainer}>
        {photos.map((uri, index) => (
            <TouchableOpacity key={index} onPress={() => { setSelectedImage(uri); setModalVisible(true); }}>
            <Image source={{ uri }} style={styles.photo} />
            </TouchableOpacity>
        ))}
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadText}>Upload Photo</Text>
        </TouchableOpacity>

      </ScrollView>

        <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        >
        <View style={styles.modalContainer}>
            <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
            >
            <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
            )}
        </View>
        </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
  },
  backButton: {
    position: 'absolute',
    right: 0,
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
  input: {
    backgroundColor: '#F5F5F5',
    color: '#08A045',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  label: {
    color: '#DDB771',
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'NovaSquare-Regular',
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  uploadButton: {
    backgroundColor: '#DDB771',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    color: '#073B3A',
    fontSize: 16,
    fontFamily: 'NovaSquare-Regular',
  },
  modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
