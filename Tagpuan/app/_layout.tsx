import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import theme from '../app/theme';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Moderna-Regular': require('../assets/fonts/Moderna-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
  
    loadFonts();
  }, []);  

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={[
        theme.colors.gradientStart, 
        theme.colors.gradientMiddle1,
        theme.colors.gradientMiddle2,
        theme.colors.gradientEnd
      ]}
      style={{ flex: 1 }}
    >
      <Stack />
    </LinearGradient>
  );
}
