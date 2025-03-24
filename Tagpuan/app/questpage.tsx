import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import QuestFilter from '../components/questfilter';
import { router } from 'expo-router';

const questsData = [
  { commodity: 'Chicken', contractType: 'Bulk', price: '90/kg', schedule: '2 wks', delivery: 'Sunshine Farms, Kalibo, Aklan' },
  { commodity: 'Chicken', contractType: 'Singular', price: '80/kg', schedule: '3 wks', delivery: 'House 2, Camelot, Sapian, Capiz' },
  { commodity: 'Chicken', contractType: 'Bulk', price: '200/kg', schedule: '5 days', delivery: 'Balay Guimaraila, Miagao, Iloilo' },
];

export default function QuestsPage() {
  const [filterVisible, setFilterVisible] = useState(false);
  const [filteredQuests, setFilteredQuests] = useState(questsData);

  const applyFilters = (filters: { commodity?: string; contractType?: string }) => {
    setFilterVisible(false);
    
    const filtered = questsData.filter((quest) => {
      return (
        (!filters.commodity || quest.commodity === filters.commodity) &&
        (!filters.contractType || quest.contractType === filters.contractType)
      );
    });

    setFilteredQuests(filtered);
  };

  return (
    <LinearGradient style={styles.container} colors={['#073B3A', '#0B6E4F', '#08A045', '#6BBF59']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>QUESTS</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/homepage')}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterContainer} onPress={() => setFilterVisible(true)}>
          <Image source={require('../assets/images/Filter.png')} style={styles.filterIcon} resizeMode="contain" />
          <Text style={styles.filterText}>FILTER</Text>
        </TouchableOpacity>

        {filteredQuests.map((quest, index) => (
          <View key={index} style={styles.questCardWrapper}>
            <TouchableOpacity style={styles.questCard} onPress={() => console.log('Quest Card Pressed')}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={38} color="#808080" />
                <View style={styles.questDetails}>
                  {Object.entries(quest).map(([key, value]) => (
                    <View key={key} style={styles.row}>
                      <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                      <Text style={styles.value}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bidButton} onPress={() => console.log('Bid Pressed')}>
              <Text style={styles.bidButtonText}>BID</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <QuestFilter visible={filterVisible} onClose={() => setFilterVisible(false)} onApply={applyFilters} />
      <StatusBar style="auto" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  scrollContainer: { flexGrow: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { color: '#DDB771', fontFamily: theme.fonts.regular, fontSize: 24, textAlign: 'center' },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  filterIcon: { width: 35, height: 35 },
  filterText: { color: '#FFFFFF', fontSize: 20, marginLeft: 8 },
  questCardWrapper: { marginBottom: 20, alignItems: 'center' },
  questCard: { backgroundColor: '#DDB771', padding: 16, borderRadius: 10, width: '100%', elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  questDetails: { flex: 1, marginLeft: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#000', fontWeight: '600' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' },
  bidButton: { backgroundColor: '#FFFFFF', paddingVertical: 6, borderRadius: 5, alignItems: 'center', marginTop: 10, width: 80, elevation: 3 },
  bidButtonText: { fontWeight: 'bold', fontSize: 16 },
  backButton: { position: 'absolute',top: 2, right: 0, borderWidth: 2, borderColor: '#DDB771', borderRadius: 4, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#DDB771', fontSize: 24, fontWeight: 'bold' },
});