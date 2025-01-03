import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import DuelMatchScreen from './duelMatchScreen';
import RateMatchScreen from './rateMatchScreen';
import HigherLowerMatchScreen from './higherLowerMatchScreen';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const MatchSessionScreen = ({  match }) => {
  const [matchSession, setMatchSession] = useState(null);

  useEffect(() => {
    if (match) {
      axios.post(`${API_URL}/api/v1/matches/${match.id}/match_sessions`)
        .then(response => {
          const session = response.data.match_session;
          setMatchSession(session);
        })
        .catch(error => {
          console.error('There was an error fetching the match details!', error);
        });
    }
  }, [match]);

  if (!match) {
    return <Text>No match selected</Text>;
  }

  if (match.match_type === 'duel') {
    return <DuelMatchScreen match={match} matchSession={matchSession} />;
  }

  if (match.match_type === 'rate') {
    return <RateMatchScreen match={match} matchSession={matchSession} />;
  }

  if (match.match_type === 'higher_lower') {
    return <HigherLowerMatchScreen match={match} matchSession={matchSession} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MatchSession</Text>
      <Text><strong>Name:</strong> {match.name}</Text>
      <Text><strong>Type:</strong> {match.match_type}</Text>
      <Text><strong>Sport:</strong> {match.sport}</Text>
      <Text><strong>Size:</strong> {match.moment_group_size}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default MatchSessionScreen;