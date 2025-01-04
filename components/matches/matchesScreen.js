import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MatchSessionScreen from './matchSessionScreen'; // Import MatchSessionScreen

const API_URL = __DEV__ 
? 'http://localhost:3000'
: 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const MatchesScreen = ({ route }) => {
  const { match_type } = route.params;
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null); // State to track selected match
  const [showHowToPlay, setShowHowToPlay] = useState(false);

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

  const renderHowToPlay = () => {
    if (match_type === 'duel') {
      return (
        <View style={styles.howToPlay}>
          <Text style={styles.row}>
            <Text style={styles.strong}>How to Play:</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>1. Watch the Moments:</Text> Two iconic sports moments will play back-to-back.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>2. Pick Your Favorite:</Text> Swipe on the moment you prefer to cast your vote.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>3. Find the GOAT:</Text> Decide the GOAT moment by voting in all head-to-head matchups.
          </Text>
          <Text style={styles.row}>
            It’s that simple—watch, swipe, and crown your champion!
          </Text>
        </View>
      );
    } else if (match_type === 'rate') {
      return (
        <View style={styles.howToPlay}>
          <Text style={styles.row}>
            <Text style={styles.strong}>How to Play:</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>1. Watch the Moment:</Text> An iconic sports moment will play.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>2. Rate the Moment:</Text> Use the sliders to rate the moment.
          </Text>
          <Text style={styles.row}>
            <Text style={styles.strong}>3. Find the GOAT:</Text> Decide the GOAT moment by rating all moments.
          </Text>
          <Text style={styles.row}>
            It’s that simple—watch, rate, and crown your champion!
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{match_type.charAt(0).toUpperCase() + match_type.slice(1)} Matches</Text>
        <TouchableOpacity onPress={() => setShowHowToPlay(!showHowToPlay)}>
          <MaterialCommunityIcons name="information-outline" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>
      </View>

      {showHowToPlay && renderHowToPlay()}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  icon: {
    color: 'tomato',
    paddingRight: 20,
    paddingTop: 6,
  },
  howToPlay: {
    textAlign: 'left',
    fontSize: 8,
    fontFamily: 'Roboto_400Regular',
    padding: 10,
    color: '#333333', // Dark gray text
    backgroundColor: 'tomato', // Slightly lighter gray background
    marginBottom: 15,
  },
  row: {
    marginBottom: 10,
  },
  strong: {
    fontWeight: 'bold',
  },
});

export default MatchesScreen;