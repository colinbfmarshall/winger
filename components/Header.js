import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

const Header = ({ fontSize, fontColor, stopColor, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.header, { fontFamily: 'RobotoCondensed_700Bold', fontSize, color: fontColor }]}>
        G<Text style={[styles.stop, { color: stopColor }]}>.</Text>O<Text style={[styles.stop, { color: stopColor }]}>.</Text>A<Text style={[styles.stop, { color: stopColor }]}>.</Text>T<Text style={[styles.stop, { color: stopColor }]}></Text>
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
  },
  stop: {
    // Default color if stopColor prop is not provided
    color: '#333333',
  },
});

export default Header;