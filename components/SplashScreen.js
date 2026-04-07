import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { apiService } from '../services/apiService';
import { sportsCache } from '../services/sportsCache';
import Colors from '../config/colors';

ExpoSplashScreen.preventAutoHideAsync();

const SplashScreen = ({ onSportsLoaded }) => {
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const [sportsLoadingComplete, setSportsLoadingComplete] = useState(false);
  const splashTextOpacity = useRef(new Animated.Value(1)).current;
  const HORIZONTAL_PADDING = 60;
  const availableTextWidth = width - HORIZONTAL_PADDING;
  const splashFontSize = Math.min(68, Math.max(48, availableTextWidth * 0.16));
  const splashLineHeight = Math.round(splashFontSize * 1.06);

  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      const timer = setTimeout(() => {
        Animated.timing(splashTextOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, splashTextOpacity]);

  useEffect(() => {
    let isMounted = true;

    const preloadSports = async () => {
      if (sportsLoadingComplete) return; 

      try {
        const cachedSports = await sportsCache.getCachedSports();
        if (cachedSports && isMounted) {
          const sportsWithAll = [
            ...cachedSports,
            { id: 'all', name: 'ALL', slug: 'all' }
          ];
          onSportsLoaded?.(sportsWithAll);
          setSportsLoadingComplete(true);
          return;
        }

        const response = await apiService.fetchSports(false);
        
        if (response.success && isMounted) {
          await sportsCache.storeSports(response.data);
          
          const sportsWithAll = [
            ...response.data,
            { id: 'all', name: 'ALL', slug: 'all' }
          ];
          
          onSportsLoaded?.(sportsWithAll);
          setSportsLoadingComplete(true);
        } else if (isMounted) {
          setSportsLoadingComplete(true);
        }
      } catch (error) {
        if (isMounted) {
          setSportsLoadingComplete(true);
        }
      }
    };

    if (fontsLoaded && !sportsLoadingComplete) {
      preloadSports();
    }

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
        <Animated.Text
          style={[
            styles.splashText,
            {
              opacity: splashTextOpacity,
              fontSize: splashFontSize,
              lineHeight: splashLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          A MOMENT
        </Animated.Text>
        <Animated.Text
          style={[
            styles.splashText,
            {
              opacity: splashTextOpacity,
              fontSize: splashFontSize,
              lineHeight: splashLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          YOUR VOTE
        </Animated.Text>
        <Animated.Text
          style={[
            styles.splashText,
            {
              opacity: splashTextOpacity,
              fontSize: splashFontSize,
              lineHeight: splashLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          THE GOAT.
        </Animated.Text>
      </View>
      <View style={styles.bottomContent}>
        <Text style={styles.taglineText}>GOAT<Text style={{ color: Colors.primary }}>.</Text> the <Text style={{ color: Colors.primary }}>sports</Text> app</Text>
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
    width: '100%',
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.4,
    textAlign: 'left',
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
