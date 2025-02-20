import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import Header from './Header';

SplashScreen.preventAutoHideAsync();

const LoadingSplashScreen = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold,
  });

  const [fadeAnim] = useState(new Animated.Value(0)); // Initial value for opacity: 0
  const [slideAnimText] = useState(new Animated.Value(0)); // Initial value for text horizontal position: 0
  const [slideAnimHeader] = useState(new Animated.Value(0)); // Initial value for header horizontal position: 0

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        Animated.sequence([
          Animated.delay(1500), // Delay before sliding off
          Animated.parallel([
            Animated.timing(slideAnimHeader, {
              toValue: -500, // Move the text to the left
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnimText, {
              toValue: 500, // Move the header to the right
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, styles.screenBackground, { opacity: fadeAnim }]}>
      <Animated.View style={{ transform: [{ translateX: slideAnimHeader }] }}>
        <Header fontSize={70} fontColor="white" stopColor="tomato" />
      </Animated.View>
      <Animated.Text style={[styles.title, { fontFamily: 'Roboto_400Regular' }, { transform: [{ translateX: slideAnimText }] }]}>
        swipe to rate & rank sports moments
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenBackground: {
    // backgroundColor: '#fdfdfd', // Slightly lighter gray background
    backgroundColor: 'black', // White background
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
    // color: '#333333', // Dark gray text
    color: 'white', // White text
  },
});

export default LoadingSplashScreen;