import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../constants/theme';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';

const recentExports = [
  { id: '1', description: 'Contracted a deal with Juan Dela Cruz', date: '6 days ago' },
  { id: '2', description: 'Bought Sardines from Gina Villamoso', date: '11 days ago' },
  { id: '3', description: 'Rina Espiritu canceled the order of Onions', date: '19 days ago' },
  { id: '4', description: 'Contracted a deal with Sandra Xu Yen', date: '1 month ago' },
];

export default function Homepage() {
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

  const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("User successfully logged out");
    router.push('/'); // or push('/login') depending on flow
  } catch (error) {
    console.error("Logout failed:", error);
    Alert.alert("Logout Error", "Something went wrong during logout.");
  }
};

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profilepage')}>
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
        {userData?.role.trim().toLowerCase() === "contractor" ? (
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/swipepage')}>
            <FontAwesome name="search" size={28} color="#FFFFFF" />
            <Text style={styles.navText}>FINDER</Text>
          </TouchableOpacity>
        ) : userData?.role.trim().toLowerCase() === "farmer" ? (
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/questpage')}>
            <FontAwesome name="gavel" size={28} color="#FFFFFF" />
            <Text style={styles.navText}>BID</Text>
          </TouchableOpacity>
        ) : userData?.role.trim().toLowerCase() === "admin" ? (
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/verificationpage')}>
            <FontAwesome name="certificate" size={28} color="#FFFFFF" />
            <Text style={styles.navText}>VERIFY</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
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
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/farmermarketpage')}>
              <FontAwesome name="shopping-basket" size={28} color="#FFFFFF" />
              <Text style={styles.navText}>MARKET</Text>
            </TouchableOpacity>

            {userData?.role.trim().toLowerCase() === "farmer" ? (
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/requestpage')}>
                <FontAwesome name="file" size={28} color="#FFFFFF" />
                <Text style={styles.navText}>REQUEST</Text>
              </TouchableOpacity>
            ) : userData?.role.trim().toLowerCase() === "contractor" ? (
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/biddingdashboard')}>
                <FontAwesome name="file" size={28} color="#FFFFFF" />
                <Text style={styles.navText}>CONTRACTS</Text>
              </TouchableOpacity>
            ) : null}
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
          <TouchableOpacity onPress={() => console.log('All clicked')} style={styles.allButton}>
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
    borderColor: '#4F9D69', // Light green for subtle separation
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
