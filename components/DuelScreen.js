import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import DuelInfo from './DuelInfo';
import DuelLoadingScreen from './DuelLoadingScreen';

const API_URL = __DEV__ 
  ? 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

// const API_URL = "http://localhost:3000"

const ACTIONS = {
  football: 'goal',
  rugby: 'try',
  golf: 'shot',
};

const DuelScreen = ({ route }) => {
  const { sport } = route.params;

  const [duels, setDuels] = useState([]);
  const [duelSessionId, setDuelSessionId] = useState(null);
  const [view, setView] = useState('initial');
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state


  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    startDuelSession();
  }, [sport]);
  
  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  const startDuelSession = () => {
    // console.log('Starting duel session with parameters:', { sport: sport, action: ACTIONS[sport], player: null });
    axios.post(`${API_URL}/api/v1/duel_sessions/start`, {
      duel_session: {
        action: ACTIONS[sport],
        sport: sport,
        player: null
      }
    })  
    .then(response => {
      const { duel_session_id, duels } = response.data;
      setDuelSessionId(duel_session_id);
      
      setDuels(duels);
      setView('newDuel');
    })
    .catch(error => {
      console.error('There was an error starting the duel session!', error);
    });
  };

  const submitWinner = (winnerId) => {
    setWinnerId(winnerId);
    axios.post(`${API_URL}/api/v1/duels/submit`, {
      winner_id: winnerId,
      moment1_id: duels[0].id,
      moment2_id: duels[1].id,
      duel_session_id: duelSessionId,
    })
    .then(response => {
      if (response.data.status === 'completed') {
        onComplete();
      } else if (response.data.duels) {
        setDuels(response.data.duels);
        setWinnerId(null);
        setIsFirstVideoPlaying(true);
        setIsSecondVideoPlaying(false);  
      } else {
        // Reset the videos if no new duels are returned
        setDuels([]);
        setView('initial');
      }
      // Close the swipeable components
      if (swipeableRef1.current) {
        swipeableRef1.current.close();
      }
      if (swipeableRef2.current) {
        swipeableRef2.current.close();
      }
    })
    .catch(error => {
      console.error('There was an error submitting the duel result!', error);
    });
  };

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Hard);
  };

  // refactor this method to be onSwipe and pass relevant ID
  const onSwipeRightToLeft = () => {
    vibrate();
    submitWinner(duels[1].id);
  };

  const onSwipeLeftToRight = () => {
    vibrate();
    submitWinner(duels[0].id);
  };

  // refactor this method to be renderDuelStats for both
  const renderRightActions = () => {
    return <View style={styles.SwipeAction} />;
  };

  const renderLeftActions = () => {
    return <View style={styles.SwipeAction} />;
  };

  if (isLoading) {
    return <DuelLoadingScreen />; // Use DuelLoadingScreen component
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={styles.container}>
        {duels.length > 0 && (
          <>
            <Swipeable
              key={duels[0].id}
              ref={swipeableRef1}
              friction={2}
              leftThreshold={50}
              rightThreshold={50}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                  onSwipeRightToLeft();
                }
                if (direction === 'left') {
                  onSwipeLeftToRight();
                }
              }}
            >
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef1}
                  source={{ uri: duels[0].videoUrl }}
                  rate={1.0}
                  isMuted={true}
                  shouldPlay={isFirstVideoPlaying}
                  isLooping={false}
                  useNativeControls
                  resizeMode={ResizeMode.STRETCH}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                      videoRef1.current.replayAsync();
                      setIsFirstVideoPlaying(false);
                      setIsSecondVideoPlaying(true);
                    }
                  }}

                  style={styles.topVideo}
                />
              </View>
              <DuelInfo duels={duels} />
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef2}
                  source={{ uri: duels[1].videoUrl }}
                  rate={1.0}
                  isMuted={true}
                  shouldPlay={isSecondVideoPlaying}
                  isLooping={false}
                  useNativeControls
                  resizeMode={ResizeMode.STRETCH}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                      videoRef2.current.replayAsync();
                      setIsSecondVideoPlaying(false);
                      setIsFirstVideoPlaying(false);
                    }
                  }}
                  style={styles.bottomVideo}
                />
              </View>
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
  }
});

export default DuelScreen;