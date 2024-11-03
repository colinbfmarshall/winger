import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DuelResultsTable = ({ title, leagueTableEntries }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Rank</Text>
          <Text style={[styles.tableHeaderText, { fontFamily: 'RobotoCondensed_700Bold' }]}>Player</Text>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Duels</Text>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Wins</Text>
        </View>
        {leagueTableEntries.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{index + 1}</Text>
            <Text style={[styles.tableCellString, { fontFamily: 'Roboto_400Regular' }]}>{`${row.moment.player} vs ${row.moment.opposition}`}</Text>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{row.duel_wins + row.duel_losses}</Text>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{row.duel_wins}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  screenBackground: {
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    color: '#333333', // Dark gray text
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333', // Dark gray background
    borderBottomWidth: 2,
    borderBottomColor: 'tomato',
    borderColor: '#333333',
    color: '#f5f5f5', // Light gray text
  },
  tableHeaderInteger: {
    width: 50,
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    color: '#f5f5f5', // Light gray text
  },
  tableHeaderText: {
    flex: 1,
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 14,
    color: '#f5f5f5', // Light gray text
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: '#ddd',
  },
  tableCellInteger: {
    width: 50,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333333', // Dark gray text
  },
  tableCellString: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333333', // Dark gray text
  },
});

export default DuelResultsTable;