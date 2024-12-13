import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const FullScreenVideo = ({ goatPresent, videoUrls, setInitialVideosPlayed }) => {
  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(goatPresent ? 1 : 0);
  const [shouldPlay, setShouldPlay] = useState(true);

  useEffect(() => {
    console.log('FullScreenVideo mounted');
    if (shouldPlay) {
      videoRef.current.playFromPositionAsync(0); // Ensure the video starts from the beginning
    }
  }, [shouldPlay, currentVideoIndex]);

  const handleVideoEnd = () => {
    if (!goatPresent && currentVideoIndex < videoUrls.length - 1) {
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

  return (
    <View style={styles.fullScreen}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrls[currentVideoIndex] }}
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
});

export default FullScreenVideo;