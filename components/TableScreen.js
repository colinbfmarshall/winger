import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

const API_URL = __DEV__ 
  ? 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

// const API_URL = "http://localhost:3000"

const TableScreen = ({ route }) => {
  const { sport } = route.params;

  // Define the actions for each sport
  const DISPLAY_ACTIONS = {
    rugby: 'Tries',
    football: 'Goals',
    golf: 'Shots',
  };

  const ACTIONS = {
    football: 'goal',
    rugby: 'try',
    golf: 'shot',
  };

  // State to hold the league table data
  const [leagueTable, setLeagueTable] = useState({ name: '', description: '' });
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    // Fetch moments from league_table from your API
    console.log('Starting duel session with parameters:', { sport: sport, action: ACTIONS[sport], player: null });
    axios.get(`${API_URL}/api/v1/league_tables`, {
      params: {
        sport_action: ACTIONS[sport],
        sport: sport,
        player: null
      }
    })
      .then(response => {
        const { league_table, moments } = response.data;
        console.log('response',response.data)
        console.log('league table',league_table)
        setLeagueTable(league_table);
        setMoments(moments);
      })
      .catch(error => {
        console.error('There was an error fetching the moments!', error);
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>{`${sport.charAt(0).toUpperCase() + sport.slice(1)} ${DISPLAY_ACTIONS[sport]} Table`}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Rank</Text>
          <Text style={[styles.tableHeaderText, { fontFamily: 'RobotoCondensed_700Bold' }]}>Moment</Text>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Duels</Text>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Wins</Text>
        </View>
        {moments.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{row.rank}</Text>
            <Text style={[styles.tableCellString, { fontFamily: 'Roboto_400Regular' }]}>{`${row["player"]} vs ${row["opposition"]} (${row["date"]})`}</Text>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{row.duels}</Text>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{row.wins}</Text>
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

export default TableScreen;