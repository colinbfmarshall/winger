import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { MaterialIcons } from '@expo/vector-icons';
import VideoPreloader from './VideoPreloader';
import Colors from '../../../config/colors';

const BaseballCard = ({ 
  winnerCard, 
  loserCard, 
  onNext, 
  nextTopMoment
}) => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
  });

  const [nextVideosReady, setNextVideosReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const screenWidth = Dimensions.get('window').width;

  // Handle when next videos are ready for preloading
  const handleNextVideoReady = () => {
    console.log('Next round top video is ready for BaseballCard');
    setNextVideosReady(true);
  };

  // Reset ready state when new card is shown or handle no next round
  useEffect(() => {
    if (!nextTopMoment) {
      // If there's no next round, enable button immediately (game will end)
      setNextVideosReady(true);
    } else {
      // Reset for new card
      setNextVideosReady(false);
    }
  }, [winnerCard?.id, nextTopMoment]);

  // Create video player for winner card
  const player = useVideoPlayer(winnerCard?.video_url || '', player => {
    player.muted = false;
    player.loop = true;
    player.showNowPlayingNotification = false;
  });

  useEffect(() => {
    // Animate card in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start playing video
    if (winnerCard?.video_url) {
      player.play();
    }
  }, [winnerCard?.video_url]);

  if (!fontsLoaded || !winnerCard) {
    return null;
  }

  // Calculate derived values
  const eloChange = Math.round(winnerCard.elo_after || 0) - Math.round(winnerCard.elo_before || 0);
  const rankChange = (winnerCard.rank_before || 0) - (winnerCard.rank_after || 0); // Positive means improved rank
  const totalMoments = winnerCard.total_moments_in_category || 1;
  const currentRank = winnerCard.rank_after || winnerCard.rank_before || 0;
  
  // Format tier display
  const getTierDisplay = () => {
    if (winnerCard.tier_after) return winnerCard.tier_after;
    if (winnerCard.tier_before) return winnerCard.tier_before;
    return 'N/A';
  };

  const renderStatRow = (label, value, isPositive = null) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[
        styles.statValue,
        isPositive === true && styles.positiveValue,
        isPositive === false && styles.negativeValue
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]} 
        testID="baseball-card"
      >
      {/* Video Section - Top Third */}
      <View style={styles.videoSection}>
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          contentFit="cover"
        />
        <View style={styles.videoOverlay}>
          <Text style={styles.winnerText}>WINNER</Text>
        </View>
      </View>

      {/* Content Section - Middle */}
      <View style={styles.contentSection}>
          
          {/* Top Stats Row: Rating, Rank, Tier */}
          <View style={styles.topStatsRow}>
            <Text style={[styles.topStatText, styles.underlinedText]}>
              Rank: {currentRank}/{totalMoments}
            </Text>
            <Text style={[styles.topStatText, styles.underlinedText]}>
              Rating: {Math.round(winnerCard.elo_after || 0)}{' '}
              <Text style={[styles.topStatChange, eloChange > 0 ? styles.positiveValue : styles.negativeValue]}>
                ({eloChange >= 0 ? '+' : ''}{eloChange})
              </Text>
            </Text>
          </View>

          <View style={styles.titleSection}>
            {/* <Text style={styles.momentTitle}>{winnerCard.title}</Text> */}
          </View>

          {/* Video Summary */}
          {winnerCard.summary && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryText}>"{winnerCard.summary}"</Text>
            </View>
          )}

          {/* Basic Info Section */}
          <View style={styles.infoSection}>
            {renderStatRow('Win Rate', `${Math.round((winnerCard.global_win_rate || 0) * 100)}%`)}
            {winnerCard.player && renderStatRow('Player', winnerCard.player)}
            {winnerCard.team && renderStatRow('Match', `${winnerCard.team} vs ${winnerCard.opposition}`)}
            {winnerCard.competition && renderStatRow('Competition', `${winnerCard.competition}  2015/16`)}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Head-to-Head</Text>
              <Text style={styles.statValue}>
                {winnerCard.wins_vs_opponent || 0}{(winnerCard.total_matchups_vs_opponent || 1) - (winnerCard.wins_vs_opponent || 0)} vs Loser
              </Text>
            </View>

          </View>

          {/* Loser Section */}
          {/* {loserCard && (
            <View style={styles.loserSection}>
              <View style={styles.loserContainer}>
                <View style={styles.loserTitle}>
                  <Text style={styles.loserText}>LOSER</Text>
                </View>
                <View style={styles.loserDetailsSection}>
                  {loserCard.player && (
                    <View style={styles.loserStatRow}>
                      <Text style={styles.loserStatLabel}>Player</Text>
                      <Text style={styles.loserStatValue}>{loserCard.player}</Text>
                    </View>
                  )}
                  {loserCard.opposition && (
                    <View style={styles.loserStatRow}>
                      <Text style={styles.loserStatLabel}>Match</Text>
                      <Text style={styles.loserStatValue}>{loserCard.team} vs {loserCard.opposition}</Text>
                    </View>
                  )}
                  <View style={styles.loserStatRow}>
                    <Text style={styles.loserStatLabel}>Rank</Text>
                    <Text style={styles.loserStatValue}>
                      {loserCard.rank_after || loserCard.rank_before || 0}/{loserCard.total_moments_in_category || 1}
                    </Text>
                  </View>
                  <View style={styles.loserStatRow}>
                    <Text style={styles.loserStatLabel}>Rating</Text>
                    <Text style={styles.loserStatValue}>
                      {Math.round(loserCard.elo_after || loserCard.elo_before || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )} */}
      </View>

      {/* Button Section - Bottom */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[
            styles.playButton,
            !nextVideosReady && styles.playButtonDisabled
          ]}
          onPress={onNext}
          disabled={!nextVideosReady}
          accessibilityRole="button"
          accessibilityLabel={
            nextVideosReady ? "Continue to next round" : "Loading next videos, please wait"
          }
          testID="next-button"
          activeOpacity={!nextVideosReady ? 1 : 0.7}
        >
          <Text style={[
            styles.buttonText,
            !nextVideosReady && styles.buttonTextDisabled
          ]}>
            PLAY
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
    
    {/* Preload next round videos in the background */}
    {nextTopMoment && (
      <VideoPreloader
        key={`preload-${nextTopMoment.id}`}
        topMoment={nextTopMoment}
        onVideoReady={handleNextVideoReady}
      />
    )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoSection: {
    flex: 4, // 4 parts out of 12
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  winnerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
  },
  titleSection: {
    paddingHorizontal: 30,
    paddingVertical: 5,
    backgroundColor: 'black',
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  contentSection: {
    flex: 7, // 6 parts out of 12
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  topStatText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  underlinedText: {
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primary,
    textDecorationStyle: 'solid',
  },
  topStatChange: {
    fontSize: 14,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
  },
  summarySection: {
    marginBottom: 10,
    paddingBottom: 15,
  },
  summaryText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  performanceSection: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  loserSection: {
    marginBottom: 20,
  },
  loserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loserTitle: {
    backgroundColor: '#bbb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  loserText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    textAlign: 'center',
  },
  loserDetailsSection: {
    flex: 2,
    marginLeft: 10,
  },
  loserStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  loserStatLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    flex: 1,
  },
  loserStatValue: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  loserStatText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Roboto_400Regular',
    marginRight: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Roboto_400Regular',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  positiveValue: {
    color: '#4CAF50',
  },
  negativeValue: {
    color: Colors.primary,
  },
  statGroup: {
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
  },
  statGroupTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  buttonSection: {
    flex: 1, // 2 parts out of 12  
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 10,
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    opacity: 1,
  },
  playButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#bbb',
  },
});

export default BaseballCard;
