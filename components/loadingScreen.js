import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const LoadingScreen = () => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startSpinAnimation = () => {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000, // Slow down the rotation
          useNativeDriver: true,
        })
      ).start();
    };

    startSpinAnimation();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.SwipeAction}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialIcons name='goat' size={70} color={'tomato'} style={styles.icon} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  SwipeAction: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // Add any additional styles for the icon here
  },
});

export default LoadingScreen;