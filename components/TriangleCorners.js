// components/TriangleCorners.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const TriangleCornerTopRight = () => {
  return (
    <View style={styles.triangleTopRight}>
      <View style={styles.rectangleTopRight} />
    </View>
  );
};

const TriangleCornerBottomLeft = () => {
  return (
    <View style={styles.triangleBottomLeft}>
      <View style={styles.rectangleBottomLeft} />
    </View>
  );
};

const styles = StyleSheet.create({
  triangleTopRight: {
    borderWidth: 1,
    width: width,
    height: height,
    overflow: 'hidden'
  },
  rectangleTopRight: {
    position: 'absolute', 
    bottom: 100, 
    left: 0 + (width * .25), 
    width: (width * .75), 
    height: (height / 2), 
    transform: [{ rotate: '35deg' }]
  },
  triangleBottomLeft: {
    borderWidth: 1,
    width: width,
    height: height,
    overflow: 'hidden'
  },
  rectangleBottomLeft: {
    position: 'absolute', 
    top: 100, 
    right: 0 + (width * .25), 
    width: (width * .75), 
    height: (height / 2), 
    transform: [{ rotate: '35deg' }] 
  },
});

export { TriangleCornerTopRight, TriangleCornerBottomLeft };