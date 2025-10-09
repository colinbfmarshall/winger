import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, ScrollView } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as ExpoSplashScreen from 'expo-splash-screen';
import LeaderboardComplete from './matches/scramble/LeaderboardComplete';
import { apiService } from '../services/apiService';
import { sportsCache } from '../services/sportsCache';
import Colors from '../config/colors';

ExpoSplashScreen.preventAutoHideAsync();

const ResultsScreen = ({ navigation, preloadedSports }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [sports, setSports] = useState(preloadedSports || []);
  const [isLoading, setIsLoading] = useState(!preloadedSports);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnimations = useRef([]).current;

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
  });

  // Use preloaded sports if available, otherwise fetch
  useEffect(() => {
    if (preloadedSports && preloadedSports.length > 0) {
      console.log('Using preloaded sports in ResultsScreen');
      setSports(preloadedSports);
      setIsLoading(false);
      setError(null);
      
      // Initialize button animations for preloaded sports
      buttonAnimations.length = 0;
      preloadedSports.forEach(() => {
        buttonAnimations.push(new Animated.Value(0));
      });
      return;
    }

    // Fallback: fetch sports if not preloaded
    const fetchSports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching sports in ResultsScreen (fallback)');
        
        // First try cache
        const cachedSports = await sportsCache.getCachedSports();
        if (cachedSports) {
          // Don't add ALL option for Results screen since it doesn't make sense for leaderboards
          setSports(cachedSports);
          buttonAnimations.length = 0;
          cachedSports.forEach(() => {
            buttonAnimations.push(new Animated.Value(0));
          });
          setIsLoading(false);
          return;
        }
        
        // If no cache, fetch from API
        const response = await apiService.fetchSports(true); // Require auth for fallback
        
        if (response.success) {
          await sportsCache.storeSports(response.data);
          
          // Don't add ALL option for Results screen
          setSports(response.data);
          buttonAnimations.length = 0;
          response.data.forEach(() => {
            buttonAnimations.push(new Animated.Value(0));
          });
        } else {
          setError(response.error || 'Failed to load sports');
        }
      } catch (err) {
        console.error('Error in fetchSports fallback:', err);
        setError('Failed to load sports. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSports();
  }, [preloadedSports, retryCount]);

  // Start animations after fonts and data are loaded
  useEffect(() => {
    if (fontsLoaded && !isLoading && sports.length > 0) {
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
          delay: 400 + (index * buttonDelayTime),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [fontsLoaded, isLoading, sports.length, fadeAnim, slideAnim, buttonAnimations]);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Show loading screen while fonts load or data is loading
  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        {/* <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          {!fontsLoaded ? 'Loading fonts...' : 'Loading sports...'}
        </Text> */}
      </View>
    );
  }

  // Show error screen
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.buttonText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state if no sports available
  if (sports.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No sports available</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.buttonText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePress = () => {
    setShowLeaderboard(true);
  };

  const handleBackToHome = () => {
    setShowLeaderboard(false);
  };

  if (showLeaderboard) {
    return <LeaderboardComplete sport={selectedSport?.slug} onPlayAgain={handleBackToHome} navigation={navigation} />;
  }

  // Filter sports to exclude "ALL" option for Results screen since it doesn't make sense for leaderboards
  const filteredSports = sports.filter(sport => sport.id !== 'all');

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
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredSports.map((sport, index) => (
            <Animated.View
              key={sport.id}
              style={[
                styles.sportButtonWrapper,
                {
                  opacity: buttonAnimations[index] || 0,
                  transform: [
                    {
                      translateX: buttonAnimations[index]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }) || 0,
                    },
                  ],
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.sportButton,
                  selectedSport?.id === sport.id && styles.sportButtonSelected,
                ]}
                onPress={() => setSelectedSport(sport)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedSport?.id === sport.id && styles.buttonTextSelected,
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
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
              RESULTS
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 10,
    flexGrow: 1,
    justifyContent: 'center',
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
  loadingText: {
    color: Colors.text,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.primary,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 100,
  },
});

export default ResultsScreen;
