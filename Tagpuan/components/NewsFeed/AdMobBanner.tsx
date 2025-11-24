import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// 🔴 USE THE ID WITH THE SLASH (/) HERE
const PRODUCTION_ID = 'ca-app-pub-5509684377946762/3359482462';

// The safety switch: Test Mode on laptop, Real Money on phone
const adUnitId = __DEV__ ? TestIds.BANNER : PRODUCTION_ID;

export const AdMobBanner = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});