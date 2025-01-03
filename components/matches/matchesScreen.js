import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import MatchSessionScreen from './matchSessionScreen'; // Import MatchSessionScreen

const API_URL = __DEV__ 
? 'http://localhost:3000'
: 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const MatchesScreen = ({ route }) => {
  const { match_type } = route.params;
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null); // State to track selected match

  useEffect(() => {
    // Fetch matches from your API
    axios.get(`${API_URL}/api/v1/matches`, { params: { match_type } })
      .then(response => {
        console.log('Matches fetched successfully!', response.data);
        setMatches(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the matches!', error);
      });
  }, [match_type]);

  const handleSelectMatch = (match) => {
    console.log('Match selected:', match);
    setSelectedMatch(match); // Set the selected match
  };

  if (selectedMatch) {
    // Render MatchSessionScreen if a match is selected
    return <MatchSessionScreen match={selectedMatch} />;
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectMatch(item)}>
      <Text style={[styles.itemText, styles.name]}>{item.name}</Text>
      <Text style={[styles.itemText, styles.momentGroupSize]}>{item.sport}</Text>
      <Text style={[styles.itemText, styles.momentGroupSize]}>{item.moment_group_size}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{match_type.charAt(0).toUpperCase() + match_type.slice(1)} Matches</Text>
      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: 'tomato',
    paddingBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 12,
  },
  name: {
    flex: 8,
  },
  momentGroupSize: {
    flex: 2,
    textAlign: 'center',
  },
  icon: {
    flex: 2,
    textAlign: 'right',
  },
});

export default MatchesScreen;