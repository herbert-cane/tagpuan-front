import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBackground";
import theme from "../constants/theme";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; 

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

const logoImageSource = require("../assets/images/Tagpuan_Login.png");
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert("Error", "Please enter both email and password.");
    return;
  }

  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, username, password);
    
    // The onAuthStateChanged listener in your Homepage will handle the redirect
    // No need for additional logic here
    
  } catch (error: any) {
    console.error("Login error:", error);
    let errorMessage = "Invalid email or password.";
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address.";
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email.";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    Alert.alert("Login Failed", errorMessage);
  } finally {
    setLoading(false);
  }

  setLoading(true);

  try {
    await signInWithEmailAndPassword(auth, username, password);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        Alert.alert("Welcome", `Logged in as ${username}`);
        router.replace("/homepage");
      }
    });

  } catch (error) {
    Alert.alert("Login Failed", "Invalid email or password.");
    setLoading(false);

  } finally {
    
  }
};


  return (
    <GradientBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              <Image
                source={logoImageSource}
                style={styles.mainLogoImage}
                resizeMode="contain" // Ensures the image doesn't look stretched
              />
  <Text style={styles.tagline}>
    for a better farming ecosystem{"\n"}in the Philippines
  </Text>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#DDB771" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6BBF59"
                  value={username}
                  onChangeText={setUsername}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#DDB771" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6BBF59"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#DDB771" />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => !loading && setIsChecked(!isChecked)}
                  disabled={loading}
                >
                  <Ionicons
                    name={isChecked ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color="#DDB771"
                  />
                  <Text style={styles.optionText}>Remember me</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity disabled={loading}>
                  <Text style={styles.optionText}>Forgot Password?</Text>
                </TouchableOpacity> */}
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => !loading && router.push("/signuppage")}
                  disabled={loading}
                >
                  <Text style={styles.signupLink}>SIGN UP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  mainLogoImage: {
    width: "85%", // Made slightly wider for better visibility
    height: undefined, // Allows aspect ratio to take over
    aspectRatio: 2, // Maintains the shape dynamically (Adjust this number if your logo is taller/shorter)
    marginBottom: 10,
    marginTop: 30,
  },
  tagline: {
    marginTop: 0,
    fontSize: 15,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 40,
    lineHeight: 22,
    opacity: 0.9,
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // Fully rounded pill shape
    paddingHorizontal: 20,
    marginVertical: 8,
    width: "100%",
    height: 55, // Taller inputs for modern feel
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#073B3A", // Dark green text for better contrast
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Align to left like standard forms
    width: "100%",
    marginBottom: 25,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#DDB771",
    borderRadius: 30,
    paddingVertical: 15, // Taller button
    width: "100%", // Full width button
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    // Button Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  signupText: {
    color: "#FFFFFF", // Changed to white for better visibility on gradient
    marginTop: 20,
    fontSize: 14,
    opacity: 0.9,
  },
  signupLink: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});