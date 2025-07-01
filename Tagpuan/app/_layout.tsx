import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Slot, Stack } from "expo-router";
import { AuthProvider } from "../app/authcontext";

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Moderna-Regular": require("../assets/fonts/Moderna-Regular.ttf"),
          "NovaSquare-Regular": require("../assets/fonts/NovaSquare-Regular.ttf"),
        });
        console.log("Fonts loaded successfully.");
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts", error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return null;

  return (
      <Slot />
  );
}
