import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function App() {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Title + Button Container */}
      <View style={styles.header}>
        {/* Title */}
        <Text style={styles.title}>
          VIRTUAL CURRENCY
        </Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 50,
    },
    header: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    title: {
      color: '#DDB771',
      fontFamily: theme.fonts.regular,
      fontSize: 24,
      fontWeight: 'bold',
    },
    backButton: {
      position: 'absolute',
      right: 20,
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
});