// components/DuelScreen.js
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { TriangleCornerTopRight, TriangleCornerBottomLeft } from './TriangleCorners';
import Constants from 'expo-constants';

const STATUSBAR_HEIGHT = Constants.statusBarHeight


const DuelScreen = ({ route }) => {
  const { sport } = route.params;

  const swipeableRef1 = useRef(null);
  const swipeableRef2 = useRef(null);

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const onSwipeLeft = () => {
    vibrate();
    // Handle left swipe action
  };

  const onSwipeRight = () => {
    vibrate();
    // Handle right swipe action
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
        <Swipeable
          ref={swipeableRef1}
          friction={1}
          leftThreshold={30}
          rightThreshold={30}
          renderRightActions={renderRightActions}
          onSwipeableOpen={(direction) => {
            if (direction === 'right') {
              onSwipeRight();
            }
          }}
        >
          <TriangleCornerTopRight />
        </Swipeable>
        <Swipeable
          ref={swipeableRef2}
          friction={1}
          leftThreshold={30}
          rightThreshold={30}
          renderLeftActions={renderLeftActions}
          onSwipeableOpen={(direction) => {
            if (direction === 'left') {
              onSwipeLeft();
            }
          }}
        >
          <TriangleCornerBottomLeft />
        </Swipeable>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-30deg' }],
    flexDirection: 'row',
    marginTop: 100 + STATUSBAR_HEIGHT
  },
  screenBackground: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  rightSwipeAction: {
    flex: 1,
    backgroundColor: 'white',
  },
  leftSwipeAction: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default DuelScreen;