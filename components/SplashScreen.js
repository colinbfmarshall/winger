import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Colors from '../config/colors';

ExpoSplashScreen.preventAutoHideAsync();

const SplashScreen = () => {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2300,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

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
