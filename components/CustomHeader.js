// components/CustomHeader.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomHeader = ({ fontSize, color }) => {
  return (
    <Text style={[styles.header, { fontFamily: 'RobotoCondensed_700Bold', fontSize, color }]}>
      Mano <Text style={styles.a}>a</Text> Mano
    </Text>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  a: {
    color: 'tomato',
  },
});

export default CustomHeader;