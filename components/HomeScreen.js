import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import Header from './Header';
import ScrambleMatchScreen from './matches/scramble/scrambleMatchScreen';

SplashScreen.preventAutoHideAsync();

const SPORTS = [
  { label: 'FOOTBALL' },
  { label: 'RUGBY' },
  { label: 'VIDEO GAMES' },
  { label: 'ALL' },
];

const HomeScreen = ({ navigation }) => {
  const [showScrambleMatch, setShowScrambleMatch] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
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
  };

  if (showScrambleMatch) {
    return <ScrambleMatchScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.section, styles.sectionTop]}>
        <Text style={styles.splashText}>CHOOSE</Text>
        <Text style={styles.splashText}>YOUR</Text>
        <Text style={styles.splashText}>SPORT:</Text>
      </View>

      <View style={[styles.section, styles.sectionMiddle]}>
        {SPORTS.map((sport) => (
          <TouchableOpacity
            key={sport.label}
            style={[
              styles.sportButton,
              selectedSport === sport.label && styles.sportButtonSelected,
            ]}
            onPress={() => setSelectedSport(sport.label)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                selectedSport === sport.label && styles.buttonTextSelected,
              ]}
            >
              {sport.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.section, styles.sectionBottom]}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.playButton,
              !selectedSport && styles.playButtonDisabled,
            ]}
            onPress={handlePress}
            disabled={!selectedSport}
            activeOpacity={selectedSport ? 0.7 : 1}
          >
            <Text
              style={[
                styles.buttonText,
                styles.playButtonText,
                !selectedSport && styles.playButtonTextDisabled,
              ]}
            >
              PLAY
            </Text>
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
    alignItems: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
  },
  section: {
    width: '100%',
  },
  sectionTop: {
    flex: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sectionMiddle: {
    flex: 6,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sectionBottom: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  splashText: {
    color: 'white',
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.5,
    textAlign: 'left',
    lineHeight: 72,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  sportButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  sportButtonSelected: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonTextSelected: {
    color: 'black',
  },
  playButton: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    opacity: 1,
  },
  playButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  playButtonText: {
    color: 'white',
  },
  playButtonTextDisabled: {
    color: '#bbb',
  },
});

export default HomeScreen;