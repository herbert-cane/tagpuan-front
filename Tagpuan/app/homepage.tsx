import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import theme from '../constants/theme';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged, User } from "firebase/auth";
import CompactPriceChecker from './PriceChecker';
import { Newsfeed } from './NewsFeed';
import { User as NewsfeedUser } from '../components/NewsFeed/NewsFeedtypes';

// ✅ ADMOB IMPORTS
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// ✅ AD UNIT ID (Test ID for Dev, Real ID for Prod)
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-5509684377946762/3359482462';

interface RecentExport {
  id: string;
  description: string;
  date: string;
}

interface UserData {
  role?: string;
  profile_picture?: string;
  name?: string;
  [key: string]: any;
}

const recentExports: RecentExport[] = [
  { id: '1', description: 'Contracted a deal with Juan Dela Cruz', date: '6 days ago' },
  { id: '2', description: 'Bought Sardines from Gina Villamoso', date: '11 days ago' },
  { id: '3', description: 'Rina Espiritu canceled the order of Onions', date: '19 days ago' },
  { id: '4', description: 'Contracted a deal with Sandra Xu Yen', date: '1 month ago' },
];

export default function Homepage() {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL;
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showPriceChecker, setShowPriceChecker] = useState<boolean>(false);
  const [showNewsfeed, setShowNewsfeed] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          
          // ✅ FIX: Use correct endpoint /user/me
          const response = await fetch(`${FIREBASE_API}/user/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Failed to fetch user details');
          const userData: UserData = await response.json();
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

    return () => unsubscribe();
  }, []);

  const handleLogout = async (): Promise<void> => {
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
    const setOnline = async (): Promise<void> => {
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

  const getNewsfeedUser = (): NewsfeedUser => {
    return {
      id: auth.currentUser?.uid || 'current-user',
      name: userData?.name || 'User',
      avatar: userData?.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: userData?.role || 'Farmer'
    };
  };

  const renderRoleSpecificButtons = (): JSX.Element | null => {
    const role = (userData?.role || "").trim().toLowerCase();

    switch (role) {
      case "contractor":
        return (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/swipepage')}>
              <FontAwesome name="search" size={28} color="#FFFFFF" />
              <Text style={styles.navText}>FINDER</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/requestpage', params: { type: 'bidding' } })}>
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
  };

  const renderHiddenButtons = (): JSX.Element | null => {
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
  };

  if (loadingUser || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  if (showNewsfeed) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.newsfeedHeader}>
          <TouchableOpacity onPress={() => setShowNewsfeed(false)} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#DDB771" />
          </TouchableOpacity>
          <Text style={styles.newsfeedTitle}>Community Feed</Text>
          <View style={styles.placeholder} />
        </View>
        <Newsfeed currentUser={getNewsfeedUser()} />
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/profilepage', params: { tab: 'posts' } })}>
          <Image
            source={{ uri: userData?.profile_picture }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>HOMEPAGE</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
            <Text style={styles.backText}>{"Logout"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Image
        source={require('../assets/images/TagpuanCover3.jpg')}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.navContainer}>
        {renderRoleSpecificButtons()}

        <TouchableOpacity style={styles.navItem} onPress={() => setShowNewsfeed(true)}>
          <FontAwesome name="newspaper-o" size={28} color="#FFFFFF" />
          <Text style={styles.navText}>FEED</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setShowPriceChecker(true)}>
          <FontAwesome name="line-chart" size={28} color="#FFFFFF" />
          <Text style={styles.navText}>PRICES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/messagelistpage')}>
          <FontAwesome name="comments" size={28} color="#FFFFFF" />
          <Text style={styles.navText}>MESSAGE</Text>
        </TouchableOpacity>
      </View>

      <View>
        {showMore && (
          <View style={styles.hiddenButtonsContainer}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => Alert.alert("Notice", "Feature coming soon")}
            >
              <FontAwesome name="shopping-basket" size={28} color="#FFFFFF" />
              <Text style={styles.navText}>MARKET</Text>
            </TouchableOpacity>

            {renderHiddenButtons()}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => Alert.alert("Notice", "Feature coming soon")}
            >
              <FontAwesome name="dashboard" size={28} color="#FFFFFF" />
              <Text style={styles.navText}>DASHBOARD</Text>
            </TouchableOpacity>
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

      <View style={styles.recentExportsContainer}>
        <View style={styles.recentExportsHeader}>
          <Text style={styles.recentExportsTitle}>Recent Exports</Text>
          <TouchableOpacity style={styles.allButton}>
            <Text style={styles.allButtonText}>All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentExports}
          keyExtractor={(item: RecentExport) => item.id}
          renderItem={({ item }: { item: RecentExport }) => (
            <View style={styles.exportItem}>
              <Text style={styles.exportDescription}>{item.description}</Text>
              <Text style={styles.exportDate}>{item.date}</Text>
            </View>
          )}
        />
      </View>

      <CompactPriceChecker
        isVisible={showPriceChecker}
        onClose={() => setShowPriceChecker(false)}
      />

      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
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
  fullScreen: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  newsfeedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0B6E4F',
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#DDB771',
  },
  newsfeedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DDB771',
    fontFamily: 'NovaSquare-Regular',
  },
  placeholder: {
    width: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
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
    flex: 1,
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
  },
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});