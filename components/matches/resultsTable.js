import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ResultsTable = ({ title, columns, data }) => {
  console.log('columns:', columns);
  console.log('title:', title);
  console.log('data:', data);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {columns.map((column, index) => (
            <Text
              key={index}
              style={[
                column.isNumeric ? styles.tableHeaderInteger : styles.tableHeaderText,
                { fontFamily: 'RobotoCondensed_700Bold' },
                column.style, // Apply custom styles from column definition
              ]}
            >
              {column.label}
            </Text>
          ))}
        </View>
        {data && data.length > 0 ? (
          data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {columns.map((column, colIndex) => (
                <Text
                  key={colIndex}
                  style={[
                    column.isNumeric ? styles.tableCellInteger : styles.tableCellString,
                    { fontFamily: 'Roboto_400Regular' },
                    column.style, // Apply custom styles from column definition
                  ]}
                >
                  {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                </Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    color: '#333333', // Dark gray text
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
  tableHeaderInteger: {
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
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
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: '#ddd',
  },
  tableCellInteger: {
    fontWeight: 'bold',
    color: '#333333', // Dark gray text
  },
  tableCellString: {
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333333', // Dark gray text
  },
  noDataText: {
    padding: 10,
    textAlign: 'center',
    color: '#999',
  },
});

export default ResultsTable;