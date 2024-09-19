// components/Header.js
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Header = ({ fontSize, color }) => {
  return (
    <Text style={[styles.header, { fontFamily: 'RobotoCondensed_700Bold', fontSize, color }]}>
      G<Text style={styles.a}>.</Text>O<Text style={styles.a}>.</Text>A<Text style={styles.a}>.</Text>T<Text style={styles.a}></Text>
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

export default Header;