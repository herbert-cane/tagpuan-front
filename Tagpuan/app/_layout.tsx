import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';

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
    <Stack screenOptions={{ headerShown: false }} />
  );
}

