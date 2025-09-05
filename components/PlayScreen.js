import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as ExpoSplashScreen from 'expo-splash-screen';
import ScrambleMatchScreen from './matches/scramble/scrambleMatchScreen';
import Colors from '../config/colors';

ExpoSplashScreen.preventAutoHideAsync();

const SPORTS = [
  { label: 'FOOTBALL' },
  { label: 'RUGBY' },
  { label: 'VIDEO GAMES' },
  { label: 'ALL' },
];

const PlayScreen = ({ navigation }) => {
  const [showScrambleMatch, setShowScrambleMatch] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnimations = useRef(
    SPORTS.map(() => new Animated.Value(0))
  ).current;

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      ExpoSplashScreen.hideAsync();
      
      // Start the main entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger the button animations
      const buttonDelayTime = 100;
      buttonAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay: 400 + (index * buttonDelayTime), // Start after main animation
          useNativeDriver: true,
        }).start();
      });
    }
  }, [fontsLoaded, fadeAnim, slideAnim, buttonAnimations]);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        {/* Show black background while fonts load to prevent flash */}
      </View>
    );
  }

  const handlePress = () => {
    setShowScrambleMatch(true);
  };

  const handleBackToHome = () => {
    setShowScrambleMatch(false);
  };

  if (showScrambleMatch) {
    return <ScrambleMatchScreen sport={selectedSport?.toLowerCase()} onBackToHome={handleBackToHome} />;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={[styles.section, styles.sectionTop]}>
        <Text style={styles.splashText}>CHOOSE</Text>
        <Text style={styles.splashText}>YOUR</Text>
        <Text style={styles.splashText}>SPORT:</Text>
      </View>

      <View style={[styles.section, styles.sectionMiddle]}>
        {SPORTS.map((sport, index) => (
          <Animated.View
            key={sport.label}
            style={[
              styles.sportButtonWrapper,
              {
                opacity: buttonAnimations[index],
                transform: [
                  {
                    translateX: buttonAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }
            ]}
          >
            <TouchableOpacity
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
          </Animated.View>
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
    </Animated.View>
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
    color: Colors.text,
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
  sportButtonWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  sportButton: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 5,
    borderColor: Colors.text,
    borderWidth: 2,
    alignItems: 'center',
    width: '100%',
  },
  sportButtonSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  buttonText: {
    color: Colors.text,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonTextSelected: {
    color: Colors.background,
  },
  playButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    opacity: 1,
  },
  playButtonDisabled: {
    backgroundColor: Colors.disabled,
    opacity: 0.5,
  },
  playButtonText: {
    color: Colors.text,
  },
  playButtonTextDisabled: {
    color: Colors.textDisabled,
  },
});

export default PlayScreen;
