import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const HigherLowerResultsTable = ({ title, higherLowerResults }) => {
  if (!higherLowerResults) {
    return <Text>Loading...</Text>;
  }

  const { rounds = [], moments = [], scores = {} } = higherLowerResults;
  console.log('higherLowerResults', higherLowerResults);

  const getMomentPlayer = (momentId) => {
    const moment = moments.find(m => m.id === momentId);
    return moment ? moment.player : 'Unknown Player';
  };

  const getMomentOpposition = (momentId) => {
    const moment = moments.find(m => m.id === momentId);
    return moment ? moment.opposition : 'Unknown Opposition';
  };

  const getMomentSkillScore = (momentId, category) => {
    const moment = moments.find(m => m.id === momentId);
    if (!moment) return 'N/A';

    switch (category) {
      case 'skill':
        return `/ skill: ${moment.skill_rating}`;
      case 'swagger':
        return `swagger: ${moment.swagger_rating}`;
      case 'impact':
        return `impact: ${moment.impact_rating}`;
      case 'overall_rating':
        return `overall: ${moment.overall_rating}/`;
      default:
        return 'N/A';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>{title}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{scores.score_statement || 'No score statement available'}</Text>
        <Text style={styles.scorePercentage}>Score: {scores.percentage_correct !== undefined ? `${scores.percentage_correct}%` : 'N/A'}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Round</Text>
          <Text style={[styles.tableHeaderText, { fontFamily: 'RobotoCondensed_700Bold' }]}>Moment 1</Text>
          <Text style={[styles.tableHeaderText, { fontFamily: 'RobotoCondensed_700Bold' }]}>Moment 2</Text>
          <Text style={[styles.tableHeaderInteger, { fontFamily: 'RobotoCondensed_700Bold' }]}>Correct</Text>
        </View>
        {rounds.map((round, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCellInteger, { fontFamily: 'Roboto_400Regular' }]}>{index + 1}</Text>
            <Text style={[styles.tableCellString, { fontFamily: 'Roboto_400Regular' }]}>
              {getMomentPlayer(round.moment1_id)} | {getMomentSkillScore(round.moment1_id, round.category)}
            </Text>
            <Text style={[styles.tableCellString, { fontFamily: 'Roboto_400Regular' }]}>
              {getMomentPlayer(round.moment2_id)} | {getMomentSkillScore(round.moment2_id, round.category)}
            </Text>
            <View>
              {round.correct ? (
                <Entypo name="check" style={styles.tableCellInteger} size={20}/>
              ) : (
                <Entypo name="cross" style={styles.tableCellInteger} size={20}/>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333', // Dark gray background
    borderBottomWidth: 2,
    borderBottomColor: 'tomato',
    borderColor: '#333333',
    color: '#f5f5f5', // Light gray text
  },
  tableHeaderText: {
    flex: 1,
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 14,
    color: '#f5f5f5', // Light gray text
  },
  tableHeaderInteger: {
    width: 50,
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    color: '#f5f5f5', // Light gray text
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: '#ddd',
  },
  tableCellString: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333333', // Dark gray text
  },
  tableCellInteger: {
    width: 50,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333333', // Dark gray text
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
  },
  scoreText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scorePercentage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    color: '#333333', // Dark gray text
  },
});

export default HigherLowerResultsTable;