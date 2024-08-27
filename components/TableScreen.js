// components/TableScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TableScreen = ({ route }) => {
  const { sport } = route.params;
  return (
    <View style={[styles.container, styles.screenBackground]}>
      <Text>{`${sport.charAt(0).toUpperCase() + sport.slice(1)} Rankings Table`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenBackground: {
    backgroundColor: 'white',
  },
});

export default TableScreen;