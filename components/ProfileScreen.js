import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import Header from './Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

const ProfileScreen = ({ navigation }) => {
  let [fontsLoaded] = useFonts({
    Roboto_400Regular, RobotoCondensed_700Bold
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, styles.screenBackground]}>
      <View style={styles.titleSection}>
        <MaterialCommunityIcons name={'skull'} size={60} color={'tomato'} />
        <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>
          your profile
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Moments</Text>
        {/* Add favorite moments content here */}
        <Text style={styles.sectionContent}>No favorite moments yet.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Matches</Text>
        {/* Add suggested matches content here */}
        <Text style={styles.sectionContent}>No suggested matches yet.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends' Activity</Text>
        {/* Add friends' activity content here */}
        <Text style={styles.sectionContent}>No recent activity from friends.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Highlight Reels</Text>
        {/* Add friends' activity content here */}
        <Text style={styles.sectionContent}>No saved highlight reels.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenBackground: {
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'tomato',
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
    color: '#333333', // Dark gray text
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333', // Dark gray text
  },
  sectionContent: {
    fontSize: 16,
    color: '#666666', // Lighter gray text
  },
});

export default ProfileScreen;