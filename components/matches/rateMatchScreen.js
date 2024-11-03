import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import RateResultsTable from './rateResultsTable';

const API_URL = __DEV__ 
  ? 'http://192.168.0.68:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const RateMatchScreen = ({ match }) => {
  const [currentMoment, setCurrentMoment] = useState(null);
  const [matchSession, setMatchSession] = useState([]);
  const [rateComplete, setRateComplete] = useState(false);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);
  const [momentsLeft, setMomentsLeft] = useState(0);
  const [skill, setSkill] = useState(0);
  const [swagger, setSwagger] = useState(0);
  const [impact, setImpact] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {

    if (match) {
      axios.post(`${API_URL}/api/v1/matches/${match.id}/match_sessions`, {}, {
        headers: {
          // Authorization: `Bearer ${authToken}`
        }
      })
      .then(response => {
        const session = response.data.match_session;
        setMatchSession(session);
        setCurrentMoment(session.remaining_moments[0]); // First moment to rate
        setMomentsLeft(session.remaining_moments.length);
      })
      .catch(error => {
        console.error('There was an error fetching the match details!', error);
      });
    }
  }, [match]);

  useEffect(() => {
    setSkill(0);
    setSwagger(0);
    setImpact(0);
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
    if (skill === 0 || swagger === 0 || impact === 0) {
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
          swagger: swagger,
          impact: impact
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
          setMatchSession(data.match_session);
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

  if (!match) {
    return (<Text>No match selected</Text>);
  }

  if (rateComplete) {
    return (
      <View style={{}}>
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
            <Text style={styles.title}>Impact {impact}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={impact}
              onValueChange={(value) => setImpact(value)}
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
    width: Dimensions.get('window').width,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  SwipeAction: {
    padding: 20,
    width: Dimensions.get('window').width * .8,
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
});

export default RateMatchScreen;