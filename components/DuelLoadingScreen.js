import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const DuelLoadingScreen = ({ duelsRemaining, duels }) => {
  if (!duels || duels.length < 2) {
    return (
      <GestureHandlerRootView style={styles.fullScreen}>
        <View style={styles.container}>
          <Text style={styles.helloWorld}>Swipe 4 Goat</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
        <Text style={styles.details}>{`Rounds Remaining: ${duelsRemaining}`}</Text>
          <Text style={styles.details}>
            {duels[0].player} vs {duels[0].opposition} ({duels[0].date})
          </Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.details}>
            {duels[1].player} vs {duels[1].opposition} ({duels[1].date})
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
    fontFamily: 'RobotoCondensed_700Bold'
  },
  vs: {
    fontSize: 16,
    color: 'tomato',
    fontWeight: 'bold',
    height: 20, // Explicit height
    lineHeight: 20, // Ensure text is vertically centered
    fontFamily: 'RobotoCondensed_700Bold'
  },
});

export default DuelLoadingScreen;