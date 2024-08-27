// components/SportButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ICON_SIZE = 24;

const SportButton = ({ sport, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={[styles.text, { fontFamily: 'RobotoCondensed_400Regular' }]}>Click  </Text>
      <MaterialIcons name={icon} size={ICON_SIZE} style={styles.icon} />
      <Text style={[styles.text, { fontFamily: 'RobotoCondensed_400Regular' }]}> for {sport}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  icon: {
    marginBottom: 14,
    color: 'tomato',
  },
});

export default SportButton;