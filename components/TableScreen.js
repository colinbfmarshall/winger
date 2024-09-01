// components/TableScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

// const API_URL = __DEV__ 
//   ? 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com'
//   : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

  const API_URL = "https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com"

const TableScreen = ({ route }) => {
  const { sport } = route.params;

  // Define the actions for each sport
  const ACTIONS = {
    rugby: 'Tries',
    football: 'Goals',
    golf: 'Shots',
  };

  // State to hold the league table data
  const [leagueTable, setLeagueTable] = useState({ name: '', description: '' });
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    // Fetch moments from your API
    axios.get(`${API_URL}/api/v1/league_tables/1`)
      .then(response => {
        const { league_table, moments } = response.data;
        setLeagueTable(league_table);
        setMoments(moments);
      })
      .catch(error => {
        console.error('There was an error fetching the moments!', error);
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{`${sport.charAt(0).toUpperCase() + sport.slice(1)} ${ACTIONS[sport]} Table`}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderInteger}>Rank</Text>
          <Text style={styles.tableHeaderText}>Moment</Text>
          <Text style={styles.tableHeaderInteger}>Duels</Text>
          <Text style={styles.tableHeaderInteger}>Wins</Text>
        </View>
        {moments.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCellInteger}>{row.rank}</Text>
            <Text style={styles.tableCellString}>{`${row["player"]} vs ${row["opposition"]} (2020)`}</Text>
            <Text style={styles.tableCellInteger}>{row.duels}X</Text>
            <Text style={styles.tableCellInteger}>{row.wins}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 8, // Reduced padding
  },
  screenBackground: {
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20, // Reduced font size
    fontWeight: 'bold',
    margin: 20, // Reduced margin
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderBottomWidth: 2,
    borderBottomColor: 'tomato',
    borderColor: 'black',
    color: 'white',
  },
  tableHeaderInteger: {
    width: 50, // Fixed width for integer cells
    padding: 4, // Reduced padding
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14, // Reduced font size
    color: 'white',
  },
  tableHeaderText: {
    flex: 1, // Flex for string cells
    padding: 4, // Reduced padding
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 14, // Reduced font size
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 10, // Reduced padding
    paddingBottom: 10, // Reduced padding
    borderColor: '#ddd', 
  },
  tableCellInteger: {
    width: 50, // Fixed width for integer cells
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10, // Reduced font size
  },
  tableCellString: {
    flex: 1, // Flex for string cells
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 10, // Reduced font size
  },
});

export default TableScreen;