import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import MatchesScreen from './components/matches/matchesScreen';
import MatchSessionScreen from './components/matches/matchSessionScreen';
import LoadingSplashScreen from './components/LoadingSplashScreen';

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
  headerTitle: () => <Header fontSize={20} fontColor="white" stopColor="tomato" onPress={handleHeaderPress} />,
  headerStyle: {
    backgroundColor: 'black',
    height: 82,
    borderBottomColor: 'tomato', // Set the bottom border color
    borderBottomWidth: 1, // Set the bottom border width
  },
});

const TabNavigator = ({ navigationRef }) => {
  const [state, setState] = React.useState({ currentSport: '', currentScreen: '' });
  const [focusedTab, setFocusedTab] = React.useState('Home');

  const getTabBarIcon = (name, focused, color, size) => {
    let iconName;
    switch (name) {
      case 'home':
        iconName = 'home';
        break;
      case 'duel':
        iconName = 'sword-cross';
        break;
      case 'rate':
        iconName = 'counter';
        break;
      case 'profile':
        iconName = 'skull';
        break;
      default:
        iconName = 'help-circle';
        break;
    }
    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
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
        tabBarLabel: route.name, // Add the label
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarIcon: ({ color, size, focused }) => getTabBarIcon(route.name, focused, color, size),
      })}
    >
      <Tab.Screen
        name="home"
        component={withSafeArea(HomeScreen)}
      />
      <Tab.Screen
        name="duel"
        component={withSafeArea(MatchesScreen)}
        initialParams={{ match_type: 'duel' }} // Pass the 'duel' param
      />
      <Tab.Screen
        name="rate"
        component={withSafeArea(MatchesScreen)}
        initialParams={{ match_type: 'rate' }} // Pass the 'rate' param
      />
      <Tab.Screen
        name="profile"
        component={withSafeArea(ProfileScreen)}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MatchSessionScreen" component={MatchSessionScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [appIsLoading, setAppIsLoading] = useState(true);

  useEffect(() => {
    console.log('App is loading...');
    // Simulate a loading process
    const timer = setTimeout(() => {
      setAppIsLoading(false);
    }, 4000); // Adjust the timeout duration as needed

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  if (appIsLoading) {
    console.log('App is loading2...');
    return <LoadingSplashScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="tomato" />
      <NavigationContainer>
        {/* Always show main app since users are auto-authenticated anonymously */}
        <StackNavigator />
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;