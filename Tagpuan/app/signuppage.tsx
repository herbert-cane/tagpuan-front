import React, { useState } from "react";
import {
  View, Text, TextInput, Image,
  StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

const Register = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [frontID, setFrontID] = useState<string | null>(null);
  const [backID, setBackID] = useState<string | null>(null);

  // Handle role selection
  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
  };

  // Handle image selection for ID Uploads
  const handleFileSelection = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });

      if (result.canceled) return;
      
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          
          {/* ✅ Back Button - Styled like Quests Page */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            {/* Title */}
            <Text style={styles.title}>Sign Up</Text>

            {/* Account Type Selection */}
            <Text style={styles.subtitle}>Select Account Type</Text>
            <View style={styles.roleContainer}>
              {["Farmer", "Contractor", "Seller"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleButton, selectedRole === role && styles.selectedRoleButton]}
                  onPress={() => handleRoleSelection(role)}
                >
                  <Text style={[styles.roleText, selectedRole === role && styles.selectedRoleText]}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Inputs */}
            <TextInput placeholder="Username" style={styles.input} placeholderTextColor="#fff" />
            <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" placeholderTextColor="#fff" />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#fff" />
            <TextInput placeholder="First Name" style={styles.input} placeholderTextColor="#fff" />
            <TextInput placeholder="Middle Name" style={styles.input} placeholderTextColor="#fff" />
            <TextInput placeholder="Last Name" style={styles.input} placeholderTextColor="#fff" />

            {/* Upload ID Section */}
            <Text style={styles.uploadLabel}>Front ID Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileSelection(setFrontID)}>
              <Text style={styles.uploadButtonText}>Upload Front ID</Text>
            </TouchableOpacity>
            {frontID && <Image source={{ uri: frontID }} style={styles.image} />}

            <Text style={styles.uploadLabel}>Back ID Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileSelection(setBackID)}>
              <Text style={styles.uploadButtonText}>Upload Back ID</Text>
            </TouchableOpacity>
            {backID && <Image source={{ uri: backID }} style={styles.image} />}

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.registerButtonWrapper}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flexGrow: 1, paddingBottom: 50 },

  backButton: {
    position: "absolute",
    top: 22,
    right: 22,
    width: 35,
    borderWidth: 2,
    borderColor: "#DDB771",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
  },
  backText: { color: "#DDB771", fontSize: 24, fontWeight: "bold" },

  formContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 20,
    borderRadius: 15,
  },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", color: "#DDB771", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: "center", color: "#FFFFFF" },

  roleContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#DDB771",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "transparent",
  },
  selectedRoleButton: { backgroundColor: "#DDB771" },
  roleText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  selectedRoleText: { color: "#073B3A" },

  input: {
    height: 48,
    borderColor: "#DDB771",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
  },

  uploadLabel: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#fff" },
  uploadButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  buttonContainer: { marginTop: 20, alignItems: "center" },
  registerButtonWrapper: { width: "60%", backgroundColor: "#DDB771", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  registerButtonText: { color: "#000", fontSize: 18, fontWeight: "bold", textTransform: "uppercase" },

  image: { width: 110, height: 110, borderRadius: 10, marginVertical: 10, alignSelf: "center" },
});

export default Register;
