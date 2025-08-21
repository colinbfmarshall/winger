import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { MaterialIcons } from '@expo/vector-icons';
import VideoPreloader from './VideoPreloader';

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

  const [currentTab, setCurrentTab] = useState(0); // 0 = Basic Info, 1 = Performance Stats
  const [nextVideosReady, setNextVideosReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const panGesture = useRef(null);

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
  const eloChange = (winnerCard.elo_after || 0) - (winnerCard.elo_before || 0);
  const rankChange = (winnerCard.rank_before || 0) - (winnerCard.rank_after || 0); // Positive means improved rank
  const percentileBefore = winnerCard.total_moments_in_category ? 
    Math.round(((winnerCard.total_moments_in_category - (winnerCard.rank_before || 0) + 1) / winnerCard.total_moments_in_category) * 100) : 0;
  const percentileAfter = winnerCard.total_moments_in_category ? 
    Math.round(((winnerCard.total_moments_in_category - (winnerCard.rank_after || 0) + 1) / winnerCard.total_moments_in_category) * 100) : 0;

  const switchTab = (tabIndex) => {
    setCurrentTab(tabIndex);
    Animated.timing(tabTranslateX, {
      toValue: tabIndex * -(screenWidth - 60), // Account for 30px padding on each side
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: tabTranslateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        // Update translateX based on current tab position and gesture
        const basePosition = currentTab * -(screenWidth - 60); // Account for padding
        const newPosition = basePosition + event.nativeEvent.translationX;
        tabTranslateX.setValue(newPosition);
      }
    }
  );

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.state === 5) { // ENDED
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.3; // 30% of screen width
      
      let newTab = currentTab;
      
      // Determine new tab based on swipe distance or velocity
      if (translationX < -threshold || velocityX < -500) {
        // Swipe left - go to next tab (Performance)
        newTab = Math.min(1, currentTab + 1);
      } else if (translationX > threshold || velocityX > 500) {
        // Swipe right - go to previous tab (Basic Info)
        newTab = Math.max(0, currentTab - 1);
      }
      
      // Animate to the final position
      switchTab(newTab);
    }
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

  const renderStatRowWithColoredChange = (label, beforeValue, afterValue, changeValue, isPositive = null) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {beforeValue} → {afterValue} <Text style={[
          isPositive === true && styles.positiveValue,
          isPositive === false && styles.negativeValue
        ]}>({changeValue >= 0 ? '+' : ''}{changeValue})</Text>
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
        {/* Tab Selector - Fixed at top */}
        <View style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tab, currentTab === 0 && styles.activeTab]}
            onPress={() => switchTab(0)}
          >
            <Text style={[styles.tabText, currentTab === 0 && styles.activeTabText]}>
              BASIC INFO
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, currentTab === 1 && styles.activeTab]}
            onPress={() => switchTab(1)}
          >
            <Text style={[styles.tabText, currentTab === 1 && styles.activeTabText]}>
              PERFORMANCE
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>

        {/* Carousel Container */}
        <PanGestureHandler
          ref={panGesture}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-5, 5]}
        >
          <Animated.View style={styles.carouselContainer}>
            <Animated.View 
              style={[
                styles.carouselContent,
                { transform: [{ translateX: tabTranslateX }] }
              ]}
            >
              {/* Basic Info Tab */}
              <View style={styles.tabContent}>
                {/* Video Summary */}
                        {winnerCard.summary && (
                          <View style={styles.summarySection}>
                          <Text style={styles.summaryText}>{winnerCard.summary}</Text>
                          </View>
                        )}
                        
                        <View style={styles.infoSection}>
                          {winnerCard.player && renderStatRow('PLAYER', winnerCard.player)}
                          {winnerCard.team && renderStatRow('TEAM', winnerCard.team)}
                          {winnerCard.competition && renderStatRow('COMPETITION', winnerCard.competition)}
                          {winnerCard.opponent && renderStatRow('OPPONENT', winnerCard.opponent)}
                          {winnerCard.sport && renderStatRow('SPORT', winnerCard.sport.charAt(0).toUpperCase() + winnerCard.sport.slice(1))}
                        </View>
                        </View>

                        {/* Performance Stats Tab */}
              <View style={styles.tabContent}>
                <View style={styles.infoSection}>
                  {/* Global Stats */}
                  {renderStatRow('Global Win Rate', `${Math.round((winnerCard.global_win_rate || 0) * 100)}%`)}
                  {winnerCard.total_duels && renderStatRow('Total Duels', winnerCard.total_duels)}
                  {/* ELO */}
                  {renderStatRowWithColoredChange('Rating', winnerCard.elo_before || 0, winnerCard.elo_after || 0, eloChange, eloChange > 0)}
                  
                  {/* Rank */}
                  {renderStatRowWithColoredChange('Rank', `#${winnerCard.rank_before || 0}`, `#${winnerCard.rank_after || 0}`, rankChange, rankChange > 0)}
                  
                  {/* Tier & Percentile */}
                  {(winnerCard.tier_before || winnerCard.tier_after) && renderStatRow('Tier', `${winnerCard.tier_before || 'N/A'} → ${winnerCard.tier_after || 'N/A'}`)}
                  {renderStatRow('Percentile', `${percentileBefore}% → ${percentileAfter}%`)}
                  
                  {/* Head-to-Head vs Opponent */}
                  {loserCard && renderStatRow('Head 2 Head Record', `${winnerCard.wins_vs_opponent || 0}/${winnerCard.total_matchups_vs_opponent || 1}`)}
                  {loserCard && renderStatRow('Head 2 Head Win Rate', `${Math.round(((winnerCard.wins_vs_opponent || 0) / (winnerCard.total_matchups_vs_opponent || 1)) * 100)}%`)}
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
        </ScrollView>
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
    backgroundColor: 'rgba(255, 99, 71, 0.9)',
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
  contentSection: {
    flex: 6, // 6 parts out of 12
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  scrollableContent: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    marginBottom: 20,
    lineHeight: 28,
  },
  infoSection: {
    marginBottom: 24,
  },
  summarySection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    lineHeight: 22,
    textAlign: 'left',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'tomato',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  carouselContainer: {
    overflow: 'hidden',
    flex: 1,
  },
  carouselContent: {
    flexDirection: 'row',
    width: '200%', // Two tabs side by side
  },
  tabContent: {
    width: '50%', // Each tab takes half of the carousel content width
    paddingHorizontal: 0, // Remove padding to prevent offset
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
    color: '#FF5722',
  },
  statGroup: {
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
  },
  statGroupTitle: {
    fontSize: 14,
    color: 'tomato',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  buttonSection: {
    flex: 2, // 2 parts out of 12  
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 10,
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: 'tomato',
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
