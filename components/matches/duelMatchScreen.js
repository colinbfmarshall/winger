import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import ResultsTable from './resultsTable';
import DuelResultsTable from './duelResultsTable';
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
  const spinValue = useRef(new Animated.Value(0)).current;

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
    startSpinAnimation();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  const startSpinAnimation = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000, // Slow down the rotation
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Hard);
  };

  const renderGoatAction = () => {
    return( 
      <View style={styles.SwipeAction} />
    )
  };

  if (isPreviewScreen) {
    if (!matchSession || !matchSession.remaining_moments) {
      return <Text style={{}}></Text>;
    } 

    const flattenedData = matchSession.remaining_moments.flat();

    // Filter unique moments based on their ID
    const uniqueMoments = Array.from(new Set(flattenedData.map(moment => moment.id)))
      .map(id => {
        return flattenedData.find(moment => moment.id === id);
      });

    const momentsColumns = [
      {
        label: 'player',
        accessor: 'playerName',
        render: (row) => `${row.player}`,
        style: { textAlign: 'left', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
      },
      {
        label: 'opposition',
        accessor: 'playerOpposition',
        render: (row) => `${row.opposition}`,
        style: { textAlign: 'left', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
      },
      {
        label: 'date',
        accessor: 'player1Date',
        render: (row) => `${row.date}`,
        style: { textAlign: 'center', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
      },
    ];

    const getLastName = (fullName) => {
      const parts = fullName.split(' ');
      return parts[parts.length - 1];
    };

    return (
      <ScrollView contentContainerStyle={styles.preview}>
        <Text style={[styles.previewTitle, { fontFamily: 'RobotoCondensed_700Bold' }]}>{match.name}</Text>
        <ResultsTable
          title="Moments" 
          columns={momentsColumns}
          data={uniqueMoments}
        />

        <View style={styles.howToPlay}>
          <Text style={styles.row}>
            <Text style={styles.strong}>How to Play:</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>1. Watch the Moments:</Text> Two iconic sports moments will play back-to-back.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>2. Pick Your Favorite:</Text> Swipe on the moment you prefer to cast your vote.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>3. Find the GOAT:</Text> Decide the GOAT moment by voting in all head-to-head matchups.
          </Text>
          <Text style={styles.row}>
            It’s that simple—watch, swipe, and crown your champion!
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => startMatchSession()}>
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (isLoading) {
    return ( 
      <View style={styles.SwipeAction}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons name='goat' size={70} color={'tomato'} style={styles.icon} />
        </Animated.View>
      </View>
    )
  }

  if (duelComplete) {
    return (
      <View style={styles.fullScreen}>
        <DuelResultsTable title={'Your Results'} leagueTableEntries={leagueTableEntries} />
        <DuelResultsTable title={'Global Results'} leagueTableEntries={globalLeagueTableEntries} />
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
                vibrate();
                submitWinner(currentPair[0].id); // Submit the winner's ID
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
                    }
                  }}
                  resizeMode='stretch'
                  style={styles.topVideo}
                  />
                </View>
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
                onSwipeableOpen={(direction) => {
                  vibrate();
                  submitWinner(currentPair[1].id); // Submit the winner's ID
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
  preview: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  previewTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    color: '#333333', // Dark gray text
  },
  howToPlay: {
    textAlign: 'left',
    fontSize: 8,
    fontFamily: 'Roboto_400Regular',
    padding: 10,
    color: '#333333', // Dark gray text
    backgroundColor: 'tomato', // Slightly lighter gray background

  },
  row: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DuelMatchScreen;