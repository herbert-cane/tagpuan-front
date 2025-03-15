import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function App() {
  // Example handler
  const handlePress = (id: number) => {
    console.log(`Container ${id} pressed`);
  };

  return (
    <LinearGradient
      style={styles.container}
      colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Title + Button Container */}
      <View style={styles.header}>
        {/* Title */}
        <Text style={styles.title}>CONSUMER MARKET</Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Body (Make it Scrollable) */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer} // Ensures proper alignment and padding
        showsVerticalScrollIndicator={false} // Hides scrollbar
      >
        {/* First Row */}
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={() => handlePress(1)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>30% Off</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(2)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>10% Off</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={() => handlePress(3)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>50% Off</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(4)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Crop Management Course</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={() => handlePress(5)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Food Processing Course</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(6)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Produce Transportation Course</Text>
              </View>
              <Image
                source={require('../assets/images/promo-code.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.highlight}>
                <Text style={styles.boxText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 56,
  },
  title: {
    marginTop: 8,
    letterSpacing: 1,
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 20,
  },
  backButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    borderWidth: 2,
    borderColor: '#DDB771',
    borderRadius: 4,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#DDB771',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 50, // Prevent content from being cut off
    alignItems: 'center',
    gap: 20,
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  box: {
    backgroundColor: '#DDB771',
    borderRadius: 25,
    padding: 20,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  textContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlight: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  boxText: {
    textAlign: 'center',
    color: '#073B3A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  image: {
    width: 60,
    height: 60,
    marginVertical: 5,
  },
});
