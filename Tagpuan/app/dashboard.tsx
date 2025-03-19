import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import theme from '../constants/theme';

const notifications = [
  { id: '1', message: 'A Buyer wants to buy your Crops!', time: '2 mins ago' },
  { id: '2', message: 'Juan Dela Cruz sent you a message!', time: '10 mins ago' },
  { id: '3', message: 'The updated Heatmap is here!', time: '1 hour ago' },
  { id: '4', message: 'The updated Heatmap is here!', time: '1 hour ago' },
  { id: '5', message: 'The updated Heatmap is here!', time: '1 hour ago' },
  { id: '6', message: 'The updated Heatmap is here!', time: '1 hour ago' },
  { id: '7', message: 'The updated Heatmap is here!', time: '1 hour ago' },
  { id: '8', message: 'The updated Heatmap is here!', time: '1 hour ago' },
];

const deliveries = [
    { id: '1', product: 'Onions', status: 'On the Way', color: '#08A045', icon: require('../assets/images/onion-truck.png') },
    { id: '2', product: 'Tomato', status: 'In the sorting facility', color: '#08A045', icon: require('../assets/images/tomato-truck.png') },
];  

const listings = [
    { id: '1', name: 'Tomato', icon: require('../assets/images/tomato.png') },
    { id: '2', name: 'Onion', icon: require('../assets/images/onion.png') },
    { id: '3', name: 'Potato', icon: require('../assets/images/potato.png') },
    { id: '4', name: 'Corn', icon: require('../assets/images/corn.png') },
  ];
  
  export default function Dashboard() {
    return (
      <LinearGradient
        style={styles.container}
        colors={["#073B3A", "#0B6E4F", "#08A045", "#6BBF59"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DASHBOARD</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
        </View>
  
        <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        >

            {/* Notifications Section */}
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.notificationsContainer}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                    <View style={styles.notificationRow}>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                    </View>
                </View>
                )}
                style={{ maxHeight: 140 }}
                nestedScrollEnabled={true} // 👈 Allows scrolling within ScrollView
                showsVerticalScrollIndicator={false}
            />
            </View>

    
            {/* Deliveries Section */}
            <Text style={styles.sectionTitle}>Deliveries</Text>
            <View style={styles.deliveriesContainer}>
            {deliveries.map((item) => (
                <View key={item.id} style={[styles.deliveryCard, { backgroundColor: item.color }]}>
                <Image source={item.icon} style={styles.deliveryIcon} />
                <View>
                    <Text style={styles.deliveryProduct}>{item.product}</Text>
                    <Text style={styles.deliveryStatus}>{item.status}</Text>
                </View>
                </View>
            ))}
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
    
            {/* Listings Section */}
            <Text style={styles.sectionTitle}>Listing</Text>
            <View style={styles.listingContainer}>
            {listings.map((item) => (
                <View key={item.id} style={styles.listItem}>
                <Image source={item.icon} style={styles.listIcon} />
                <Text style={styles.listText}>{item.name}</Text>
                </View>
            ))}
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
      marginBottom: 20,
    },
    title: {
      marginTop: 8,
      marginBottom: 24,
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
    sectionTitle: {
      color: '#DDB771',
      fontSize: 24,
      fontFamily: 'NovaSquare-Regular',
      marginBottom: 24,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    notificationsContainer: {
        maxHeight: 140,
        overflow: 'hidden',
        marginBottom: 48,
    },      
    notificationItem: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      width: '100%',
    },
    notificationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationMessage: {
      color: '#FFFFFF',
      fontSize: 14,
      fontFamily: 'NovaSquare-Regular',
      marginRight: 12,
    },
    notificationTime: {
      color: '#A1C3A0',
      fontSize: 12,
      fontFamily: 'NovaSquare-Regular',
    },
    deliveriesContainer: {
      marginBottom: 24,
      backgroundColor: 'rgba(7, 59, 58, 0.5)',
      padding: 12,
      borderRadius: 12,
      width: '80%',
    },
    deliveryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '100%',
      padding: 8,
      marginTop: 8,
      marginBottom: 8,
      borderRadius: 12,
      elevation: 4,
    },
    deliveryIcon: {
      width: 48,
      height: 48,
      marginRight: 24,
      marginLeft: 12,
      resizeMode: 'contain',
    },
    deliveryProduct: {
      color: '#DDB771',
      fontSize: 14,
      fontFamily: 'NovaSquare-Regular',
    },
    deliveryStatus: {
      color: '#DDB771',
      fontSize: 12,
      fontFamily: 'NovaSquare-Regular',
    },
    divider: {
        width: '90%',
        height: 1,
        backgroundColor: '#DDB771',
        marginVertical: 16,
        alignSelf: 'center',
        marginBottom: 24,
    },      
    listingContainer: {
      backgroundColor: 'rgba(7, 59, 58, 0.5)',
      padding: 12,
      borderRadius: 12,
      width: '80%',
      marginBottom: 24,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 3,
      borderRadius: 2,
      borderColor: '#DDB771',
    },
    listIcon: {
      width: 40,
      height: 40,
      backgroundColor: "#08A045",
      borderRadius: 12,
      marginRight: 24,
      marginLeft: 8,
      resizeMode: 'contain',
    },
    listText: {
      color: '#DDB771',
      fontSize: 16,
      fontFamily: 'NovaSquare-Regular',
    },
  });
  