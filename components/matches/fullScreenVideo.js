import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { MaterialIcons } from '@expo/vector-icons';

const FullScreenVideo = ({ goatPresent, videos, setInitialVideosPlayed, submitWinner }) => {
  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(goatPresent ? 1 : 0);
  const [shouldPlay, setShouldPlay] = useState(true);

  useEffect(() => {
    if (shouldPlay) {
      videoRef.current.playFromPositionAsync(0); // Ensure the video starts from the beginning
    }
  }, [shouldPlay, currentVideoIndex]);

  const handleVideoEnd = () => {
    if (!goatPresent && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setShouldPlay(false); // Pause before starting the next video
      setTimeout(() => {
        setShouldPlay(true); // Ensure the next video plays
      }, 100); // Small delay to ensure the video starts from the beginning
    } else {
      setShouldPlay(false);
      setInitialVideosPlayed(true);
    }
  };

  const renderGoatAction = () => {
    return (
      <View style={styles.swipeAction}>
        <MaterialIcons name="goat" size={70} color="black" style={styles.icon} />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <Swipeable
        containerStyle={{ flex: 1 }}
        childrenContainerStyle={{ flex: 1 }}
        friction={2}
        leftThreshold={50}
        rightThreshold={50}
        renderLeftActions={renderGoatAction}
        renderRightActions={renderGoatAction}
        onSwipeableOpen={(direction) => {
          submitWinner(videos[currentVideoIndex].id); // Submit the winner's ID
        }}
      >
        <View style={styles.fullScreen}>
          <Video
            ref={videoRef}
            source={{ uri: videos[currentVideoIndex].videoUrl }}
            rate={1.3}
            isMuted={true}
            shouldPlay={shouldPlay}
            useNativeControls
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                console.log('Video playback finished');
                handleVideoEnd();
              }
            }}
            resizeMode={'stretch'}
            style={styles.fullScreenVideo}
          />
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  swipeAction: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FullScreenVideo;