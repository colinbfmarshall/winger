import React, { useReducer, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { apiService } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import { reducer, initialState, ACTIONS, PHASES } from './scrambleReducer';
import PlayInstructions from './PlayInstructions';
import DuelVideoPair from './DuelVideoPair';
import BaseballCard from './BaseballCard';
import VideoPreloader from './VideoPreloader';
import { EloCalculator } from '../../../utils/EloCalculator';

const ScrambleMatchScreen = () => {
  console.log('ScrambleMatchScreen');
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function initSession() {
      if (!isAuthenticated) {
        console.error('User not authenticated, cannot create scramble match');
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        console.log('User authenticated, creating scramble match for user:', user?.id);
        const response = await apiService.createScrambleMatch();
        console.log('Response from createScrambleMatch:', response);
        
        if (response.success) {
          const { duels, session_id, sport, total_rounds, expires_at } = response.data;
          console.log('Scramble session created:', { session_id, sport, total_rounds, expires_at });
          console.log('Duels received:', duels.length);
          
          dispatch({ 
            type: ACTIONS.INIT_SESSION, 
            payload: { 
              sessionId: session_id, 
              duels: duels 
            } 
          });
        } else {
          console.error('There was an error creating the scramble match!', response.error);
          dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error creating scramble match:', error);
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    }

    initSession();
  }, [isAuthenticated, user]);

  const handleTopVideoReady = useCallback(() => {
    dispatch({ type: ACTIONS.FIRST_VIDEO_READY });
  }, []);

  const handleSwipeWinner = useCallback(async (winnerMoment, loserMoment) => {
    console.log('Winner selected:', winnerMoment.id);
    
    // Calculate estimated ELO changes using EloCalculator
    const winnerEloBefore = winnerMoment.elo_before || winnerMoment.elo_rating || 1200;
    const loserEloBefore = loserMoment.elo_before || loserMoment.elo_rating || 1200;
    
    const winnerEloAfter = EloCalculator.estimateEloAfter(winnerEloBefore, loserEloBefore, true);
    const loserEloAfter = EloCalculator.estimateEloAfter(loserEloBefore, winnerEloBefore, false);
    
    // Update moments with calculated ELO values
    const updatedWinner = {
      ...winnerMoment,
      elo_before: winnerEloBefore,
      elo_after: winnerEloAfter
    };
    
    const updatedLoser = {
      ...loserMoment,
      elo_before: loserEloBefore,
      elo_after: loserEloAfter
    };
    
    // Update state immediately for smooth transition
    dispatch({ 
      type: ACTIONS.SWIPE_WINNER, 
      payload: { winner: updatedWinner, loser: updatedLoser } 
    });
    
    // Show result immediately
    dispatch({ type: ACTIONS.SHOW_RESULT });
    // Submit to API in background (don't block transition)
    try {
      const response = await apiService.submitScramble(state.sessionId, winnerMoment.id, state.roundIndex);
      console.log('Scramble submitted successfully:', response);
    } catch (error) {
      console.error('Error submitting scramble:', error);
    }
  }, [state.sessionId]);

  const handleNextRound = useCallback(() => {
    dispatch({ type: ACTIONS.NEXT_ROUND });
  }, []);

  const handleFirstVideoReady = useCallback(() => {
    dispatch({ type: ACTIONS.FIRST_VIDEO_READY });
  }, []);

  const handlePlayPress = useCallback(() => {
    dispatch({ type: ACTIONS.TAP_PLAY });
  }, []);

  const handleContinueInstructions = useCallback(() => {
    // This starts the video preloading process
    // The DuelVideoPair component will be rendered off-screen to preload videos
    // Once the top video is ready, the play button will be enabled
  }, []);

  const handleSwipeTopWins = useCallback(() => {
    if (state.currentPair.length === 2) {
      handleSwipeWinner(state.currentPair[0], state.currentPair[1]);
    }
  }, [state.currentPair, handleSwipeWinner]);

  const handleSwipeBottomWins = useCallback(() => {
    if (state.currentPair.length === 2) {
      handleSwipeWinner(state.currentPair[1], state.currentPair[0]);
    }
  }, [state.currentPair, handleSwipeWinner]);

  // Show loading screen while authentication is loading
  if (authLoading) {
    return (
      <PlayInstructions 
        onContinue={handleContinueInstructions}
        onPlay={handlePlayPress}
        videoReady={false}
        showPlayButton={false}
      />
    );
  }

  // Show error message if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication required</Text>
      </View>
    );
  }

  // Show loading while initializing session
  if (state.loading || !state.sessionId) {
    return (
      <PlayInstructions 
        onContinue={handleContinueInstructions}
        onPlay={handlePlayPress}
        videoReady={false}
        showPlayButton={false}
      />
    );
  }

  // Render appropriate component based on current phase
  switch (state.phase) {
    case PHASES.INSTRUCTIONS:
      return (
        <>
          <PlayInstructions 
            onContinue={handleContinueInstructions}
            onPlay={handlePlayPress}
            videoReady={state.preloadedNextPairReady}
            showPlayButton={state.currentPair.length > 0}
          />
          {/* Preload videos in the background while showing instructions */}
          {state.currentPair.length > 0 && (
            <VideoPreloader
              key={`preload-${state.currentPair[0].id}`}
              topMoment={state.currentPair[0]}
              onVideoReady={handleTopVideoReady}
            />
          )}
        </>
      );
    
    case PHASES.DUEL:
      return (
        <DuelVideoPair
          topMoment={state.currentPair[0]}
          bottomMoment={state.currentPair[1]}
          onReadyTop={handleFirstVideoReady}
          onSwipeTopWins={handleSwipeTopWins}
          onSwipeBottomWins={handleSwipeBottomWins}
        />
      );
    
    case PHASES.RESULT:
      const nextRoundIndex = state.roundIndex + 1;
      const nextDuel = nextRoundIndex < state.duels.length ? state.duels[nextRoundIndex] : null;
      
      return (
        <BaseballCard
          winnerCard={state.winnerMoment}
          loserCard={state.loserMoment}
          nextTopMoment={nextDuel?.moment1}
          onNext={handleNextRound}
        />
      );
    
    case PHASES.COMPLETE:
      return (
        <View style={styles.container}>
          <Text style={styles.completeText}>Match Complete!</Text>
          <Text style={styles.completeSubtext}>Thanks for playing Scramble</Text>
        </View>
      );
    
    default:
      return (
        <PlayInstructions 
          onContinue={handleContinueInstructions}
          onPlay={handlePlayPress}
          videoReady={false}
          showPlayButton={false}
        />
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  completeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  completeSubtext: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ScrambleMatchScreen;