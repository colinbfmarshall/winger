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
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.splashText}>CHOOSE</Text>
          <Text style={styles.splashText}>YOUR</Text>
          <Text style={styles.splashText}>SPORT:</Text>
        </View>

        <View style={styles.section}>
        </View>

        <View style={styles.section}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
        </View>
        </View>
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
    paddingTop: 30, // Add top padding for spacing
    paddingLeft: 30, // Add left padding for spacing
    paddingRight: 30, // Add left padding for spacing
  },
  section: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'left',
    width: '100%',
  },
  splashText: {
    color: 'white',
    fontSize: 64, // Larger font
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.5,
    textAlign: 'left', // Center text
    lineHeight: 64,
  },
  buttonContainer: {
    alignItems: 'left',
    width: '100%',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;