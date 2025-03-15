import { StatusBar} from 'expo-status-bar';
import { StyleSheet, Text} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <LinearGradient
      style = { styles.container}
      colors = {["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start = {{x: 0.5, y: 0}}
      end = {{x: 0.5, y: 1}}
    > 
      <Text>Fudge this shit</Text>
      <StatusBar style='auto'/> 
    </LinearGradient>
  );
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});