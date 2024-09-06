import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const DuelVideo = ({ videoRef, videoUrl, shouldPlay, onPlaybackStatusUpdate }) => {
  return (
    <View style={styles.videoContainer}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        shouldPlay={shouldPlay}
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        style={styles.video}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
});

export default DuelVideo;