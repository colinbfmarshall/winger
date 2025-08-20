import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingScreen from '../../loadingScreen';

const ScrambleMatchScreen = () => {
  console.log('ScrambleMatchScreen');
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [duels, setDuels] = useState([]);
  const [currentDuelIndex, setCurrentDuelIndex] = useState(0);
  const [currentPair, setCurrentPair] = useState([]);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [isSecondVideoLoaded, setIsSecondVideoLoaded] = useState(false);
  const [secondVideoThumbnail, setSecondVideoThumbnail] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Create video players - both with initial sources when available
  const player1 = useVideoPlayer(currentPair[0]?.video_url || '', player => {
    player.muted = false;
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.timeUpdateEventInterval = 1; //< --- this is what you're missing
  });


  const player2 = useVideoPlayer(currentPair[1]?.video_url || '', player => {
    player.muted = false;
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.timeUpdateEventInterval = 1; //< --- this is what you're missing
  });

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startMatchSession();
  }, []);

  // Update video sources and generate thumbnail for second video
  useEffect(() => {
    const updateVideoSources = async () => {
      if (currentPair.length > 0) {
        try {
          // Always load the first video immediately
          await player1.replaceAsync(currentPair[0].video_url);
          console.log('First video loaded successfully');
          
          // Load second video source but don't start playing yet
          await player2.replaceAsync(currentPair[1].video_url);
          setIsSecondVideoLoaded(true);
          console.log('Second video loaded successfully');
          
          // Set thumbnail from backend if available
          if (currentPair[1].thumbnail_url) {
            setSecondVideoThumbnail(currentPair[1].thumbnail_url);
          } else {
            // Generate thumbnail URL by appending a query parameter for first frame
            const thumbnailUrl = `${currentPair[1].video_url}#t=1`;
            setSecondVideoThumbnail(thumbnailUrl);
          }
        } catch (error) {
          console.error('Error updating video sources:', error);
        }
      }
    };

    updateVideoSources();
  }, [currentPair, player1, player2]);

  // Set up event listeners for video players
  useEffect(() => {
    const timeUpdateListener1 = (event) => {
      const currentTime = event.currentTime;
      console.log(`Video 1 timeUpdate: ${currentTime}s, play_until: ${currentPair[0]?.play_until}`);
      if (currentPair[0]?.play_until && currentTime >= currentPair[0].play_until) {
        console.log(`First video reached play_until time: ${currentPair[0].play_until}`);
        player1.pause();
        setIsFirstVideoPlaying(false);
        setIsSecondVideoPlaying(true);
      }
    };

    const playingChangeListener1 = (event) => {
      console.log('Player1 playingChange via EventListener:', { 
        isPlaying: event.isPlaying, 
        oldIsPlaying: event.oldIsPlaying,
        reason: event.reason 
      });
      if (event.reason?.finished) {
        setIsFirstVideoPlaying(false);
        setIsSecondVideoPlaying(true);
      }
    };

    const timeUpdateListener2 = (event) => {
      const currentTime = event.currentTime;
      console.log(`Video 2 timeUpdate: ${currentTime}s, play_until: ${currentPair[1]?.play_until}`);
      if (currentPair[1]?.play_until && currentTime >= currentPair[1].play_until) {
        console.log(`Second video reached play_until time: ${currentPair[1].play_until}`);
        player2.pause();
        setIsSecondVideoPlaying(false);
        setIsFirstVideoPlaying(false);
      }
    };

    const playingChangeListener2 = (event) => {
      console.log('Player2 playingChange via EventListener:', { 
        isPlaying: event.isPlaying, 
        oldIsPlaying: event.oldIsPlaying,
        reason: event.reason 
      });
      if (event.reason?.finished) {
        setIsSecondVideoPlaying(false);
        setIsFirstVideoPlaying(false);
      }
    };

    // Add event listeners
    player1.addListener('timeUpdate', timeUpdateListener1);
    player1.addListener('playingChange', playingChangeListener1);
    player2.addListener('timeUpdate', timeUpdateListener2);
    player2.addListener('playingChange', playingChangeListener2);

    // Cleanup function to remove event listeners
    return () => {
      player1.removeListener('timeUpdate', timeUpdateListener1);
      player1.removeListener('playingChange', playingChangeListener1);
      player2.removeListener('timeUpdate', timeUpdateListener2);
      player2.removeListener('playingChange', playingChangeListener2);
    };
  }, [currentPair, player1, player2]);

  // Handle video playback states
  useEffect(() => {
    console.log('Video playback state changed:', { isFirstVideoPlaying, isSecondVideoPlaying });
    
    if (isFirstVideoPlaying) {
      console.log('Playing first video');
      console.log('Current pair data:', currentPair[0]);
      player1.play();
      player2.pause();
    } else if (isSecondVideoPlaying) {
      console.log('Playing second video');
      console.log('Current pair data:', currentPair[1]);
      player1.pause();
      player2.play();
    } else {
      console.log('Pausing both videos');
      player1.pause();
      player2.pause();
    }
  }, [isFirstVideoPlaying, isSecondVideoPlaying, player1, player2]);

  const submitWinner = async (winnerMomentId) => {
    console.log('submitWinner', winnerMomentId);
    showLoadingScreen();
    try {
      const currentDuel = duels[currentDuelIndex];
      // Note: Using sessionId as both matchId and sessionId for now
      // This may need adjustment based on your Rails API structure
      const response = await apiService.submitScramble(sessionId, sessionId, winnerMomentId);
  
      if (response.success) {
        const data = response.data;
        if (data.completed) {
          // Mark scramble as complete
          setIsLoading(false);
          setLeagueTableEntries(data.league_table_entries); // Set league table entries if available
        } else {
          // Move to next duel
          const nextIndex = currentDuelIndex + 1;
          if (nextIndex < duels.length) {
            console.log(`Moving to duel ${nextIndex + 1} of ${duels.length}`);
            opacityValue.setValue(1); // Reset opacity value
            setCurrentDuelIndex(nextIndex);
            const nextDuel = duels[nextIndex];
            console.log('Next duel moments:', {
              moment1: nextDuel.moment1.title,
              moment1_play_until: nextDuel.moment1.play_until,
              moment2: nextDuel.moment2.title,
              moment2_play_until: nextDuel.moment2.play_until
            });
            setCurrentPair([nextDuel.moment1, nextDuel.moment2]);
            setIsFirstVideoPlaying(true);
            setIsSecondVideoPlaying(false);
            setIsSecondVideoLoaded(false); // Reset for loading state
            showLoadingScreen();
          } else {
            // No more duels, scramble is complete
            console.log('All duels completed successfully');
            setIsLoading(false);
            console.log('All duels completed');
          }
        }
      } else {
        console.error('Failed to submit scramble:', response.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error submitting scramble:', error);
      setIsLoading(false);
    }
  };

  const startMatchSession = () => {
    const createScrambleMatch = async () => {
      // Check authentication before making API call
      if (!isAuthenticated) {
        console.error('User not authenticated, cannot create scramble match');
        setIsLoading(false);
        return;
      }
      
      console.log('User authenticated, creating scramble match for user:', user?.id);
      const response = await apiService.createScrambleMatch();
      console.log('Response from createScrambleMatch:', response);
      
      if (response.success) {
        const { duels, session_id, sport, total_rounds, expires_at } = response.data;
        console.log('Scramble session created:', { session_id, sport, total_rounds, expires_at });
        console.log('Duels received:', duels.length);
        
        // Set up the session
        setSessionId(session_id);
        setDuels(duels);
        setCurrentDuelIndex(0);
        
        // Set up the first duel pair
        if (duels.length > 0) {
          const firstDuel = duels[0];
          console.log('first moment:', firstDuel.moment1
          );
          console.log('First duel moments:', {
            moment1: firstDuel.moment1.title,
            moment1_play_until: firstDuel.moment1.play_until,
            moment2: firstDuel.moment2.title,
            moment2_play_until: firstDuel.moment2.play_until
          });
          setCurrentPair([firstDuel.moment1, firstDuel.moment2]);
        } else {
          console.warn('No duels received from server');
        }
        
        setIsLoading(false);
      } else {
        console.error('There was an error creating the scramble match!', response.error);
        setIsLoading(false);
      }
    };

    createScrambleMatch();
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

  // Show loading screen while authentication is loading
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show error message if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication required</Text>
      </View>
    );
  }

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
                <VideoView
                  player={player1}
                  style={styles.topVideo}
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                  contentFit="fill"
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
                <VideoView
                  player={player2}
                  style={styles.bottomVideo}
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                  contentFit="fill"
                />
                {!isSecondVideoLoaded && secondVideoThumbnail && (
                  <Image 
                    source={{ uri: secondVideoThumbnail }}
                    style={styles.videoThumbnail}
                    resizeMode="cover"
                  />
                )}
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
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  videoLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoThumbnail: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  videoLoadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScrambleMatchScreen;