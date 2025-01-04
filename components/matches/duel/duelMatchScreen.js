import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import DuelResultsTable from './duelResultsTable';
import DuelPreviewScreen from './duelPreviewScreen';
import LoadingScreen from '../../loadingScreen';
import DuelComplete from './duelCompleteScreen';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const DuelMatchScreen = ({ match, matchSession }) => {
  const [currentPair, setCurrentPair] = useState([]);
  const [duelComplete, setDuelComplete] = useState(false);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [isPreviewScreen, setIsPreviewScreen] = useState(true); // Add preview screen state
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (matchSession) {
      setCurrentPair([matchSession.remaining_moments[0][0], matchSession.remaining_moments[0][1]]); // First duel pair
      setIsPreviewScreen(true);
    }
  }, [matchSession]);

  useEffect(() => {
    if (duelComplete) {
      axios.get(`${API_URL}/api/v1/matches/${match.id}`)
        .then(response => {
          const globalEntries = response.data.league_table_entries;
          setGlobalLeagueTableEntries(globalEntries);
        })
        .catch(error => {
          console.error('There was an error fetching the global league table entries!', error);
        });
    }
  }, [duelComplete, match]);

  const submitWinner = async (winnerMomentId) => {
    showLoadingScreen();
    try {
      const response = await fetch(`${API_URL}/api/v1/matches/${match.id}/match_sessions/${matchSession.id}/submit_duel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          winner_id: winnerMomentId,
          moment1_id: currentPair[0].id,
          moment2_id: currentPair[1].id
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.completed) {
          setDuelComplete(true); // Mark duel as complete
          setLeagueTableEntries(data.league_table_entries); // Set league table entries
        } else {
          setCurrentPair([data.next_duel[0], data.next_duel[1]]); // Load the next duel pair
          setIsFirstVideoPlaying(false);
          setIsSecondVideoPlaying(true);
          showLoadingScreen();
        }
      } else {
        console.error('Failed to submit duel:', data.error);
      }
    } catch (error) {
      console.error('Error submitting duel:', error);
    }
  };

  const startMatchSession = () => {
    setIsPreviewScreen(false);
    showLoadingScreen();
  };

  const showLoadingScreen = () => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  const renderGoatAction = () => {
    return( 
      <View style={styles.SwipeAction} />
    )
  };

  const vibrate = (style) => {
    Haptics.impactAsync(style);
  };

  const handleSwipeableOpen = (winnerMomentId) => {
    vibrate(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.90,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      vibrate(Haptics.ImpactFeedbackStyle.Medium);
      submitWinner(winnerMomentId);
    });
  };

  if (isPreviewScreen) {
    return <DuelPreviewScreen match={match} matchSession={matchSession} startMatchSession={startMatchSession} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (duelComplete) {
    return <DuelComplete leagueTableEntries={leagueTableEntries} globalLeagueTableEntries={globalLeagueTableEntries} />;
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={styles.container}>
        {currentPair.length > 0 && (
          <>
            <Swipeable
              key={currentPair[0].id}
              ref={swipeableRef1}
              containerStyle={{flex: 1}} // Apply flex: 1 to the container
              childrenContainerStyle={{}} // Apply flex: 1 to the children container
              friction={2}
              leftThreshold={50}
              rightThreshold={50}
              renderLeftActions={renderGoatAction}
              renderRightActions={renderGoatAction}
              onSwipeableOpen={() => handleSwipeableOpen(currentPair[0].id)}
            >
              <Animated.View style={[styles.videoContainer, { transform: [{ scale: scaleValue }] }]}>
                <Video
                  ref={videoRef1}
                  source={{ uri: currentPair[0].videoUrl }}
                  rate={1.0}
                  isMuted={true}
                  shouldPlay={isFirstVideoPlaying}
                  isLooping={false}
                  useNativeControls
                  onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                      videoRef1.current.replayAsync();
                      setIsFirstVideoPlaying(false);
                      setIsSecondVideoPlaying(true);
                    }
                  }}
                  resizeMode='stretch'
                  style={styles.topVideo}
                />
              </Animated.View>
            </Swipeable>
            <Swipeable
              key={currentPair[1].id}
              ref={swipeableRef2}
              containerStyle={{flex: 1}} // Apply flex: 1 to the container
              childrenContainerStyle={{}} // Apply flex: 1 to the children container
              friction={2}
              leftThreshold={50}
              rightThreshold={50}
              renderLeftActions={renderGoatAction}
              renderRightActions={renderGoatAction}
              onSwipeableOpen={() => handleSwipeableOpen(currentPair[1].id)}
            >
              <Animated.View style={[styles.videoContainer, { transform: [{ scale: scaleValue }] }]}>
                <Video
                  ref={videoRef2}
                  source={{ uri: currentPair[1].videoUrl }}
                  rate={1.0}
                  isMuted={true}
                  shouldPlay={isSecondVideoPlaying}
                  isLooping={false}
                  useNativeControls
                  onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                      videoRef2.current.replayAsync();
                      setIsSecondVideoPlaying(false);
                      setIsFirstVideoPlaying(false);
                    }
                  }}
                  resizeMode='stretch'
                  style={styles.bottomVideo}
                />
              </Animated.View>
            </Swipeable>
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  SwipeAction: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 4,
    width: Dimensions.get('window').width,
  },
  topVideo: {
    width: '100%',
    height: '100%',
  },
  bottomVideo: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
});

export default DuelMatchScreen;