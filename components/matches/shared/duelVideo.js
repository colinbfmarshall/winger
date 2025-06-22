import React from 'react';
import { Video } from 'expo-av';

const DuelVideo = ({ videoUrl, isPlaying, onPlaybackStatusUpdate, style }) => {
  return (
    <Video
      source={{ uri: videoUrl }}
      rate={1.1}
      isMuted={false}
      shouldPlay={isPlaying}
      isLooping={false}
      useNativeControls
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      resizeMode="stretch"
      style={[{ width: '100%', height: '100%', }]}
    />
  );
};

export default DuelVideo;