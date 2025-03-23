import React, { useState } from "react";
import {
  View, Text, TextInput, Image,
  StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const Register = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [frontID, setFrontID] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [backID, setBackID] = useState<{ uri: string; name: string; type: string } | null>(null);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // Save token to SecureStore
  const saveToken = async (token: string) => {
    await SecureStore.setItemAsync("userToken", token);
  };

  // Handle role selection
  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
  };

  // Handle image selection for ID Uploads
  const handleFileSelection = async (setImage: React.Dispatch<React.SetStateAction<{ uri: string; name: string; type: string } | null>>) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setImage({ uri: file.uri, name: file.name ?? "upload.jpg", type: file.mimeType ?? "image/jpeg" });
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  // Handle Registration Request
  const handleRegister = async () => {
    if (!username || !email || !password || !firstName || !selectedRole || !frontID || !backID) {
      Alert.alert("Missing Fields", "Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", selectedRole);
    formData.append("first_name", firstName);
    formData.append("middle_name", middleName);
    formData.append("last_name", lastName);

    // Append images as files
    formData.append("front_id", frontID as any);
    formData.append("back_id", backID as any);

    try {
      const response = await axios.post("https://tagpuan-back.onrender.com/user/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxBodyLength: 10 * 1024 * 1024, // Increase max request size limit to 10MB
      });

      Alert.alert("Success", "User registered successfully!", [
        { text: "OK", onPress: () => router.push("/login") }
      ]);
      saveToken(response.data.token); // Save token upon successful registration
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to register. Please try again.");
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
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
            <TextInput placeholder="Username" style={styles.input} placeholderTextColor="#fff" value={username} onChangeText={setUsername} />
            <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" placeholderTextColor="#fff" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#fff" value={password} onChangeText={setPassword} />
            <TextInput placeholder="First Name" style={styles.input} placeholderTextColor="#fff" value={firstName} onChangeText={setFirstName} />
            <TextInput placeholder="Middle Name" style={styles.input} placeholderTextColor="#fff" value={middleName} onChangeText={setMiddleName} />
            <TextInput placeholder="Last Name" style={styles.input} placeholderTextColor="#fff" value={lastName} onChangeText={setLastName} />
            {/* Upload ID Section */}
            <Text style={styles.uploadLabel}>Front ID Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileSelection(setFrontID)}>
              <Text style={styles.uploadButtonText}>Upload Front ID</Text>
            </TouchableOpacity>
            {frontID && <Image source={{ uri: frontID.uri }} style={styles.image} />}

            <Text style={styles.uploadLabel}>Back ID Image</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => handleFileSelection(setBackID)}>
              <Text style={styles.uploadButtonText}>Upload Back ID</Text>
            </TouchableOpacity>
            {backID && <Image source={{ uri: backID.uri }} style={styles.image} />}

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.registerButtonWrapper} onPress={handleRegister}>
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
