import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import Slider from '@react-native-community/slider';
import { apiService } from '../../../services/apiService';
import RateResultsTable from './rateResultsTable';
import RatePreviewScreen from './ratePreviewScreen';
import LoadingScreen from '../../loadingScreen';
import ResultsTable from '../resultsTable';

const RateMatchScreen = ({ match }) => {
  const [matchSession, setMatchSession] = useState(null);
  const [currentMoment, setCurrentMoment] = useState(null);
  const [rateComplete, setRateComplete] = useState(false);
  const [leagueTableEntries, setLeagueTableEntries] = useState([]);
  const [globalLeagueTableEntries, setGlobalLeagueTableEntries] = useState([]);
  const [skill, setSkill] = useState(0);
  const [swagger, setSwagger] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isPreviewScreen, setIsPreviewScreen] = useState(true); // Add preview screen state

  useEffect(() => {
    setSkill(0);
    setSwagger(0);
    setRatingSubmitted(false);
  }, [currentMoment]);

  useEffect(() => {
    if (rateComplete) {
      const fetchGlobalEntries = async () => {
        const response = await apiService.getMatch(match.id);
        if (response.success) {
          const globalEntries = response.data.league_table_entries;
          setGlobalLeagueTableEntries(globalEntries);
        } else {
          console.error('There was an error fetching the global league table entries!', response.error);
        }
      };

      fetchGlobalEntries();
    }
  }, [rateComplete, match]);

  const submitRating = async () => {
    if (skill === 0 || swagger === 0) {
      // Alert.alert('Please select values for skill, swagger, and impact.');
      return;
    }
    showLoadingScreen();

    try {
      const response = await apiService.submitRate(match.id, matchSession.id, currentMoment.id, skill, swagger);

      if (response.success) {
        const data = response.data;
        setRatingSubmitted(true); // Set the flag to true after submission
        setTimeout(() => setRatingSubmitted(false), 5000); // Reset the flag after 5 seconds

        if (data.completed) {
          setRateComplete(true); // Mark rating as complete
          setLeagueTableEntries(data.league_table_entries); // Set league table entries
        } else {
          setCurrentMoment(data.next_moment); // Load the next moment to rate
        }
      } else {
        console.error('Failed to submit rating:', response.error);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const startMatchSession = () => {
    const createSession = async () => {
      const response = await apiService.createMatchSession(match.id);
      if (response.success) {
        const matchSession = response.data.match_session;
        setMatchSession(matchSession);
        setCurrentMoment(matchSession.remaining_moments[0]); // First moment to rate
        setIsPreviewScreen(false);
        showLoadingScreen();
      } else {
        console.error('There was an error creating the match session!', response.error);
      }
    };

    createSession();
  };

  const showLoadingScreen = () => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  };

  if (isPreviewScreen) {
    console.log('Match PREVIEW SCREEN:', match);
    return <RatePreviewScreen match={match} startMatchSession={startMatchSession} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
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
            rate={1.2}
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
  row: {
    marginBottom: 10,
  },
});

export default RateMatchScreen;