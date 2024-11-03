import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import SportButton from './SportButton';
import Header from './Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

const HomeScreen = ({ navigation }) => {
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

  const navigateToMatchesScreen = (sport) => {
    navigation.navigate(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Matches`, { sport });
  };

  return (
    <View style={[styles.container, styles.screenBackground]}>
      <Header fontSize={60} fontColor="#333333" stopColor="tomato" />
      <Text style={[styles.title, { fontFamily: 'Roboto_400Regular' }]}>
        swipe to rate & rank sports moments
      </Text>
      <SportButton sport="football" icon="sports-soccer" onPress={() => navigateToMatchesScreen('football')} />
      <SportButton sport="rugby" icon="sports-rugby" onPress={() => navigateToMatchesScreen('rugby')} />
      <SportButton sport="golf" icon="golf-course" onPress={() => navigateToMatchesScreen('golf')} />
      <SportButton sport="basketball" icon="sports-basketball" onPress={() => navigateToMatchesScreen('basketball')} />

      <View style={styles.gameModesContainer} >
        <Text style={styles.gameModes}>Game modes</Text>
        <View style={styles.row}>
          <MaterialCommunityIcons name='podium-gold' size={30} style={styles.icon} />
          <Text style={[styles.text, { fontFamily: 'RobotoCondensed_700Bold' }]}>Rank moments in order of greatness through duels</Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name='format-list-numbered' size={30} style={styles.icon} />
          <Text style={[styles.text, { fontFamily: 'RobotoCondensed_700Bold' }]}> Score moments on skill, swagger & impact </Text>
        </View>

        <View style={styles.row}>
          <MaterialCommunityIcons name='arrow-up-down' size={30} style={styles.icon} />
          <Text style={[styles.text, { fontFamily: 'RobotoCondensed_700Bold' }]}>Which moment has the higher skill, swagger & impact</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  screenBackground: {
    backgroundColor: '#fdfdfd', // Slightly lighter gray background
  },
  title: {
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333333', // Dark gray text
  },
  gameModesContainer: {
    backgroundColor: 'black', // Slightly lighter gray background
    width: Dimensions.get('window').width,
    marginTop: 20,
    padding: 20,
  },
  gameModes: {
    fontSize: 20,
    fontFamily: 'RobotoCondensed_700Bold',
    textAlign: 'center',
    color: '#fdfdfd', // Dark gray text
  },
  row: {
    flexDirection: 'row',
    marginTop: 20,
  },
  text: {
    color: '#fdfdfd',
    fontSize: 14,
    paddingTop: 4,
  },
  icon: {
    color: 'tomato',
    marginRight: 8,
  },
});

export default HomeScreen;