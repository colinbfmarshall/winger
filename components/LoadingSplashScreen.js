import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const LoadingSplashScreen = () => {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>A MOMENT.</Animated.Text>
      <Animated.Text style={[styles.splashText, { opacity: fadeAnim }]}>YOUR VOTE.</Animated.Text>
      <Animated.Text style={[styles.splashText, { opacity: fadeAnim, marginVertical: 10 }]}>THE GOAT</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'left',
    paddingHorizontal: 0, // Remove side padding
  },
  splashText: {
    color: 'white',
    fontSize: 64, // Larger font
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.5,
    textAlign: 'left', // Center text
    paddingLeft: 30, // Add left padding for spacing
    lineHeight: 72,
  },
});

export default LoadingSplashScreen;