import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import LoadingScreen from '../../loadingScreen';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const ScrambleMatchScreen = () => {
  console.log('ScrambleMatchScreen');
  const [MatchId, setMatchId] = useState(null);
  const [matchSession, setMatchSession] = useState(null);
  const [currentPair, setCurrentPair] = useState([]);
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startMatchSession();
  }, []);

  const submitWinner = async (winnerMomentId) => {
    console.log('submitWinner', winnerMomentId);
    showLoadingScreen();
    try {
      const response = await fetch(`${API_URL}/api/v1/matches/${MatchId}/match_sessions/${matchSession.id}/submit_scramble`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          winner_id: winnerMomentId,
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.completed) {
          setMatchSession({ ...matchSession, completed: true }); // Mark scramble as complete
          setLeagueTableEntries(data.league_table_entries); // Set league table entries
        } else {
          opacityValue.setValue(1); // Reset opacity value
          console.log('data.next_duel:', data.next_duel);
          setCurrentPair([data.next_duel[0], data.next_duel[1]]); // Load the next scramble pair
          setIsFirstVideoPlaying(true);
          setIsSecondVideoPlaying(false);
          showLoadingScreen();
        }
      } else {
        console.error('Failed to submit scramble:', data.error);
      }
    } catch (error) {
      console.error('Error submitting scramble:', error);
    }
  };

  const startMatchSession = () => {
    axios.post(`${API_URL}/api/v1/matches/create_scramble_match`)
    .then(response => {
      const matchSession = response.data.match_session;
      console.log('Match session:', matchSession);
      setMatchId(matchSession.match_id);
      setMatchSession(matchSession);
      setCurrentPair([matchSession.remaining_moments[0][0], matchSession.remaining_moments[0][1]]); // First scramble pair
      setIsLoading(false);
    })
    .catch(error => {
      console.error('There was an error fetching the match details!', error);
    });
  };

  const showLoadingScreen = () => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  const vibrate = (style) => {
    Haptics.impactAsync(style);
  };

  const renderGoatAction = () => {
    return( 
      <View style={styles.SwipeAction} />
    )
  };

  const handleSwipeableOpen = (winnerMomentId, loserMomentId) => {
    vibrate(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      vibrate(Haptics.ImpactFeedbackStyle.Medium);
      submitWinner(winnerMomentId);
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
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
              onSwipeableOpen={() => handleSwipeableOpen(currentPair[0].id, currentPair[1].id)}
            >
              <Animated.View style={[styles.videoContainer, { opacity: opacityValue }]}>
                <Video
                  ref={videoRef1}
                  source={{ uri: currentPair[0].videoUrl }}
                  rate={1.1}
                  isMuted={false}
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
              onSwipeableOpen={() => handleSwipeableOpen(currentPair[1].id, currentPair[0].id)}
            >
              <Animated.View style={[styles.videoContainer, { opacity: opacityValue }]}>
                <Video
                  ref={videoRef2}
                  source={{ uri: currentPair[1].videoUrl }}
                  rate={1.1}
                  isMuted={false}
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

export default ScrambleMatchScreen;