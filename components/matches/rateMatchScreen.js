import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import RateResultsTable from './rateResultsTable';
import ResultsTable from './resultsTable';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const RateMatchScreen = ({ match, matchSession }) => {
  const [currentMoment, setCurrentMoment] = useState(null);
  const [rateComplete, setRateComplete] = useState(false);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);
  const [momentsLeft, setMomentsLeft] = useState(0);
  const [skill, setSkill] = useState(0);
  const [swagger, setSwagger] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (matchSession) {
      setCurrentMoment(matchSession.remaining_moments[0]); // First moment to rate
      setMomentsLeft(matchSession.remaining_moments.length);
      showPreviewScreen();
    }
  }, [matchSession]);

  useEffect(() => {
    setSkill(0);
    setSwagger(0);
    setRatingSubmitted(false);
  }, [currentMoment]);

  useEffect(() => {
    if (rateComplete) {
      axios.get(`${API_URL}/api/v1/matches/${match.id}`)
        .then(response => {
          const globalEntries = response.data.league_table_entries;
          setGlobalLeagueTableEntries(globalEntries);
        })
        .catch(error => {
          console.error('There was an error fetching the global league table entries!', error);
        });
    }
  }, [rateComplete, match]);

  const submitRating = async () => {
    if (skill === 0 || swagger === 0) {
      // Alert.alert('Please select values for skill, swagger, and impact.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/matches/${match.id}/match_sessions/${matchSession.id}/submit_rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          moment_id: currentMoment.id,
          skill: skill,
          swagger: swagger
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRatingSubmitted(true); // Set the flag to true after submission
        setTimeout(() => setRatingSubmitted(false), 5000); // Reset the flag after 5 seconds

        if (data.completed) {
          setRateComplete(true); // Mark rating as complete
          setLeagueTableEntries(data.league_table_entries); // Set league table entries
        } else {
          setCurrentMoment(data.next_moment); // Load the next moment to rate
          const remainingDuels = data.match_session.remaining_moments.length;
          const completedDuels = data.match_session.completed_moments.length;
          setMomentsLeft(remainingDuels + completedDuels - completedDuels);
        }
      } else {
        console.error('Failed to submit rating:', data.error);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const showPreviewScreen = () => {
    setIsLoading(true);
    return () => clearTimeout(timer); // Cleanup the timer
  };

  if (!match) {
    return (<Text>No match selected</Text>);
  }

  if (isLoading) {
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
            <Text style={styles.strong}>1. Watch the Moment:</Text> An iconic sports moments will play.
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setIsLoading(false)}>
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (rateComplete) {
    return (
      <View style={styles.fullScreen}>
        <RateResultsTable title={'Your Results'} leagueTableEntries={leagueTableEntries} />
        <RateResultsTable title={'Global Results'} leagueTableEntries={globalLeagueTableEntries} />
      </View>
    );
  }

  if (!currentMoment) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: currentMoment.videoUrl }}
            rate={1.0}
            isMuted={true}
            shouldPlay={true}
            isLooping={true}
            useNativeControls
            resizeMode='stretch'
            style={styles.video} // Ensure the video has a style
          />
        </View>
        <View style={styles.SwipeAction}>
          <Text style={styles.title}>Skill {skill}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={skill}
            onValueChange={(value) => setSkill(value)}
            onSlidingComplete={submitRating}
            minimumTrackTintColor="tomato"
            maximumTrackTintColor="#000000"
          />
          <Text style={styles.title}>Swagger {swagger}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={swagger}
            onValueChange={(value) => setSwagger(value)}
            onSlidingComplete={submitRating}
            minimumTrackTintColor="tomato"
            maximumTrackTintColor="#000000"
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  videoContainer: {
    flex: 1,
    width: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  SwipeAction: {
    padding: 20,
    width: '100%',
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center'
  },
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

export default RateMatchScreen;