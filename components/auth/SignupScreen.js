import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Header';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup, error, clearError } = useAuth();

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    RobotoCondensed_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, firstName, lastName } = formData;

    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const { confirmPassword, ...signupData } = formData;
      signupData.email = signupData.email.trim().toLowerCase();
      signupData.firstName = signupData.firstName.trim();
      signupData.lastName = signupData.lastName.trim();

      const result = await signup(signupData);
      
      if (!result.success) {
        Alert.alert('Signup Failed', result.error || 'Please check your information');
      }
      // Success is handled by the AuthContext state change
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Header fontSize={40} fontColor="white" stopColor="tomato" />
          <Text style={[styles.subtitle, { fontFamily: 'Roboto_400Regular' }]}>
            Create your account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { fontFamily: 'Roboto_400Regular' }]}>
                First Name
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: 'Roboto_400Regular' }]}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="First name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { fontFamily: 'Roboto_400Regular' }]}>
                Last Name
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: 'Roboto_400Regular' }]}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Last name"
                placeholderTextColor="#666"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { fontFamily: 'Roboto_400Regular' }]}>
              Email
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Roboto_400Regular' }]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { fontFamily: 'Roboto_400Regular' }]}>
              Password
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Roboto_400Regular' }]}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { fontFamily: 'Roboto_400Regular' }]}>
              Confirm Password
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Roboto_400Regular' }]}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              placeholderTextColor="#666"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={[styles.signupButtonText, { fontFamily: 'RobotoCondensed_700Bold' }]}>
                SIGN UP
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { fontFamily: 'Roboto_400Regular' }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
              <Text style={[styles.loginLink, { fontFamily: 'RobotoCondensed_700Bold' }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  signupButton: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  signupButtonDisabled: {
    backgroundColor: '#666',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#ccc',
    fontSize: 16,
  },
  loginLink: {
    color: 'tomato',
    fontSize: 16,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
