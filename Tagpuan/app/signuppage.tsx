import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, Image,
  StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { deleteObject, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth, db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

const Register = () => {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL
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
  const [commoditiesSelected, setCommoditiesSelected] = useState<string[]>([]);
  const [paymentSelected, setPaymentSelected] = useState<string[]>([]);
  const [deliverySelected, setModeOfDelivery] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<Array<{ id: string; [key: string]: any }>>([]);

  const paymentList = [
    { id: 'cod', name: 'Cash On Delivery' },
    { id: 'gcash', name: 'GCash (E-Wallet)' },
    { id: 'maya', name: 'Maya (E-Wallet)' },
    { id: 'bank', name: 'Bank Transfer' },
  ];

  const deliveryModes = [
    { id: 'pickup', name: 'Pickup' },
    { id: 'delivery', name: 'Delivery' },

  ];


  useEffect(() => {
    const commoditiesList = onSnapshot(
      collection(db, "commodities"),
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommodities(items);
        console.log('Commodities:', commodities);
      },
      (error) => {
        console.error("Error fetching commodities:", error);
      }
    );

    return () => commoditiesList();
  }, []);

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
  };

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

 const handleRegister = async () => {
  if (
    !username || !email || !password || !firstName || !lastName ||
    !selectedRole || !frontID || !backID
  ) {
    Alert.alert("Missing Fields", "Please fill out all required fields.");
    return;
  }

  if (selectedRole === "Farmer" &&
    (!commoditiesSelected || !paymentSelected || !deliverySelected)
  ) {
    Alert.alert("Incomplete Farmer Details", "Please provide all required farmer information.");
    return;
  }

  try {
    // Pre-fetch and convert images FIRST
    const frontRes = await fetch(frontID.uri);
    const frontIDBlob = await frontRes.blob();
    const backRes = await fetch(backID.uri);
    const backIDBlob = await backRes.blob();

    // Ready to commit — create user last
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const frontIDRef = ref(storage, `users/${user.uid}/frontID.jpg`);
    const backIDRef = ref(storage, `users/${user.uid}/backID.jpg`);

    await uploadBytes(frontIDRef, frontIDBlob);
    await uploadBytes(backIDRef, backIDBlob);

    const frontIDUrl = await getDownloadURL(frontIDRef);
    const backIDUrl = await getDownloadURL(backIDRef);

    await updateProfile(user, { displayName: username });

    const basePayload = {
      uid: user.uid,
      username,
      email,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      role: selectedRole,
      frontIDUrl,
      backIDUrl
    };

    const fullPayload = selectedRole === "Farmer"
      ? {
          ...basePayload,
          farmer_details: {
            commodity: commoditiesSelected,
            paymentTerms: paymentSelected,
            modeOfDelivery: deliverySelected
          }
        }
      : basePayload;


    const response = await fetch(`${FIREBASE_API}/user/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload)
    });

    const responseBody = await response.text();
    console.log("Backend response:", response.status, responseBody);

    if (!response.ok) {
      // 🔥 Clean up uploaded files if backend registration fails
      await deleteObject(frontIDRef).catch(() =>
        console.warn("Failed to delete front ID image")
      );
      await deleteObject(backIDRef).catch(() =>
        console.warn("Failed to delete back ID image")
      );
      throw new Error("Registration failed. Please try again.");
    }


    Alert.alert("Success", "Registration complete!", [
      { text: "OK", onPress: () => router.push("/") }
    ]);
  } catch (error: any) {
    console.error("Registration Error:", error);

    if (auth.currentUser) {
      // Clean up if Firebase Auth user was created
      try {
        await auth.currentUser.delete();
      } catch (cleanupErr) {
        console.warn("User cleanup failed:", cleanupErr);
      }
    }

    Alert.alert("Registration Error", error?.message || "Something went wrong.");
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

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>
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

            <TextInput placeholder="Username" style={styles.input} placeholderTextColor="#fff" value={username} onChangeText={setUsername} />
            <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" placeholderTextColor="#fff" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#fff" value={password} onChangeText={setPassword} />
            <TextInput placeholder="First Name" style={styles.input} placeholderTextColor="#fff" value={firstName} onChangeText={setFirstName} />
            <TextInput placeholder="Middle Name" style={styles.input} placeholderTextColor="#fff" value={middleName} onChangeText={setMiddleName} />
            <TextInput placeholder="Last Name" style={styles.input} placeholderTextColor="#fff" value={lastName} onChangeText={setLastName} />

            {selectedRole === "Farmer" && (
            <>
              <Text style={styles.subtitle}>Farmer Details</Text>

              <Text style={styles.subLabel}>Select Commodity</Text>
              {commodities.map((item) => {
                const isSelected = commoditiesSelected.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.selectedRoleButton
                    ]}
                    onPress={() => {
                      setCommoditiesSelected((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                      {isSelected ? '✔ ' : ''}{item.en_name} ({item.hil_name})
                    </Text>
                  </TouchableOpacity>
                );
              })}


              <Text style={styles.subLabel}>Payment Terms</Text>
              {paymentList.map((item) => {
                const isSelected = paymentSelected.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.selectedRoleButton
                    ]}
                    onPress={() => {
                      setPaymentSelected((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        isSelected && styles.selectedRoleText
                      ]}
                    >
                    <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                      {isSelected ? '✔ ' : ''}{item.name}
                    </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.subLabel}>Mode of Delivery</Text>
              {deliveryModes.map((item) => {
                const isSelected = deliverySelected.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.selectedRoleButton
                    ]}
                    onPress={() => {
                      setModeOfDelivery((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        isSelected && styles.selectedRoleText
                      ]}
                    >
                    <Text style={[styles.dropdownText, isSelected && styles.selectedRoleText]}>
                      {isSelected ? '✔ ' : ''}{item.name}
                    </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
  
            </>
          )}
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
  subLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DDB771",
  },
  selectedDropdownItem: {
    backgroundColor: "#DDB771",
    borderColor: "#fff",
    fontWeight: "bold"
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedValue: {
    color: "#DDB771",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 5,
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
