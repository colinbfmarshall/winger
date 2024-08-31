import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const DuelInfo = ({ duels }) => {
  return (
    <View style={styles.infoContainer}>
      <Text style={styles.details}>
        {duels[0].player} <Text style={styles.smallItalic}>(against {duels[0].opposition} {duels[0].season})</Text>
      </Text>
      <Text style={styles.vs}>vs</Text>
      <Text style={styles.details}>
        {duels[1].player} <Text style={styles.smallItalic}>(against {duels[1].opposition} {duels[1].season})</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  smallItalic: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'white',
  },
  vs: {
    color: 'tomato',
  },
});

export default DuelInfo;