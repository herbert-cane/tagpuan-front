import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function Homepage() {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
    <View style={styles.header}>
        <Image
            source={require('../assets/images/react-logo.png')}
            style={styles.profilePic}
        />
        <View style={styles.titleContainer}>
            <Text style={styles.title}>HOMEPAGE</Text>
        </View>
    </View>


      {/* Main Image */}
      <Image
        source={require('../assets/images/main-image.png')} // Add your main image here
        style={styles.mainImage}
        resizeMode="cover"
      />

      <StatusBar style="auto" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure elements are positioned correctly
    marginBottom: 20,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  titleContainer: {
    position: 'absolute', // Centering the title
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 18,
    fontWeight: 'bold',
  },  
  mainImage: {
    width: '100%',
    height: 150, // Adjust height as needed
    borderWidth: 4,
    borderColor: '#DDB771',
  },
});
