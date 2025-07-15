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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

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
              <Text style={styles.logo}>tagpuan</Text>
              <Text style={styles.tagline}>
                for a better farming ecosystem{"\n"}in the Philippines{"\n"}
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
    padding: 20,
  },
  logo: {
    fontSize: 71,
    fontFamily: theme.fonts.regular,
    color: "#DDB771",
    letterSpacing: 3,
    opacity: 0.7,
  },
  tagline: {
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 25,
    marginVertical: 10,
    width: "90%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: "#6BBF59",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: theme.colors.text,
    marginLeft: 5,
  },
  footer: {
    flex: 0.4,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "80%",
    marginBottom: 30,
  },
  loginButton: {
    fontFamily: theme.fonts.regular,
    backgroundColor: "rgba(221, 183, 113, 0.7)",
    borderRadius: 45,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginBottom: 10,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  signupText: {
    color: theme.colors.text,
    marginTop: 60,
  },
  signupLink: {
    color: "#FFFFFF",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});
