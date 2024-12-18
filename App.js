import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import MatchesScreen from './components/matches/matchesScreen';
import MatchSessionScreen from './components/matches/matchSessionScreen';
import DuelMatchScreen from './components/matches/duelMatchScreen';

SplashScreen.preventAutoHideAsync();

const ICON_SIZE = 24; // Define a constant for the icon size

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const withSafeArea = (Component) => (props) => (
  <SafeAreaView style={styles.safeArea}>
    <Component {...props} />
  </SafeAreaView>
);

const commonHeaderOptions = (handleHeaderPress) => ({
  headerTitle: () => <Header fontSize={20} fontColor="white" stopColor="#333333" onPress={handleHeaderPress} />,
  headerStyle: {
    backgroundColor: 'tomato',
    height: 86,
  },
});

const TabNavigator = ({ navigationRef }) => {
  const [state, setState] = React.useState({ currentSport: '', currentScreen: '' });
  const [focusedTab, setFocusedTab] = React.useState('Home');

  const sportIcons = {
    football: 'sports-soccer',
    rugby: 'sports-rugby',
    golf: 'golf-course',
    basketball: 'sports-basketball'
  };

  const getTabBarIcon = (sport, focused, color, size) => {
    let iconName = sportIcons[sport];
    return <MaterialIcons name={iconName} size={size} color={color} />;
  };

  const generateTabScreens = () => {
    return Object.keys(sportIcons).map((sport, index) => (
      <Tab.Screen
        key={index}
        name={`${sport.charAt(0).toUpperCase() + sport.slice(1)} Matches`}
        component={withSafeArea(MatchesScreen)}
        initialParams={{ sport }}
        options={{
          tabBarIcon: ({ color, size = ICON_SIZE, focused }) => getTabBarIcon(sport, focused, color, size),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            setState({ currentSport: sport.toLowerCase(), currentScreen: 'Matches' });
            setFocusedTab(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Matches`);
            navigation.navigate(`${sport.charAt(0).toUpperCase() + sport.slice(1)} Matches`, { sport });
          },
        })}
      />
    ));
  };

  const handleHeaderPress = () => {
    setState({ currentSport: '', currentScreen: 'Home' });
    setFocusedTab('Home');
    navigationRef.current?.navigate('Home');
  };

  return (
    <Tab.Navigator
      initialRouteName="Home" // Set Home as the default view
      screenOptions={({ route }) => ({
        ...commonHeaderOptions(handleHeaderPress),
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: 'black',
          color: 'white',
        },
        tabBarLabel: () => null, // Remove the label
        tabBarIcon: ({ color, size, focused }) => {
          const sport = route.name.split(' ')[0].toLowerCase();
          return getTabBarIcon(sport, focused || focusedTab === route.name, color, size);
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={withSafeArea((props) => <HomeScreen {...props} />)}
        options={{
          tabBarButton: () => null, // Hide the Home tab button
        }}
      />
      {generateTabScreens()}
      <Tab.Screen
        name="MatchSessionScreen"
        component={withSafeArea(MatchSessionScreen)}
        options={{
          tabBarButton: () => null, // Hide the tab button
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            setFocusedTab(`${state.currentSport.charAt(0).toUpperCase() + state.currentSport.slice(1)} Matches`);
          },
        })}
      />
      <Tab.Screen
        name="DuelMatchScreen"
        component={withSafeArea(DuelMatchScreen)}
        options={{
          tabBarButton: () => null, // Hide the tab button
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            setFocusedTab(`${state.currentSport.charAt(0).toUpperCase() + state.currentSport.slice(1)} Matches`);
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [state, setState] = React.useState({ currentSport: '', currentScreen: '' });
  const navigationRef = React.useRef(null);

  const [fontsLoaded] = useFonts({
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

  const handleHeaderPress = () => {
    setState({ currentSport: '', currentScreen: 'Home' });
    navigationRef.current?.navigate('Home');
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={commonHeaderOptions(handleHeaderPress)}>
        <Stack.Screen name="Tabs" options={{ headerShown: false }}>
          {props => <TabNavigator {...props} navigationRef={navigationRef} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});