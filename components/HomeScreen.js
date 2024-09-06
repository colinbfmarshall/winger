import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import SportButton from './SportButton';
import Header from './Header';

SplashScreen.preventAutoHideAsync();

const HomeScreen = ({ navigateToDuelScreen }) => {
  let [fontsLoaded] = useFonts({
    Roboto_400Regular, RobotoCondensed_700Bold
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, styles.screenBackground]}>
      <Header fontSize={60} color="#333333" />
      <Text style={[styles.title, { fontFamily: 'Roboto_400Regular' }]}>
        Swipe to vote on your favourite moments
      </Text>
      <SportButton sport="rugby tries" icon="sports-rugby" onPress={() => navigateToDuelScreen('rugby')} />
      <SportButton sport="football goals" icon="sports-soccer" onPress={() => navigateToDuelScreen('football')} />
      <SportButton sport="golf shots" icon="golf-course" onPress={() => navigateToDuelScreen('golf')} />
      <SportButton sport="rankings" icon="table-rows" onPress={() => navigateToDuelScreen('rankings')} />
    </View>
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
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333333', // Dark gray text
  },
});

export default HomeScreen;