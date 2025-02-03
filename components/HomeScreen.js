import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import Header from './Header';
import ScrambleMatchScreen from './matches/scramble/scrambleMatchScreen';

SplashScreen.preventAutoHideAsync();

const HomeScreen = ({ navigation }) => {
  const [showScrambleMatch, setShowScrambleMatch] = useState(false);

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

  const handlePress = () => {
    setShowScrambleMatch(true);
  }

  if (showScrambleMatch) {
    return <ScrambleMatchScreen />;
  }

  return (
    <View style={[styles.container, styles.screenBackground]}>
      <Header fontSize={60} fontColor="#333333" stopColor="tomato" />
      <Text style={[styles.title, { fontFamily: 'Roboto_400Regular' }]}>
        swipe to rate & rank sports moments
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
    width: '40%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;