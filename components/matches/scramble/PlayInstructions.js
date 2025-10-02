import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import Colors from '../../../config/colors';

const PlayInstructions = ({ onContinue, onPlay, videoReady = false, showPlayButton = false }) => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleContinue = () => {
    if (videoReady) {
      onPlay();
    } else {
      onContinue();
    }
  };

  return (
    <View style={styles.container} testID="play-instructions">
      <View style={[styles.section, styles.sectionMiddle]}>
        <Text style={styles.splashText}>
          Watch <Text style={{ fontSize: 36 }}>two videos.</Text>
        </Text>
        
        <Text style={styles.splashText}>
          Swipe <Text style={{ fontSize: 36 }}>to vote.</Text>
        </Text>

        <Text style={styles.splashText}>
          Repeat.
        </Text>
      </View>
      
      <View style={[styles.section, styles.sectionBottom]}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.playButton,
              !videoReady && styles.playButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!videoReady}
            accessibilityRole="button"
            accessibilityLabel={
              videoReady ? "Start playing scramble" : "Loading videos, please wait"
            }
            testID="play-button"
            activeOpacity={!videoReady ? 1 : 0.7}
          >
            <Text style={[
              styles.buttonText,
              styles.playButtonText,
              !videoReady && styles.playButtonTextDisabled
            ]}>
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
  sectionMiddle: {
    flex: 10,
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
    fontSize: 68,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    letterSpacing: 0.4,
    textAlign: 'left',
    lineHeight: 72,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'flex-start',
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
    backgroundColor: '#444',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playButtonText: {
    color: 'white',
  },
  playButtonTextDisabled: {
    color: '#bbb',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginTop: 20,
    width: '100%',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    marginTop: 10,
  },
});

export default PlayInstructions;
