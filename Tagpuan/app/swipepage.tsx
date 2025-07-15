import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeFilter from '../components/swipefilter';
import theme from '@/constants/theme';
import { router } from 'expo-router';
import { auth } from '@/firebaseConfig';
import { Buffer } from 'buffer';


type Profile = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  address: string;
  image: string;
  farmer_details?: {
    commodity: { id: string; name: string }[];
    modeOfDelivery: string[];
    modeOfPayment: string[];
  };
  description: string;
};

const SwipeCard: React.FC = () => {
  const FIREBASE_API = process.env.EXPO_PUBLIC_API_URL ?? '';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [profileIndex, setProfileIndex] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const pan = useRef(new Animated.ValueXY()).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    Animated.timing(pan, {
      toValue: { x: direction === 'right' ? 500 : -500, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setProfileIndex((prevIndex) =>
        filteredProfiles.length > 0
          ? (prevIndex + 1) % filteredProfiles.length
          : 0
      );
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dx > 120) {
        handleSwipe('right');
      } else if (gesture.dx < -120) {
        handleSwipe('left');
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  type SelectedFilters = {
    commodity?: string[];        // Changed to array
    deliveryMode?: string[];     // Changed to array
    paymentTerms?: string[];     // Changed to array
  };

  const applyFilters = (rawFilters: SelectedFilters) => {
  setFilterVisible(false);

  // Normalize: Convert empty arrays to undefined
  const filters: SelectedFilters = {
    commodity: rawFilters.commodity?.length ? rawFilters.commodity : undefined,
    deliveryMode: rawFilters.deliveryMode?.length ? rawFilters.deliveryMode : undefined,
    paymentTerms: rawFilters.paymentTerms?.length ? rawFilters.paymentTerms : undefined,
  };

    const hasNoFilters =
      !filters.commodity && !filters.deliveryMode && !filters.paymentTerms;

    if (hasNoFilters) {
      setFilteredProfiles(profiles);
      setProfileIndex(0);
      return;
    }

    const filtered = profiles.filter((profile) =>
      (!filters.commodity ||
        profile.farmer_details?.commodity?.some((c) => filters.commodity?.includes(c.id))) &&
      (!filters.deliveryMode ||
        profile.farmer_details?.modeOfDelivery?.some((mode) => filters.deliveryMode?.includes(mode))) &&
      (!filters.paymentTerms ||
        profile.farmer_details?.modeOfPayment?.some((payment) => filters.paymentTerms?.includes(payment)))
    );

    setFilteredProfiles(filtered);
    setProfileIndex(0);
  };


  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const token = await user.getIdToken();

        const response = await fetch(`${FIREBASE_API}/user/farmers`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch farmers');

        const farmers = await response.json();

        const formattedFarmers: Profile[] = farmers.map((data: any) => ({
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: data.role,
          address: data.address,
          image: data.profile_picture || '',
          description: data.description || '',
          farmer_details: {
            commodity: (data.farmer_details?.commodity || []).map((c: any) => ({
              id: c.id,
              name: c.name,
            })),
            modeOfDelivery: data.farmer_details?.modeOfDelivery || [],
            modeOfPayment: data.farmer_details?.paymentTerms || [],
          },
        }));

        setProfiles(formattedFarmers);
        setFilteredProfiles(formattedFarmers);
        setProfileIndex(0);
      } catch (err) {
        console.error('Error fetching farmers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#DDB771" />
      </View>
    );
  }

  if (!loading && profiles.length > 0 && filteredProfiles.length === 0) {
  return (
    <LinearGradient
      style={styles.container}
      colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
          There are no farmers that meet your conditions.
        </Text>
        <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
             Please check back again later or adjust your filters.
          </Text>
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ marginTop: 10 }}>
          <Text style={{ color: '#DDB771', textDecorationLine: 'underline' }}>
            Adjust Filters
          </Text>
        </TouchableOpacity>
      </View>

      <SwipeFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
      />
    </LinearGradient>
    );
  }


  const profile = filteredProfiles[profileIndex];

  const createConversation = async (userId: string, name: string, image: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const base64Image = Buffer.from(image).toString("base64");

      const response = await fetch(`${FIREBASE_API}/conversation/create/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const result = await response.json();

      router.push(
          `/messagepage?conversationId=${result.id}&name=${name}&image=${base64Image}`
        )
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Image
            source={require('../assets/images/Filter.png')}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>TAGPUAN</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/homepage')}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
      </View>
      

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, { transform: pan.getTranslateTransform() }]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={ { uri: profile.image } }
            style={styles.image}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.iconTextContainer}>
            <Image
              source={ { uri: profile.image } }
              style={styles.iconImage}
            />
            <Text style={styles.profession}>
              {profile.farmer_details?.commodity?.map((c) => c?.name).join(', ')}
            </Text>


          </View>
          <View style={styles.iconTextContainer}>
            <Image
              source={require('../assets/images/map-marker-outline.png')}
              style={styles.iconImage}
            />
            {profile.address && profile.address.trim() !== '' ? (
              <Text style={styles.location}>{profile.address}</Text>
            ) : (
              <Text style={[styles.location, { color: 'grey', fontStyle: 'italic' }]}>
              No set location
              </Text>
            )}
          </View>
            <View style={styles.descriptionContainer}>
            <ScrollView>
              {profile.description && profile.description.trim() !== '' ? (
              <Text style={styles.description}>{profile.description}</Text>
              ) : (
              <Text style={[styles.description, { color: 'grey', fontStyle: 'italic' }]}>
                This user hasn't set any bio.
              </Text>
              )}
            </ScrollView>
            </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSwipe('left')}
          >
            <Ionicons name="close" size={32} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => createConversation(profile.id, profile.name, profile.image)}
          >
            <Ionicons name="chatbubble" size={32} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/requestpage')}
          >
            <Image
              source={require('../assets/images/Vector.png')}
              style={styles.iconImage}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <SwipeFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    top: -30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '110%',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    top: 2,
    right: 0,
    borderWidth: 2, 
    borderColor: '#DDB771', 
    borderRadius: 4, 
    width: 35, 
    height: 35, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  backText: { 
    color: '#DDB771', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  filterButton: {
    padding: 10,
  },
  filterIcon: {
    width: 30,
    height: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.regular,
    color: '#DDB771',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '90%',
    height: 580, // Fixed height
    backgroundColor: 'rgba(224, 247, 239, 0.8)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 220, // Fixed height
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#08A045',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  seeMoreButton: {
    position: 'absolute',
    top: 220,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 3,
  },
  seeMoreText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#073B3A',
  },
  profession: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },
  availability: {
    fontSize: 14,
    color: '#000',
  },
  descriptionContainer: {
    backgroundColor: '#E0F7EF',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    height: 80, // Fixed height
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    color: '#073B3A',
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  button: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    elevation: 3,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  supplier: {
    fontSize: 16,
    color: "#0B6E4F",
    fontWeight: "bold",
  },
  iconImage: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
});

export default SwipeCard;
