import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DuelInfoMess = ({ duel, goat }) => {
  console.log('duel player', duel["player"]);

  return (
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button}>
          <Text style={styles.text}>SWIPE <Text style={styles.four}>RIGHT</Text></Text>
        </Pressable>
      </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd', // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    flex: 1,
    width: '95%',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    // paddingVertical: 10,
    paddingHorizontal: 75,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontFamily: 'RobotoCondensed_700Bold',
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.25,
    color: 'white',
  },
  four: {
    color: 'tomato',
  },
  icon: {
    color: 'tomato',
  },
});

export default DuelInfoMess;