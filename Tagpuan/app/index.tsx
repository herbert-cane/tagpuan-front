import { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import GradientBackground from "../components/GradientBackground";
import theme from "../constants/theme";
import { AuthContext } from "./authcontext";

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
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const { login } = useContext(AuthContext) ?? {}; // Get login function from AuthContext
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    try {
      if (login) {
        await login(email, password); // Call login function from AuthContext       
      } else {
        console.error("AuthContext is not available.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Login Failed", "Invalid email or password.");
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
                  value={email}
                  onChangeText={setEmail}
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
                  onPress={() => setIsChecked(!isChecked)}
                >
                  <Ionicons
                    name={isChecked ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color="#DDB771"
                  />
                  <Text style={styles.optionText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.optionText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>

                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/signuppage')}>
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
});
