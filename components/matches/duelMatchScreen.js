import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import DuelLoadingScreen from '../DuelLoadingScreen';
import DuelResultsTable from './duelResultsTable';
import FullScreenVideo from './fullScreenVideo';
import ResultsTable from './resultsTable';
import { prepareUIRegistry } from 'react-native-reanimated/lib/typescript/frameCallback/FrameCallbackRegistryUI';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const DuelMatchScreen = ({ match, matchSession }) => {
  const [currentPair, setCurrentPair] = useState([]);
  const [duelComplete, setDuelComplete] = useState(false);
  const [duelsRemaining, setDuelsRemaining] = useState(0);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);
  const [goatPresent, setGoatPresent] = useState(false); // Track if the goat is present
  const [initialVideosPlayed, setInitialVideosPlayed] = useState(false); // Track if the initial videos have been played

  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    if (matchSession) {
      console.log('Match:', match);
      console.log('Match session:', matchSession.remaining_moments);
      setCurrentPair([matchSession.remaining_moments[0][0], matchSession.remaining_moments[0][1]]); // First duel pair
      // Calculate the number of duels left
      const remainingDuels = matchSession.remaining_moments.length;
      const completedDuels = matchSession.completed_moments.length;
      setDuelsRemaining(remainingDuels + completedDuels - completedDuels);
      showPreviewScreen();
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
    console.log('Submitting winner:', winnerMomentId);
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
          const remainingDuels = data.match_session.remaining_moments.length;
          const completedDuels = data.match_session.completed_moments.length;
          setDuelsRemaining(remainingDuels + completedDuels - completedDuels);
          setGoatPresent([data.next_duel[0].id, data.next_duel[1].id].includes(winnerMomentId)); // Set goat presence
          setInitialVideosPlayed(false)
          // showLoadingScreen();
        }
      } else {
        console.error('Failed to submit duel:', data.error);
      }
    } catch (error) {
      console.error('Error submitting duel:', error);
    }
  };

  const showPreviewScreen = () => {
    setIsLoading(true);
    
    // const timer = setTimeout(() => {
    //   setIsLoading(false);
    // }, 5000);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Hard);
  };

  const renderGoatAction = () => {
    return( 
      <View style={styles.SwipeAction} />
    )
  };


  if (isLoading) {
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
        style: { textAlign: 'center', fontSize: 12, flex: 1 }, // Custom style for this column
      },
      {
        label: 'opposition',
        accessor: 'playerOpposition',
        render: (row) => `${row.opposition}`,
        style: { textAlign: 'center', fontSize: 12, flex: 1 }, // Custom style for this column
      },
      {
        label: 'date',
        accessor: 'player1Date',
        render: (row) => `${row.date}`,
        style: { textAlign: 'center', fontSize: 12, flex: 1 }, // Custom style for this column
      },
    ];

    const getLastName = (fullName) => {
      const parts = fullName.split(' ');
      return parts[parts.length - 1];
    };

    const roundsColumns = [
      {
        label: 'moment 1',
        accessor: 'player1',
        render: (row) => `${getLastName(row[0].player)} (${row[0].opposition})`,
        style: { textAlign: 'right', fontSize: 12, flex: 1 }, // Custom style for this column
      },
      {
        label: '',
        accessor: 'player2',
        render: (row) => '-',
        style: { textAlign: 'center', width: 50 }, // Custom style for this column
      },
      {
        label: 'moment 2',
        accessor: 'player2',
        render: (row) => `${getLastName(row[1].player)} (${row[1].opposition})`,
        style: { textAlign: 'left', fontSize: 12, flex: 1 }, // Custom style for this column
      },
    ];

    return (
      <ScrollView style={styles.preview}>
        <Text style={[styles.previewTitle, { fontFamily: 'RobotoCondensed_700Bold' }]}>{match.name}</Text>
        <Text style={[styles.previewP, { fontFamily: 'Roboto_400Regular' }]}>Swipe on your favourite to choose the winner</Text>
        <ResultsTable
          title="Moments"
          columns={momentsColumns}
          data={uniqueMoments}
        />

        <ResultsTable
          title="Rounds"
          columns={roundsColumns}
          data={matchSession.remaining_moments}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setIsLoading(false)}>
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (!initialVideosPlayed) {
    return (
      <View style={styles.fullScreen}>
        <FullScreenVideo
          goatPresent={goatPresent}
          videos={[currentPair[0], currentPair[1]]}
          setInitialVideosPlayed={setInitialVideosPlayed}
          submitWinner={submitWinner} // Pass the submitWinner function
        />
      </View>      
    );
  }

  if (duelComplete) {
    return (
      <View style={{}}>
        <DuelResultsTable title={'Your Results'} leagueTableEntries={leagueTableEntries} />
        <DuelResultsTable title={'Global Results'} leagueTableEntries={globalLeagueTableEntries} />
      </View>
    );
  }

  if (initialVideosPlayed) {
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
                  isLooping={false}
                  useNativeControls
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
                  isLooping={false}
                  useNativeControls
                  resizeMode='stretch'
                  style={styles.bottomVideo}
                />
              </View>
            </Swipeable>
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );}
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

  },
  previewTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 40,
    color: '#333333', // Dark gray text
  },
  previewP: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#333333', // Dark gray text
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DuelMatchScreen;