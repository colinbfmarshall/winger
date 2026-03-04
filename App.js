import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, ActivityIndicator, LogBox } from 'react-native';
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

// Global error handler for unhandled promise rejections
if (!__DEV__) {
  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
  global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    console.log('[App] Global error:', error, 'isFatal:', isFatal);
    originalHandler?.(error, isFatal);
  });
}

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

const TabNavigator = ({ navigationRef, preloadedSports }) => {
  const [fontsLoaded] = useFonts({
    RobotoCondensed_700Bold_Italic,
  });

  const handleHeaderPress = () => {
    navigationRef.current?.navigate('Play');
  };

  if (!fontsLoaded) {
    return null;
  }

  // Pass preloaded sports to screens that need them
  const PlayScreenWithSports = (props) => (
    <PlayScreen {...props} preloadedSports={preloadedSports} />
  );

  const ResultsScreenWithSports = (props) => (
    <ResultsScreen {...props} preloadedSports={preloadedSports} />
  );

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
        component={withSafeArea(PlayScreenWithSports)}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Always navigate to Play, even if already on Play tab
            // Use reset to ensure we start fresh
            navigation.reset({
              index: 0,
              routes: [{ name: 'Play' }],
            });
          },
        })}
      />
      <Tab.Screen
        name="Results"
        component={withSafeArea(ResultsScreenWithSports)}
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

const StackNavigator = ({ preloadedSports }) => {
  const navigationRef = useRef();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TabNavigator" 
        options={{ headerShown: false }}
      >
        {(props) => (
          <TabNavigator 
            {...props} 
            navigationRef={navigationRef}
            preloadedSports={preloadedSports} 
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [splashComplete, setSplashComplete] = useState(false);
  const [preloadedSports, setPreloadedSports] = useState(null);

  const handleSportsLoaded = (sports) => {
    console.log('Sports loaded in App:', sports?.length);
    setPreloadedSports(sports);
  };

  const handleSplashComplete = () => {
    console.log('Splash screen complete, transitioning to main app');
    setSplashComplete(true);
  };

  // Use a single timer for splash screen duration
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSplashComplete();
    }, 4500); // 4.5 seconds total splash time

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Show splash screen until it's complete
  if (!splashComplete) {
    return <SplashScreen onSportsLoaded={handleSportsLoaded} />;
  }

  // Show auth loading after splash is complete
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
        <StackNavigator preloadedSports={preloadedSports} />
      </NavigationContainer>
    </View>
  );
};

// Error boundary to catch render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorDetail}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: Colors.text,
    fontSize: 18,
    marginBottom: 10,
  },
  errorDetail: {
    color: Colors.primary,
    fontSize: 12,
    textAlign: 'center',
  },
});

const App = () => {
  return (
    <View style={styles.appContainer}>
      <ErrorBoundary>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </View>
  );
};

export default App;