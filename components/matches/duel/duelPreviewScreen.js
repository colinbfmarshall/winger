import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import ResultsTable from '../resultsTable';

const DuelPreviewScreen = ({ match, matchSession, startMatchSession }) => {
  if (!matchSession || !matchSession.remaining_moments) {
    return <Text style={{}}></Text>;
  }

  const flattenedData = matchSession.remaining_moments.flat();

  // Filter unique moments based on their ID
  const uniqueMoments = Array.from(new Set(flattenedData.map(moment => moment.id)))
    .map(id => {
      return flattenedData.find(moment => moment.id === id);
    });

  const momentsColumns = [
    {
      label: 'player',
      accessor: 'playerName',
      render: (row) => `${row.player}`,
      style: { textAlign: 'left', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
    },
    {
      label: 'opposition',
      accessor: 'playerOpposition',
      render: (row) => `${row.opposition}`,
      style: { textAlign: 'left', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
    },
    {
      label: 'date',
      accessor: 'player1Date',
      render: (row) => `${row.date}`,
      style: { textAlign: 'center', fontSize: 12, flex: 1, padding: 4 }, // Custom style for this column
    },
  ];

  const getLastName = (fullName) => {
    const parts = fullName.split(' ');
    return parts[parts.length - 1];
  };

  return (
    <ScrollView contentContainerStyle={styles.preview}>
      <Text style={[styles.previewTitle, { fontFamily: 'RobotoCondensed_700Bold' }]}>{match.name}</Text>
      <ResultsTable
        title="Moments" 
        columns={momentsColumns}
        data={uniqueMoments}
      />

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

export default DuelPreviewScreen;