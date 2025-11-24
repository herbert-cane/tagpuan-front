import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// 🔴 PASTE YOUR REAL MREC AD UNIT ID HERE
const PRODUCTION_ID = 'ca-app-pub-5509684377946762/9925601255';

const adUnitId = __DEV__ ? TestIds.BANNER : PRODUCTION_ID;

export const AdMobFeedAd = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Sponsored</Text>
      </View>
      <View style={styles.adWrapper}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE} // 300x250
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  adWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    backgroundColor: '#f0f0f0',
  },
});