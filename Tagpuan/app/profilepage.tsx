import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import theme from "../constants/theme";

const dummyUser = {
  profile_picture: "", // leave blank to use default image
  first_name: "Juan",
  middle_name: "Dela",
  last_name: "Cruz",
  email: "juan@example.com",
  role: "Farmer",
  verification: {
    status: "Approved", // Change to "Rejected" or "Pending" to test icons
  },
};

const ProfilePage = () => {
  const userData = dummyUser;

  return (
    <LinearGradient
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/homepage")}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={
            userData.profile_picture
              ? { uri: `data:image/png;base64,${userData.profile_picture}` }
              : require("../assets/images/react-logo.png")
          }
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
          <View style={styles.verifiedRow}>
            <Image
              source={
                userData.verification.status === "Approved"
                  ? require("../assets/images/verified.png")
                  : require("../assets/images/error.png")
              }
              style={styles.verifiedIcon}
            />
            <Text style={styles.verifiedText}> {userData.verification.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.detailsScroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.detailsTitle}>User Details</Text>

        <View style={styles.detailBox}>
          <Text style={styles.details}>First Name: {userData.first_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Middle Name: {userData.middle_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Last Name: {userData.last_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Email: {userData.email}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Role: {userData.role}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    marginTop: 8,
    letterSpacing: 1,
    color: "#DDB771",
    fontFamily: theme.fonts.regular,
    fontSize: 20,
  },
  backButton: {
    position: "absolute",
    right: 20,
    top: 0,
    borderWidth: 2,
    borderColor: "#DDB771",
    borderRadius: 4,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#DDB771",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontFamily: "NovaSquare-Regular",
    color: "#DDB771",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  verifiedIcon: {
    width: 16,
    height: 16,
  },
  verifiedText: {
    color: "#DDB771",
    fontSize: 14,
    fontFamily: "NovaSquare-Regular",
  },
  divider: {
    width: "96%",
    height: 1,
    backgroundColor: "#DDB771",
    alignSelf: "center",
    marginVertical: 12,
  },
  detailsScroll: {
    paddingHorizontal: 20,
  },
  detailsTitle: {
    color: "#DDB771",
    fontSize: 18,
    fontFamily: "NovaSquare-Regular",
    marginTop: 16,
    marginBottom: 20,
  },
  detailBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  details: {
    fontSize: 14,
    color: "#08A045",
    fontFamily: "NovaSquare-Regular",
  },
});

export default ProfilePage;
