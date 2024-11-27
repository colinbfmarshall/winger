import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const API_URL = __DEV__ 
? 'http://localhost:3000'
: 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const MatchesScreen = ({ route }) => {
  const { sport } = route.params;
  const [matches, setMatches] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch matches from your API
    axios.get(`${API_URL}/api/v1/matches`, { params: { sport } })
      .then(response => {
        setMatches(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the matches!', error);
      });
  }, [sport]);

  const handleSelectMatch = (match) => {
    navigation.navigate('MatchSessionScreen', { match });
  };

  const getIconName = (action) => {
    switch (action) {
      case 'duel':
        return 'podium-gold';
      case 'rate':
        return 'format-list-numbered';
      case 'higher_lower':
        return 'arrow-up-down';
      default:
        return 'help-circle';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectMatch(item)}>
      <Text style={[styles.itemText, styles.name]}>{item.name}</Text>
      <Text style={[styles.itemText, styles.momentGroupSize]}>{item.moment_group_size}</Text>
      <MaterialCommunityIcons name={getIconName(item.match_type)} size={24} color="black" style={styles.icon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sport.charAt(0).toUpperCase() + sport.slice(1)} Matches</Text>
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
    paddingBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
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