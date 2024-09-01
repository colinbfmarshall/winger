import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const DuelLoadingScreen = () => {
  return (
    
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.details}>
            Swipe right to vote for the top video
          </Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.details}>
            Swipe left to vote for the bottom video
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  )
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
  videoContainer: {
    flex: 2,
  },  
  infoContainer: {
    flex: 2,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    height: 20, // Explicit height
    lineHeight: 20, // Ensure text is vertically centered
  },
  vs: {
    fontSize: 16,
    color: 'tomato',
    fontWeight: 'bold',
    height: 20, // Explicit height
    lineHeight: 20, // Ensure text is vertically centered
  },
});

export default DuelLoadingScreen;