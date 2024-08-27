// App.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { useFonts, RobotoCondensed_400Regular, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import DuelScreen from './components/DuelScreen';
import TableScreen from './components/TableScreen';

SplashScreen.preventAutoHideAsync();

const ICON_SIZE = 24; // Define a constant for the icon size

const Tab = createBottomTabNavigator();

const withSafeArea = (Component) => (props) => (
  <SafeAreaView style={styles.safeArea}>
    <Component {...props} />
  </SafeAreaView>
);

export default function App() {
  const [state, setState] = React.useState({ currentSport: '', currentScreen: '' });

  const [fontsLoaded] = useFonts({
    RobotoCondensed_400Regular, RobotoCondensed_700Bold
  });

  const navigationRef = React.useRef();

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  React.useEffect(() => {
    if (fontsLoaded && state.currentSport && state.currentScreen) {
      navigationRef.current?.navigate(`${state.currentSport} ${state.currentScreen}`, { sport: state.currentSport });
    }
  }, [fontsLoaded, state]);

  if (!fontsLoaded) {
    return null;
  }

  const navigateToDuelScreen = (sport) => {
    setState({ currentSport: sport.toLowerCase(), currentScreen: 'Duel' });
    navigationRef.current?.navigate(`${sport} Duel`, { sport });
  };

  const handleTabPress = (sport) => {
    if (sport.toLowerCase() !== state.currentSport) {
      setState({ currentSport: sport.toLowerCase(), currentScreen: 'Duel' });
    } else {
      setState((prevState) => ({
        ...prevState,
        currentScreen: prevState.currentScreen === 'Duel' ? 'Table' : 'Duel'
      }));
    }
  };

  const sportIcons = {
    football: 'sports-soccer',
    rugby: 'sports-rugby',
    golf: 'golf-course',
  };

  const getTabBarIcon = (sport, screen, focused, color, size) => {
    let iconName;

    if (sport === 'home') {
      iconName = 'home';
    } else if (focused) {
      iconName = screen === 'Duel' ? 'table-rows' : sportIcons[sport];
    } else {
      iconName = sportIcons[sport];
    }

    return <MaterialIcons name={iconName} size={size} color={color} />;
  };

  const generateTabScreens = () => {
    return ['rugby', 'football', 'golf'].map((sport, index) => (
      <Tab.Screen
        key={index}
        name={`${sport} ${state.currentScreen}`}
        component={withSafeArea(state.currentScreen === 'Duel' ? DuelScreen : TableScreen)}
        initialParams={{ sport }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleTabPress(sport);
            navigation.navigate(`${sport} ${state.currentScreen}`, { sport });
          },
        })}
      />
    ));
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        initialRouteName="home" // Set Home as the default view
        screenOptions={({ route }) => ({
          headerTitle: () => <Header fontSize={24} color="white" />,
          headerStyle: {
            backgroundColor: 'black',
            height: 100,
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {},
          tabBarLabel: () => null, // Remove the label
          tabBarIcon: ({ color, size = ICON_SIZE, focused }) => {
            const sport = route.name.split(' ')[0].toLowerCase();
            const screen = route.name.split(' ')[1];
            return getTabBarIcon(sport, screen, focused, color, size);
          },
        })}
      >
        <Tab.Screen
          name="home"
          component={withSafeArea((props) => <HomeScreen {...props} navigateToDuelScreen={navigateToDuelScreen} />)}
          options={{
            tabBarIcon: ({ color, size = ICON_SIZE, focused }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        {generateTabScreens()}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});