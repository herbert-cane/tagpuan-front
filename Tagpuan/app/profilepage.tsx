import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import theme from "../constants/theme";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ProfilePage = () => {
  const [showMore, setShowMore] = useState(false);

  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
      const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.warn('No user document found for UID:', currentUser.uid);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        console.log('User data fetched:', userData);
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

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
            source={{ uri: userData?.profile_picture }}
            style={styles.profileImage}
          />
        <View>
          <Text style={styles.name}>{userData?.first_name} {userData?.last_name}</Text>
          <View style={styles.verifiedRow}>
            <Image
              source={
                userData?.isVerified
                  ? require("../assets/images/verified.png")
                  : require("../assets/images/error.png")
              }
              style={styles.verifiedIcon}
            />
            <Text style={styles.verifiedText}> {userData?.isVerified ?      "Verified" : "Not Verified"
            }</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView style={styles.detailsScroll} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.detailsTitle}>User Details</Text>

        <View style={styles.detailBox}>
          <Text style={styles.details}>First Name: {userData?.first_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Middle Name: {userData?.middle_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Last Name: {userData?.last_name}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Email: {userData?.email}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.details}>Role: {userData?.role}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});

export default ProfilePage;
