import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function App() {
  const handleTermsPress = () => {
    console.log('Terms clicked');
    // Add navigation or link to terms here
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Title Positioned at the Top */}
          <View style={styles.header}>
            <Text style={styles.title}>VIRTUAL CURRENCY</Text>
          </View>

          {/* Centered Content */}
          <View style={styles.contentContainer}>
            <Image
              source={require('../assets/images/tagpuan_agricoin.png')}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.number}>5000</Text>

            <Text style={styles.description}>
              Complete more transactions inside the app to accumulate more{' '}
              <Text style={styles.boldText}>AgriCoins</Text> that you can use to purchase or avail of various services for both the Farmer’s and Contractor’s Market!
            </Text>
          </View>
        </View>

        {/* Small Line of Text + Terms Button */}
        <View style={styles.footer}>
          <Text style={styles.smallText}>
            AgriCoin accounts and services provided by Tagpuan.{' '}
            <TouchableOpacity onPress={handleTermsPress}>
              <Text style={styles.termsButton}>See Terms.</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50
  },
  scrollContainer: {
    flexGrow: 1, // Makes sure ScrollView is expandable when content overflows
  },
  mainContent: {
    flex: 1, // Ensures main content fills the screen vertically without stretching
    justifyContent: 'flex-start', // Aligns everything at the top naturally
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    alignItems: 'center',
    gap: 48, // Keeps consistent spacing between elements
  },
  image: {
    width: 120,
    height: 120,
  },
  number: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.novaSquare,
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.regular,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40, // Adds space above the footer
    marginBottom: 20, // Keeps the footer at the bottom even when the content is small
    alignItems: 'center',
  },
  smallText: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    textAlign: 'center',
  },
  termsButton: {
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
