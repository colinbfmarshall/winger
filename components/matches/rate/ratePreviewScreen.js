import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import RateResultsTable from './rateResultsTable';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const RateMatchPreview = ({ match, startMatchSession }) => {
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);

  useEffect(() => {    
    if (match) {
      axios.get(`${API_URL}/api/v1/matches/${match.id}`)
        .then(response => {
          console.log('response.data.league_table_entries:', response.data.league_table_entries);
          const globalEntries = response.data.league_table_entries;
          setGlobalLeagueTableEntries(globalEntries);
        })
        .catch(error => {
          console.error('There was an error fetching the global league table entries!', error);
        });
    }
  }, [match]);

  return (
    <ScrollView contentContainerStyle={styles.preview}>
      <Text style={[styles.previewTitle, { fontFamily: 'RobotoCondensed_700Bold' }]}>{match.name}</Text>
      <RateResultsTable leagueTableEntries={globalLeagueTableEntries} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={startMatchSession}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  previewTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
    color: '#333333', // Dark gray text
  },
  howToPlay: {
    textAlign: 'left',
    fontSize: 8,
    fontFamily: 'Roboto_400Regular',
    padding: 10,
    color: '#333333', // Dark gray text
    backgroundColor: 'tomato', // Slightly lighter gray background
  },
  row: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RateMatchPreview;