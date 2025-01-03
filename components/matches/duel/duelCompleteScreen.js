import React from 'react';
import { View, StyleSheet } from 'react-native';
import DuelResultsTable from './duelResultsTable';

const DuelComplete = ({ leagueTableEntries, globalLeagueTableEntries }) => {
  return (
    <View style={styles.fullScreen}>
      <DuelResultsTable title={'Your Results'} leagueTableEntries={leagueTableEntries} />
      <DuelResultsTable title={'Global Results'} leagueTableEntries={globalLeagueTableEntries} />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
});

export default DuelComplete;