import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { apiService } from '../../../services/apiService';
import Colors from '../../../config/colors';

const LeaderboardComplete = ({ sport, onPlayAgain, navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold_Italic,
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch top 10 for the sport used in scramble
        const response = await apiService.getLeaderboard(sport || 'football', 1, 10); 
        if (response.success) {
          console.log('Leaderboard data fetched successfully:', response.data);
          setLeaderboardData(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (sport) {
      fetchLeaderboard();
    }
  }, [sport]);

  if (!fontsLoaded) {
    return null;
  }

  const renderLeaderboardItem = (item, index) => {
    const moment = item.moment;
    return (
      <View key={moment.id} style={styles.leaderboardItem}>
        <View style={styles.rankSection}>
          <Text style={styles.rankText}>
            #{item.rank || (index + 1)}
          </Text>
        </View>
        
        <View style={styles.momentInfo}>
          <Text style={styles.momentDetails} numberOfLines={1}>
            {moment.title || moment.description || 'Great moment'}
          </Text>
          {moment.team && (
            <Text style={styles.teamText}>{moment.team}</Text>
          )}
        </View>
        
        <View style={styles.statsSection}>
          <Text style={styles.eloText}>
            {Math.round(item.elo_rating || moment.elo_rating || moment.elo_before || 1200)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.completeText}>
          {sport ? `${sport.toUpperCase()}` : 'LEADERBOARD'}
        </Text>
        {/* <Text style={styles.leaderboardTitle}>
          {sport ? `${sport.toUpperCase()} LEADERBOARD` : 'LEADERBOARD'}
        </Text> */}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.columnHeader}>RANK</Text>
            <Text style={styles.columnHeaderMain}>MOMENT</Text>
            <Text style={styles.columnHeader}>SCORE</Text>
          </View>
          
          {leaderboardData?.leaderboard?.map((item, index) => 
            renderLeaderboardItem(item, index)
          )}
        </ScrollView>
      )}

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => {
            // Navigate to the Play tab
            if (navigation) {
              navigation.navigate('Play');
            } else {
              // Fallback to onPlayAgain if navigation is not available
              onPlayAgain();
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>PLAY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  completeText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  leaderboardTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginBottom: 10,
  },
  columnHeader: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: 60,
    textAlign: 'center',
  },
  columnHeaderMain: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankSection: {
    width: 60,
    alignItems: 'center',
  },
  rankText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
  },
  topRankText: {
    color: Colors.primary,
  },
  momentInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  playerName: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  momentDetails: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Roboto_400Regular',
    lineHeight: 18,
    marginBottom: 2,
  },
  teamText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Roboto_400Regular',
  },
  statsSection: {
    width: 60,
    alignItems: 'center',
  },
  eloText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  winRateText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'Roboto_400Regular',
  },
  buttonSection: {
    paddingVertical: 30,
  },
  playAgainButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: Colors.text,
    fontFamily: 'RobotoCondensed_700Bold_Italic',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LeaderboardComplete;
