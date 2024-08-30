import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import axios from 'axios';

const STATUSBAR_HEIGHT = Constants.statusBarHeight;

const API_URL = __DEV__ 
  ? 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const DuelScreen = ({ route }) => {
  const { sport, topicValue } = route.params;

  const [duels, setDuels] = useState([]);
  const [duelSessionId, setDuelSessionId] = useState(null);
  const [view, setView] = useState('initial');
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  useEffect(() => {
    startDuelSession(topicValue);
  }, [topicValue]);

  const startDuelSession = (topicValue) => {
    console.log('Starting duel session with topic value:', topicValue);
    axios.post(`${API_URL}/api/v1/duel_sessions/start`, {
      topic_type: "action",
      topic_value: 'try',
    })
    .then(response => {
      console.log('Duel session started:', response.data);
      setDuels(response.data.duels);
      setDuelSessionId(response.data.duel_session_id);
      setView('newDuel');
    })
    .catch(error => {
      console.error('There was an error starting the duel session!', error);
    });
  };

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const onSwipeLeft = () => {
    vibrate();
    submitWinner(duels[1].id);
  };

  const onSwipeRight = () => {
    vibrate();
    submitWinner(duels[0].id);
  };

  const submitWinner = (winnerId) => {
    axios.post(`${API_URL}/api/v1/duels/submit`, {
      winner_id: winnerId,
      moment1_id: duels[0].id,
      moment2_id: duels[1].id,
      duel_session_id: duelSessionId,
    })
    .then(response => {
      console.log('Duel result submitted:', response.data);
      if (response.data.status === 'completed') {
        onComplete();
      } else if (response.data.duels) {
        setDuels(response.data.duels);
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

  const renderRightActions = () => {
    return <View style={styles.rightSwipeAction} />;
  };

  const renderLeftActions = () => {
    return <View style={styles.leftSwipeAction} />;
  };

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={[styles.container, styles.screenBackground]}>
        <Text style={styles.title}>{`${sport.charAt(0).toUpperCase() + sport.slice(1)} Duel`}</Text>
        {duels.length > 0 && (
          <>
            <Swipeable
              key={duels[0].id}
              ref={swipeableRef1}
              friction={1}
              leftThreshold={10}
              rightThreshold={10}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                  onSwipeRight();
                }
              }}
            >
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef1}
                  source={{ uri: duels[0].videoUrl }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={true}
                  shouldPlay={isFirstVideoPlaying}
                  isLooping={false}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                      setIsFirstVideoPlaying(false);
                      setIsSecondVideoPlaying(true);
                    }
                  }}
                  onPress={() => {
                    console.log('Replaying video 1');
                    videoRef1.current.replayAsync();
                  }}
                  style={styles.topVideo}
                />
              </View>
            </Swipeable>
            <View style={styles.infoContainer}>
              <Text style={styles.player}>{duels[0].player} vs {duels[1].player}</Text>
              <Text style={styles.details}>{duels[0].team} v {duels[0].opposition}</Text>
              <Text style={styles.details}>{duels[0].competition}</Text>
            </View>
            <Swipeable
              key={duels[1].id}
              ref={swipeableRef2}
              friction={1}
              leftThreshold={10}
              rightThreshold={10}
              renderLeftActions={renderLeftActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                  onSwipeLeft();
                }
              }}
            >
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef2}
                  source={{ uri: duels[1].videoUrl }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={true}
                  shouldPlay={isSecondVideoPlaying}
                  isLooping={false}
                  onPress={() => {
                    videoRef2.current.replayAsync();
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
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: Dimensions.get('window').height * 0.2,
    marginBottom: Dimensions.get('window').height * 0.2,
  },
  screenBackground: {
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
  },
  rightSwipeAction: {
    flex: 1,
    backgroundColor: 'white',
  },
  leftSwipeAction: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 4, // 40% of the safe area
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    borderBottomColor: 'tomato',
    borderBottomWidth: 1,
  },
  bottomVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    borderTopColor: 'tomato',
    borderTopWidth: 1,
  },
  infoContainer: {
    flex: 2, // 20% of the safe area
    width: Dimensions.get('window').width,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 10,
  },
});

export default DuelScreen;