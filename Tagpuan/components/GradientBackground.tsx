import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../constants/theme';

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      style={styles.container}
      colors={[
        theme.colors.gradientStart,
        theme.colors.gradientMiddle1,
        theme.colors.gradientMiddle2,
        theme.colors.gradientEnd
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
