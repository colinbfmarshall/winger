import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { apiService } from '../services/apiService';
import { sportsCache } from '../services/sportsCache';
import Colors from '../config/colors';

ExpoSplashScreen.preventAutoHideAsync();

const SplashScreen = ({ onSportsLoaded }) => {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const [sportsLoadingComplete, setSportsLoadingComplete] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Start fade animation when fonts load
  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2300,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded, fadeAnim]);

  // Preload sports data only once
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const preloadSports = async () => {
      if (sportsLoadingComplete) return; // Prevent multiple executions

      try {
        console.log('Preloading sports data during splash...');
        
        // First check if we have valid cached data
        const cachedSports = await sportsCache.getCachedSports();
        if (cachedSports && isMounted) {
          console.log('Using cached sports data');
          const sportsWithAll = [
            ...cachedSports,
            { id: 'all', name: 'ALL', slug: 'all' }
          ];
          onSportsLoaded?.(sportsWithAll);
          setSportsLoadingComplete(true);
          return;
        }

        // If no valid cache, fetch from API
        console.log('Fetching sports from API during splash...');
        const response = await apiService.fetchSports(false); // Don't require auth during splash
        
        if (response.success && isMounted) {
          console.log('Sports preloaded successfully during splash');
          
          // Cache the raw API response (without ALL option)
          await sportsCache.storeSports(response.data);
          
          // Add ALL option for the app
          const sportsWithAll = [
            ...response.data,
            { id: 'all', name: 'ALL', slug: 'all' }
          ];
          
          onSportsLoaded?.(sportsWithAll);
          setSportsLoadingComplete(true);
        } else if (isMounted) {
          console.error('Failed to preload sports during splash:', response.error);
          setSportsLoadingComplete(true); // Mark as complete even on failure
        }
      } catch (error) {
        console.error('Error preloading sports during splash:', error);
        if (isMounted) {
          setSportsLoadingComplete(true); // Mark as complete even on failure
        }
      }
    };

    if (fontsLoaded && !sportsLoadingComplete) {
      preloadSports();
    }

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [fontsLoaded, sportsLoadingComplete, onSportsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        {/* Show the container with black background even when fonts aren't loaded */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>A MOMENT</Animated.Text>
        <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>YOUR VOTE</Animated.Text>
        <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>THE GOAT<Text style={{ color: Colors.primary }}>.</Text></Animated.Text>
      </View>
      <View style={styles.bottomContent}>
        <Animated.Text style={[styles.taglineText, { opacity: fadeAnim }]}>GOAT<Text style={{ color: Colors.primary }}>.</Text> the <Text style={{ color: Colors.primary }}>sports</Text> app</Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottomContent: {
    paddingBottom: 50,
  },
  splashText: {
    color: Colors.text,
    fontSize: 68,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.4,
    textAlign: 'left',
    lineHeight: 72,
    marginBottom: 30,
  },
  taglineText: {
    color: Colors.text,
    fontSize: 30,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
});

export default SplashScreen;
