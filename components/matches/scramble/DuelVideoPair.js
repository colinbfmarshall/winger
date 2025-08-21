import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import BottomVideoPreloader from './BottomVideoPreloader';

const DuelVideoPair = ({ 
  topMoment, 
  bottomMoment, 
  onReadyTop, 
  onSwipeTopWins, 
  onSwipeBottomWins 
}) => {
  const [isFirstVideoPlaying, setIsFirstVideoPlaying] = useState(true);
  const [isSecondVideoPlaying, setIsSecondVideoPlaying] = useState(false);
  const [isSecondVideoLoaded, setIsSecondVideoLoaded] = useState(false);
  const [secondVideoThumbnail, setSecondVideoThumbnail] = useState(null);
  const [topVideoReady, setTopVideoReady] = useState(false);
  const [hasNotifiedReady, setHasNotifiedReady] = useState(false);
  const [shouldPreloadBottom, setShouldPreloadBottom] = useState(false);
  
  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);
  const opacityValue = useRef(new Animated.Value(1)).current;

  // Handle when bottom video is preloaded
  const handleBottomVideoReady = () => {
    console.log('Bottom video preloaded and ready');
    setIsSecondVideoLoaded(true);
  };

  // Create video players
  const player1 = useVideoPlayer(topMoment?.video_url || '', player => {
    player.muted = false;
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.timeUpdateEventInterval = 1;
  });

  const player2 = useVideoPlayer(bottomMoment?.video_url || '', player => {
    player.muted = false;
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.timeUpdateEventInterval = 1;
  });

  // Update video sources when moments change
  useEffect(() => {
    const updateVideoSources = async () => {
      if (topMoment && bottomMoment) {
        try {
          // Reset states for new videos
          setTopVideoReady(false);
          setHasNotifiedReady(false);
          setIsSecondVideoLoaded(false);
          setIsFirstVideoPlaying(false);
          setIsSecondVideoPlaying(false);
          setShouldPreloadBottom(false);
          
          console.log('DuelVideoPair: Loading top video only...');
          console.log('Top video URL:', topMoment.video_url);
          
          // Load only the top video initially
          await player1.replaceAsync(topMoment.video_url);
          console.log('Top video loaded successfully');
          setTopVideoReady(true);
          
          // Set thumbnail for bottom video (but don't load the video yet)
          if (bottomMoment.thumbnail_url) {
            setSecondVideoThumbnail(bottomMoment.thumbnail_url);
          } else {
            const thumbnailUrl = `${bottomMoment.video_url}#t=1`;
            setSecondVideoThumbnail(thumbnailUrl);
          }
        } catch (error) {
          console.error('Error updating video sources:', error);
        }
      }
    };

    updateVideoSources();
  }, [topMoment?.video_url, bottomMoment?.video_url, topMoment?.id, bottomMoment?.id]);

  // Notify parent when top video is ready (only once per video)
  useEffect(() => {
    if (topVideoReady && !hasNotifiedReady && onReadyTop) {
      setHasNotifiedReady(true);
      onReadyTop();
    }
  }, [topVideoReady, hasNotifiedReady]);

  // Set up event listeners for video players
  useEffect(() => {
    const timeUpdateListener1 = (event) => {
      const currentTime = event.currentTime;
      if (topMoment?.play_until && currentTime >= topMoment.play_until) {
        console.log(`Top video reached play_until time: ${topMoment.play_until}`);
        player1.pause();
        setIsFirstVideoPlaying(false);
        setIsSecondVideoPlaying(true);
      }
    };

    const playingChangeListener1 = (event) => {
      if (event.reason?.finished) {
        setIsFirstVideoPlaying(false);
        setIsSecondVideoPlaying(true);
      }
    };

    const statusChangeListener1 = ({ status }) => {
      console.log('Top video status changed to:', status);
      if (status === 'readyToPlay' && !topVideoReady) {
        console.log('Top video is now ready to play');
        setTopVideoReady(true);
      }
    };

    const timeUpdateListener2 = (event) => {
      const currentTime = event.currentTime;
      if (bottomMoment?.play_until && currentTime >= bottomMoment.play_until) {
        console.log(`Bottom video reached play_until time: ${bottomMoment.play_until}`);
        player2.pause();
        setIsSecondVideoPlaying(false);
      }
    };

    const playingChangeListener2 = (event) => {
      if (event.reason?.finished) {
        setIsSecondVideoPlaying(false);
      }
    };

    const statusChangeListener2 = ({ status }) => {
      console.log('Bottom video status changed to:', status);
      if (status === 'readyToPlay' && !isSecondVideoLoaded) {
        console.log('Bottom video is now ready to play');
        setIsSecondVideoLoaded(true);
      }
    };

    // Add event listeners
    player1.addListener('timeUpdate', timeUpdateListener1);
    player1.addListener('playingChange', playingChangeListener1);
    player1.addListener('statusChange', statusChangeListener1);
    player2.addListener('timeUpdate', timeUpdateListener2);
    player2.addListener('playingChange', playingChangeListener2);
    player2.addListener('statusChange', statusChangeListener2);

    return () => {
      player1.removeListener('timeUpdate', timeUpdateListener1);
      player1.removeListener('playingChange', playingChangeListener1);
      player1.removeListener('statusChange', statusChangeListener1);
      player2.removeListener('timeUpdate', timeUpdateListener2);
      player2.removeListener('playingChange', playingChangeListener2);
      player2.removeListener('statusChange', statusChangeListener2);
    };
  }, [topMoment?.play_until, bottomMoment?.play_until, topMoment?.id, bottomMoment?.id, topVideoReady, isSecondVideoLoaded]);

  // Handle video playback states
  useEffect(() => {
    if (isFirstVideoPlaying) {
      console.log('Playing top video');
      player1.play();
      player2.pause();
    } else if (isSecondVideoPlaying) {
      console.log('Playing bottom video');
      player1.pause();
      
      // Load bottom video if not already loaded
      if (!isSecondVideoLoaded && bottomMoment) {
        console.log('Loading bottom video for playback:', bottomMoment.video_url);
        player2.replaceAsync(bottomMoment.video_url).then(() => {
          console.log('Bottom video loaded, starting playback');
          player2.play();
        }).catch(error => {
          console.error('Error loading bottom video:', error);
        });
      } else {
        player2.play();
      }
    } else {
      player1.pause();
      player2.pause();
    }
  }, [isFirstVideoPlaying, isSecondVideoPlaying, player1, player2, bottomMoment, isSecondVideoLoaded]);

  // Start playing when component mounts
  useEffect(() => {
    if (topVideoReady) {
      setIsFirstVideoPlaying(true);
    }
  }, [topVideoReady]);

  // Trigger bottom video preloading when top video starts playing
  useEffect(() => {
    if (isFirstVideoPlaying && !shouldPreloadBottom) {
      console.log('Top video started playing, triggering bottom video preload');
      setShouldPreloadBottom(true);
    }
  }, [isFirstVideoPlaying, shouldPreloadBottom]);

  const renderSwipeAction = () => {
    return <View style={styles.swipeAction} />;
  };

  const handleSwipeableOpen = (winnerMoment, onSwipeCallback) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSwipeCallback();
    });
  };

  if (!topMoment || !bottomMoment) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen} testID="duel-video-pair">
      <View style={styles.container}>
        <Swipeable
          key={topMoment.id}
          ref={swipeableRef1}
          containerStyle={{ flex: 1 }}
          friction={2}
          leftThreshold={50}
          rightThreshold={50}
          renderLeftActions={renderSwipeAction}
          renderRightActions={renderSwipeAction}
          onSwipeableOpen={() => handleSwipeableOpen(topMoment, onSwipeTopWins)}
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
          key={bottomMoment.id}
          ref={swipeableRef2}
          containerStyle={{ flex: 1 }}
          friction={2}
          leftThreshold={50}
          rightThreshold={50}
          renderLeftActions={renderSwipeAction}
          renderRightActions={renderSwipeAction}
          onSwipeableOpen={() => handleSwipeableOpen(bottomMoment, onSwipeBottomWins)}
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
      </View>
      
      {/* Preload bottom video while top video is playing */}
      {shouldPreloadBottom && bottomMoment && (
        <BottomVideoPreloader
          key={`bottom-preload-${bottomMoment.id}`}
          bottomMoment={bottomMoment}
          onVideoReady={handleBottomVideoReady}
        />
      )}
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
  swipeAction: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
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
  videoThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default DuelVideoPair;
