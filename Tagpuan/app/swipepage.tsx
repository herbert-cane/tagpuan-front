import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeFilter from '../components/swipefilter';
import theme from '@/constants/theme';

// Define Profile Type
type Profile = {
  id: string;
  image: any;
  name: string;
  profession: string;
  location: string;
  distance: string;
  availability: string;
  description: string;
};

const profiles: Profile[] = [
  {
    id: '1',
    image: require("../assets/images/profile-pic.jpg"),
    name: 'Dela Cruz, Juan',
    profession: 'Chicken Farmer',
    location: 'Miag-ao, Iloilo, Panay',
    distance: '4.5 km away',
    availability: 'Early June - Late September',
    description: 'Ako po ay kasalukuyang nag-aalaga ng mga manok. Kaya po naming magbenta ng manok at mga itlog nito. Maraming salamat po.'
  },
  {
    id: '2',
    image: require("../assets/images/main-image.png"),
    name: 'Gina Villamoso',
    profession: 'Vegetable Supplier',
    location: 'Cebu City, Cebu',
    distance: '10.2 km away',
    availability: 'All year round',
    description: 'Nagbebenta po kami ng mga sariwang gulay mula sa aming farm. Maaari po kayong umorder online.'
  }
];

const SwipeCard: React.FC = () => {
  const [profileIndex, setProfileIndex] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);
  const pan = useRef(new Animated.ValueXY()).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    Animated.timing(pan, {
      toValue: { x: direction === 'right' ? 500 : -500, y: 0 },
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      setProfileIndex((prevIndex) => (prevIndex + 1) % filteredProfiles.length);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dx > 120) {
        handleSwipe('right');
      } else if (gesture.dx < -120) {
        handleSwipe('left');
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    }
  });

  const applyFilters = (filters: { commodity?: string; modeofdelivery?: string; modeofpayment?: string }) => {
    setFilterVisible(false);
    const filtered = profiles.filter(profile => 
      (!filters.commodity || profile.profession.includes(filters.commodity))
    );
    setFilteredProfiles(filtered);
    setProfileIndex(0);
  };

  const profile = filteredProfiles[profileIndex];

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Image source={require("../assets/images/Filter.png")} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>TAGPUAN</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
      </View>
      <Animated.View 
        {...panResponder.panHandlers} 
        style={[styles.card, { transform: pan.getTranslateTransform() }]}
      >
        <View style={styles.imageContainer}>
          <Image source={profile.image} style={styles.image} />
        </View>
        <TouchableOpacity style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>see more</Text>
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.iconTextContainer}>
            <Image source={require("../assets/images/account-location.png")} style={styles.iconImage} />
            <Text style={styles.profession}>{profile.profession}</Text>
          </View>
          <View style={styles.iconTextContainer}>
            <Image source={require("../assets/images/map-marker-outline.png")} style={styles.iconImage} />
            <Text style={styles.location}>{profile.location}</Text>
          </View>
          <View style={styles.iconTextContainer}>
            <Image source={require("../assets/images/calendar-range.png")} style={styles.iconImage} />
            <Text style={styles.availability}>{profile.availability}</Text>
          </View>
          <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{profile.description}</Text>
        </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={() => handleSwipe('left')}>
            <Ionicons name="close" size={32} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="chatbubble" size={32} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Image source={require("../assets/images/Vector.png")} style={styles.iconImage} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      <SwipeFilter visible={filterVisible} onClose={() => setFilterVisible(false)} onApply={applyFilters} />
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
    backgroundColor: 'rgba(224, 247, 239, 0.8)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  // Image Container
  imageContainer: {
      width: '100%',
      height: 260,
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
