import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to the App</Text>
      <Button title="Go to Login" onPress={() => router.push("/login")} />
      <Button title="Go to Marketplace" onPress={() => router.push("/buyermarketpage")} />
      <Button title="Go to Virtual Currency" onPress={() => router.push("/virtualcurrencypage")} />
      <Button title="Go to Home Page" onPress={() => router.push("/homepage")} />
      <Button title="Go to Farmers Market" onPress={() => router.push("/farmermarketpage")} />
      <Button title="Go to Quest Page" onPress={() => router.push("/questpage")} />
      <Button title="Go to Request Page" onPress={() => router.push("/requestpage")} />
      <Button title="Go to Swipe Page" onPress={() => router.push("/swipepage")} />
      <Button title="Go to Signup Page" onPress={() => router.push("/signuppage")} />
      <Button title="Go to Message Page" onPress={() => router.push("/messagepage")} />
    </View>
  );
}
