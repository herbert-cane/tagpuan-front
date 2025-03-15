import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
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
        <Text style={styles.title}>BUYER'S MARKET</Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
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
      </View>

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
    color: '#DDB771',
    fontFamily: theme.fonts.regular,
    fontSize: 24,
    fontWeight: 'bold',
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
  body: {
    gap: 20, // Gap between rows
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20, // Gap between boxes in the same row
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
    justifyContent: 'center', // Vertical and horizontal centering
    gap: 5, // Small gap between discount text and highlight
  },
  textContainer: {
    height: 40, // Fixed height for alignment
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
    width: 60, // Width of the image
    height: 60, // Height of the image
    marginVertical: 5, // Spacing between text and image
  },
});
