import React from 'react';
import { Dimensions, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import DuelVideo from './duelVideo';

const DuelSwipeable = ({
  video,
  isPlaying,
  onSwipeableOpen,
  onPlaybackStatusUpdate,
  onSwipeableAction,
  opacityValue,
}) => {
  return (
    <Swipeable
      containerStyle={{flex: 1}} // Apply flex: 1 to the container
      childrenContainerStyle={{}} // Apply flex: 1 to the children container
      friction={2}
      leftThreshold={50}
      rightThreshold={50}
      renderLeftActions={onSwipeableAction}
      renderRightActions={onSwipeableAction}
      onSwipeableOpen={onSwipeableOpen}
    >
      <Animated.View style={[{ flex: 4, width: Dimensions.get('window').width, opacity: opacityValue }]}>
        <DuelVideo
          videoUrl={video.videoUrl}
          isPlaying={isPlaying}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
      </Animated.View>
    </Swipeable>
  );
};

export default DuelSwipeable;