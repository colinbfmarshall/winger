import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import DuelLoadingScreen from '../DuelLoadingScreen';
import { MaterialIcons } from '@expo/vector-icons';
import HigherLowerResultsTable from './higherLowerResultsTable';

const API_URL = __DEV__ 
  ? 'http://192.168.0.68:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const HigherLowerMatchScreen = ({ match }) => {
  const [currentPair, setCurrentPair] = useState([]);
  const [matchSession, setMatchSession] = useState([]);
  const [duelCategory, setDuelCategory] = useState('');
  const [duelComplete, setDuelComplete] = useState(false);
  const [duelWinner, setDuelWinner] = useState('');
  const [duelsRemaining, setDuelsRemaining] = useState(0);
  const [higherLowerResults, setHigherLowerResults] = useState([]);
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [iconColor, setIconColor] = useState('black'); // Add state for icon color

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    if (match) {
      axios.post(`${API_URL}/api/v1/matches/${match.id}/match_sessions`)
        .then(response => {
          const session = response.data.match_session;
          setMatchSession(session);
          setCurrentPair([session.remaining_moments[0].duel_pair[0], session.remaining_moments[0].duel_pair[1]]); // First duel pair
          setDuelCategory(session.remaining_moments[0].category);
          setDuelWinner(session.remaining_moments[0].winning_moment);
          // Calculate the number of duels left
          const remainingDuels = session.remaining_moments.length;
          const completedDuels = session.completed_moments.length;
          setDuelsRemaining(remainingDuels + completedDuels - completedDuels);
          showLoadingScreen();
        })
        .catch(error => {
          console.error('There was an error fetching the match details!', error);
        });
    }
  }, [match]);

  useEffect(() => {
    if (duelComplete) {
      axios.get(`${API_URL}/api/v1/matches/${match.id}`)
        .then(response => {
          // const globalEntries = response.data.league_table_entries;
          // setGlobalLeagueTableEntries(globalEntries);
        })
        .catch(error => {
          console.error('There was an error fetching the global league table entries!', error);
        });
    }
  }, [duelComplete, match]);

  const submitWinner = async (winnerMomentId) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/matches/${match.id}/match_sessions/${matchSession.id}/submit_higher_lower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          selected_moment_id: winnerMomentId,
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Response data:', data);
        if (data.completed) {
          setDuelComplete(true); // Mark duel as complete
          setHigherLowerResults(data.results); // Set league table entries
        } else {
          setMatchSession(data.match_session);
          setCurrentPair([data.match_session.remaining_moments[0].duel_pair[0], data.match_session.remaining_moments[0].duel_pair[1]]); // Load the next duel pair
          setDuelCategory(data.match_session.remaining_moments[0].category);
          setDuelWinner(data.match_session.remaining_moments[0].winning_moment);

          const remainingDuels = data.match_session.remaining_moments.length;
          const completedDuels = data.match_session.completed_moments.length;
          setDuelsRemaining(remainingDuels + completedDuels - completedDuels);

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

  const showLoadingScreen = () => {
    setIsLoading(true);
    setIconColor('black'); // Reset the icon color
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  // Function to provide haptic feedback for correct guess
  const provideCorrectGuessFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Function to provide haptic feedback for incorrect guess
  const provideIncorrectGuessFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleSelectedMoment = (selectedMomentId) => {
    // setDisplayScores(true);

    if (duelWinner === selectedMomentId) {
      provideCorrectGuessFeedback();
    } else {
      provideIncorrectGuessFeedback();
    }
    
    submitWinner(selectedMomentId);
  };

  const renderGoatAction = () => {
    return( 
      <View style={styles.SwipeAction}>
        <MaterialIcons name='goat' size={70} color={'black'} style={styles.icon} />
      </View>
    )
  };

  if (isLoading) {
    return <DuelLoadingScreen duelsRemaining={duelsRemaining} duels={currentPair} />; // Use DuelLoadingScreen component
  }

  if (duelComplete) {
    return (
      <View style={{}}>
        <HigherLowerResultsTable title={'Your Results'} higherLowerResults={higherLowerResults} />
      </View>
    );
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
              onSwipeableOpen={(direction) => {
                handleSelectedMoment(currentPair[0].id); // Submit the winner's ID
              }}
            >
              <View style={styles.videoContainer}>
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
                    } else if (status.isPlaying) {
                      setIconColor('tomato'); // Change icon color when video is playing
                    }
                  }}
                  resizeMode='stretch'
                  style={styles.topVideo}
                />
              </View>
            </Swipeable>

            <Text style={styles.duelCategory}>{duelCategory.replace(/_/g, ' ')}</Text>

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
              onSwipeableOpen={(direction) => {
                handleSelectedMoment(currentPair[1].id); // Submit the winner's ID
              }}
            >
              <View style={styles.videoContainer}>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'white',
  },
  duelCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
});

export default HigherLowerMatchScreen;