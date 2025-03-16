import { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import theme from '../constants/theme';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <GradientBackground>
      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
              {/* Logo */}
              <Text style={styles.logo}>tagpuan</Text>
              <Text style={styles.tagline}>
                for a better farming ecosystem{"\n"}in the Philippines{"\n"}(side to side)
              </Text>
              
              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#DDB771" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#6BBF59" />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#DDB771" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6BBF59"
                  secureTextEntry={!showPassword}
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

              {/* Footer (Pushes Login Button Lower) */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.loginButton}>
                  <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
                
                {/* Sign Up */}
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity>
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
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 71,
    fontFamily: theme.fonts.regular,
    color: '#DDB771',
    letterSpacing: 3,
    opacity: 0.7,
  },
  tagline: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 25,
    marginVertical: 10,
    width: '90%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: '#6BBF59',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: theme.colors.text,
    marginLeft: 5,
  },
  footer: {
    flex: 0.40, // Pushes the login button to the bottom
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '80%',
    marginBottom: 30,
  },
  loginButton: {
    fontFamily: theme.fonts.regular,
    backgroundColor: 'rgba(221, 183, 113, 0.7)', // DDB771 with 70% opacity
    borderRadius: 45,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginBottom: 10,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  signupText: {
    color: theme.colors.text,
    marginTop: 60,
  },
  signupLink: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});
