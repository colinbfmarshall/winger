import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useFonts, RobotoCondensed_700Bold_Italic } from '@expo-google-fonts/roboto-condensed';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import PlayScreen from './components/PlayScreen';
import ResultsScreen from './components/ResultsScreen';
import SplashScreen from './components/SplashScreen';
import Colors from './config/colors';

// Create a custom dark theme to prevent white flashes
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.border,
  },
};

ExpoSplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const withSafeArea = (Component) => (props) => (
  <SafeAreaView style={styles.safeArea}>
    <Component {...props} />
  </SafeAreaView>
);

const commonHeaderOptions = (handleHeaderPress) => ({
  headerTitle: () => <Header stopColor={Colors.primary} onPress={handleHeaderPress} />,
  headerStyle: {
    backgroundColor: Colors.background,
    height: 60,
    borderBottomColor: Colors.primary, // Set the bottom border color
    borderBottomWidth: 1, // Set the bottom border width
  },
});

const TabNavigator = ({ navigationRef }) => {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const handleHeaderPress = () => {
    navigationRef.current?.navigate('Play');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tab.Navigator
      initialRouteName="Play" // Set Play as the default view
      screenOptions={({ route }) => ({
        ...commonHeaderOptions(handleHeaderPress),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text,
        tabBarStyle: {
          backgroundColor: Colors.background,
          color: Colors.text,
          borderTopWidth: 1,
          borderTopColor: `${Colors.primary}80`, // 50% opacity
        },
        tabBarLabel: route.name.toUpperCase(), // Uppercase the label
        tabBarLabelStyle: { 
          fontFamily: 'RobotoCondensed_700Bold_Italic',
          fontWeight: 'bold',
          fontSize: 30,
        },
        tabBarIcon: () => null, // Remove icons
      })}
    >
      <Tab.Screen
        name="Play"
        component={withSafeArea(PlayScreen)}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to Play, even if already on Play tab
            navigation.navigate('Play');
          },
        })}
      />
      <Tab.Screen
        name="Results"
        component={withSafeArea(ResultsScreen)}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to Results, even if already on Results tab
            navigation.navigate('Results');
          },
        })}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [appIsLoading, setAppIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading process
    const timer = setTimeout(() => {
      setAppIsLoading(false);
    }, 4500); // Adjust the timeout duration as needed

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  if (appIsLoading) {
    console.log('App is loading...');
    return <SplashScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <NavigationContainer theme={customDarkTheme}>
        {/* Always show main app since users are auto-authenticated anonymously */}
        <StackNavigator />
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

const App = () => {
  return (
    <View style={styles.appContainer}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
};

export default App;