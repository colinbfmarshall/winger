import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const DuelInfo = ({ duels }) => {
  console.log('duels', duels);

  const translateXAnimTop = useRef(new Animated.Value(0)).current;
  const translateXAnimBottom = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const startAnimations = () => {
    Animated.sequence([
      Animated.timing(translateXAnimTop, {
        toValue: 25,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnimTop, {
        toValue: 0,
        duration: 750,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(2000), // Delay the start of the bottom row animation by 750ms
      Animated.timing(translateXAnimBottom, {
        toValue: -25,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnimBottom, {
        toValue: 0,
        duration: 750,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const startDelayedAnimations = () => {
      startAnimations();
      timeoutRef.current = setTimeout(startDelayedAnimations, 10000); // 15 seconds delay
    };

    startDelayedAnimations();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [translateXAnimTop, translateXAnimBottom]);

  return (
    <View style={styles.infoContainer}>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderInteger}>Rank</Text>
          <Text style={styles.tableHeaderText}>Moment</Text>
          <Text style={styles.tableHeaderInteger}>Duels</Text>
          <Text style={styles.tableHeaderInteger}>Wins</Text>
        </View>
        {duels.map((row, index) => (
          <React.Fragment key={index}>
            <Animated.View
              style={[
                styles.tableRow,
                { transform: [{ translateX: index === 0 ? translateXAnimTop : translateXAnimBottom }] }, // Apply animations
              ]}
            >
              <Text style={styles.tableCellInteger}>{row.duel_stats["rank"]}</Text>
              <Text style={styles.tableCellString}>{`${row["player"]} vs ${row["opposition"]} (${row.date})`}</Text>
              <Text style={styles.tableCellInteger}>{row.duel_stats["duels"]}</Text>
              <Text style={styles.tableCellInteger}>{row.duel_stats["wins"]}</Text>
            </Animated.View>
            {index === 0 && (<View style={styles.staticBorder} />)}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flex: 2,
    backgroundColor: '#fdfdfd', // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    width: '95%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333', // Dark gray background
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderColor: '#333333',
    backgroundColor: '#fdfdfd', // Light gray background
  },
  tableHeaderInteger: {
    width: 50, // Fixed width for integer cells
    padding: 4, // Reduced padding
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10, // Reduced font size
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  tableHeaderText: {
    flex: 1, // Flex for string cells
    padding: 4, // Reduced padding
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 10, // Reduced font size
    backgroundColor: '#fdfdfd', // Light gray background
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 14, // Reduced padding
    paddingBottom: 14, // Reduced padding
    backgroundColor: '#fdfdfd', // Light gray background
  },
  staticBorder: {
    height: 1,
    backgroundColor: 'tomato',
    width: '100%',
  },
  tableCellInteger: {
    width: 50, // Fixed width for integer cells
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12, // Reduced font size
    color: '#333333', // Dark gray text
    fontFamily: 'Roboto_400Regular'
  },
  tableCellString: {
    flex: 1, // Flex for string cells
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 12, // Reduced font size
    color: '#333333', // Dark gray text
    fontFamily: 'Roboto_400Regular'
  },
});

export default DuelInfo;