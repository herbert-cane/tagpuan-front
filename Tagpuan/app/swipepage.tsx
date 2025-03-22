import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SwipeCard = ({ profile }: { profile: { image: string; name: string; description: string } }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dx > 120) {
        Animated.timing(pan, {
          toValue: { x: 500, y: gesture.dy },
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else if (gesture.dx < -120) {
        Animated.timing(pan, {
          toValue: { x: -500, y: gesture.dy },
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <Animated.View 
        {...panResponder.panHandlers} 
        style={[styles.card, { transform: pan.getTranslateTransform() }]}
      >
        <Image source={{ uri: profile.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.description}>{profile.description}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="close" size={32} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="chatbubble" size={32} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="information-circle" size={32} color="orange" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  card: {
    width: '90%',
    backgroundColor: '#E0F7EF',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  infoContainer: {
    padding: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  button: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    elevation: 3,
  },
});

export default SwipeCard;
