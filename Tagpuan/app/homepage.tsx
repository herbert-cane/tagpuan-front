import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../constants/theme';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from "firebase/auth";

const recentExports = [
  { id: '1', description: 'Contracted a deal with Juan Dela Cruz', date: '6 days ago' },
  { id: '2', description: 'Bought Sardines from Gina Villamoso', date: '11 days ago' },
  { id: '3', description: 'Rina Espiritu canceled the order of Onions', date: '19 days ago' },
  { id: '4', description: 'Contracted a deal with Sandra Xu Yen', date: '1 month ago' },
];

export default function Homepage() {

  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL
  const [showMore, setShowMore] = useState(false);

  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();

          const response = await fetch(`${FIREBASE_API}/user/getDetails`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Failed to fetch user details');

          const userData = await response.json();
          setUserData(userData);
          setLoadingUser(false);

        } catch (err) {
          console.error("Error fetching user data:", err);
          setTimeout(() => setLoadingUser(false), 500);
        }
      } else {
        console.warn("No auth user");
        router.replace("/");
        setTimeout(() => setLoadingUser(false), 500);
      }
    });

    return () => unsubscribe(); // unsubscribe from onAuthStateChanged
  }, []);



  const handleLogout = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingUser(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      }, { merge: true });

      await signOut(auth);
      setUserData(null);
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Error", "Something went wrong during logout.");
    }
  };

  useEffect(() => {
    const setOnline = async () => {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          isOnline: true,
          lastSeen: new Date().toISOString(),
        }, { merge: true });
      }
    };

    setOnline();
  }, []);

  if (loadingUser || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/profilepage', params: { tab: 'posts' } })}>
          <Image
            source={{ uri: userData?.profile_picture }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>HOMEPAGE</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => { 
              handleLogout();}}>
            <Text style={styles.backText}>{"Logout"}</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Main Image */}
      <Image
        source={require('../assets/images/main-image.png')}
        style={styles.mainImage}
        resizeMode="cover"
      />

      {/* Navigation Icons */}
      <View style={styles.navContainer}>
      {(() => {
        const role = (userData?.role || "").trim().toLowerCase();

        switch (role) {
          case "contractor":
            return (
              <>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/swipepage')}>
                  <FontAwesome name="search" size={28} color="#FFFFFF" />
                  <Text style={styles.navText}>FINDER</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/requestpage')}>
                  <FontAwesome name="file-text" size={28} color="#FFFFFF" />
                  <Text style={styles.navText}>REQUEST</Text>
                </TouchableOpacity>
              </>
            );

          case "farmer":
            return (
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/questpage')}>
                <FontAwesome name="gavel" size={28} color="#FFFFFF" />
                <Text style={styles.navText}>BID</Text>
              </TouchableOpacity>
            );

          case "admin":
            return (
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/verificationpage')}>
                <FontAwesome name="certificate" size={28} color="#FFFFFF" />
                <Text style={styles.navText}>VERIFY</Text>
              </TouchableOpacity>
            );

          case "vendor":
            return (
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/itemselling')}>
                <FontAwesome name="shopping-cart" size={28} color="#FFFFFF" />
                <Text style={styles.navText}>SELL</Text>
              </TouchableOpacity>
            );

          default:
            return null;
        }
      })()}

      {/* <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}> */}
      <TouchableOpacity style={styles.navItem} onPress={() => alert('This feature is coming soon!')}>
        <FontAwesome name="dashboard" size={28} color="#FFFFFF" />
        <Text style={styles.navText}>DASHBOARD</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/messagelistpage')}>
        <FontAwesome name="comments" size={28} color="#FFFFFF" />
        <Text style={styles.navText}>MESSAGE</Text>
      </TouchableOpacity>
    </View>

      {/* Hidden Buttons & See More Button Together */}
      <View>
        {showMore && (
          <View style={styles.hiddenButtonsContainer}>
            {/* <TouchableOpacity style={styles.navItem} onPress={() => router.push('/farmermarketpage')}> */}
            <TouchableOpacity style={styles.navItem} onPress={() => alert('This feature is coming soon!')}>
              <FontAwesome name="shopping-basket" size={28} color="#FFFFFF" />
              <Text style={styles.navText}>MARKET</Text>
            </TouchableOpacity>

            {(() => {
              const role = (userData?.role || "").trim().toLowerCase();

              if (role === "farmer" || role === "vendor") {
                return (
                  <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => router.push({ pathname: '/profilepage', params: { tab: 'details' } })}
                  >
                    <FontAwesome name="user" size={28} color="#FFFFFF" />
                    <Text style={styles.navText}>PROFILE</Text>
                  </TouchableOpacity>
                );
              }

              if (role === "contractor") {
                return (
                  <TouchableOpacity style={styles.navItem} onPress={() => router.push('/biddingdashboard')}>
                    <FontAwesome name="file" size={28} color="#FFFFFF" />
                    <Text style={styles.navText}>CONTRACTS</Text>
                  </TouchableOpacity>
                );
              }

              return null;
            })()}
          </View>
        )}

        <View style={styles.seeMoreContainer}>
          <View style={styles.line} />
          <TouchableOpacity onPress={() => setShowMore(!showMore)}>
            <Text style={styles.seeMoreText}>{showMore ? "SEE LESS" : "SEE MORE"}</Text>
          </TouchableOpacity>
          <View style={styles.line} />
        </View>
      </View>

      {/* Recent Exports Section */}
      <View style={styles.recentExportsContainer}>
        <View style={styles.recentExportsHeader}>
          <Text style={styles.recentExportsTitle}>Recent Exports</Text>
          <TouchableOpacity style={styles.allButton}>
            <Text style={styles.allButtonText}>All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentExports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.exportItem}>
              <Text style={styles.exportDescription}>{item.description}</Text>
              <Text style={styles.exportDate}>{item.date}</Text>
            </View>
          )}
        />
      </View>
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    right: 20,
    top: 0,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: "#DDB771",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  titleContainer: {
    position: 'absolute',
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
    height: 150,
    borderWidth: 4,
    borderColor: '#DDB771',
    marginBottom: 20,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    marginTop: 8,
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  seeMoreButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#DDB771',
  },
  seeMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  hiddenButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },  
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDB771',
    marginHorizontal: 10,
  },
  seeMoreText: {
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },  
  recentExportsContainer: {
    marginTop: 20,
  },
  recentExportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentExportsTitle: {
    fontSize: 20,
    color: '#DDB771',
    fontWeight: 'bold',
    fontFamily: 'NovaSquare-Regular',
  },
  allButton: {
    borderWidth: 1,
    borderColor: '#DDB771',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 28, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  allButtonText: {
    fontSize: 14,
    color: '#DDB771',
    fontWeight: 'bold',
  },  
  exportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#4F9D69', 
  },
  exportDescription: {
    color: '#FFFFFF',
    fontFamily: 'NovaSquare-Regular',
    fontSize: 14,
    width: '75%',
  },
  exportDate: {
    color: '#DDB771',
    fontFamily: 'NovaSquare-Regular',
    fontSize: 14,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#073B3A',
  }
});
