import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import { router } from 'expo-router';

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
        <Text style={styles.title}>FARMERS MARKET</Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
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
                <Text style={styles.boxText}>Transportation</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(2)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Irrigation</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={() => handlePress(3)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Chicken Feed</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(4)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Plant Fertilizer</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={() => handlePress(5)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Small Tools</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => handlePress(6)}>
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.boxText}>Cow Feed</Text>
              </View>
              <Image
                source={require('../assets/images/wheelbarrow.png')}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.boxText}>buy</Text>
              <View style={styles.greenhighlight}>
                <Text style={styles.priceText}>500 PHP</Text>
              </View>
              <Text style={styles.orText}>or</Text>
              <View style={styles.highlight}>
                <Text style={styles.priceText}>30 Agricoin</Text>
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
    marginTop: -19,
  },
  highlight: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    minWidth: 100, // Ensures both have the same width
    textAlign: "center", // Centers the text inside
    marginTop: -5,
  },
  greenhighlight:{
    backgroundColor: '#6BBF59',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    minWidth: 100, // Ensures both have the same width
    textAlign: "center", // Centers the text inside
    marginTop: 10,
  },
  boxText: {
    textAlign: 'center',
    color: '#073B3A',
    fontSize: 15,
    fontFamily: theme.fonts.regular,
  },
  image: {
    width: 60,
    height: 60,
    marginTop: -12,
    marginLeft: 14, 
    marginBottom: 7, 
  },
  orText:{
    marginTop: -5,
    textAlign: 'center',
    color: '#073B3A',
    fontSize: 12,
    fontFamily: theme.fonts.regular,
  },
  priceText:{
    textAlign: 'center',
    color: '#073B3A',
    fontSize: 12,
    fontFamily: theme.fonts.novaSquare,
  },
});
