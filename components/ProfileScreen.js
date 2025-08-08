import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFonts, RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

SplashScreen.preventAutoHideAsync();

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isAnonymous, updateUserProfile } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isEditing, setIsEditing] = useState(false);
  
  let [fontsLoaded] = useFonts({
    Roboto_400Regular, RobotoCondensed_700Bold
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleLogout = () => {
    Alert.alert(
      'Reset Account',
      'This will create a new anonymous account and you\'ll lose all your current data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleUpdateNickname = async () => {
    if (nickname.trim() && nickname.trim() !== user?.nickname) {
      const result = await updateUserProfile({ nickname: nickname.trim() });
      if (result.success) {
        setIsEditing(false);
        Alert.alert('Success', 'Nickname updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update nickname');
      }
    } else {
      setIsEditing(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, styles.screenBackground]}>
      <View style={styles.titleSection}>
        <MaterialCommunityIcons name={'skull'} size={60} color={'tomato'} />
        <View style={styles.userInfo}>
          {isAnonymous ? (
            <>
              <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>
                Anonymous Player
              </Text>
              <Text style={[styles.email, { fontFamily: 'Roboto_400Regular' }]}>
                ID: {user?.id ? user.id.slice(0, 8) : 'Loading...'}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, { fontFamily: 'RobotoCondensed_700Bold' }]}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.nickname || 'Player'}
              </Text>
              {user?.email && (
                <Text style={[styles.email, { fontFamily: 'Roboto_400Regular' }]}>
                  {user.email}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/* Nickname Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nickname</Text>
          <TouchableOpacity 
            onPress={() => isEditing ? handleUpdateNickname() : setIsEditing(true)}
            style={styles.editButton}
          >
            <MaterialCommunityIcons 
              name={isEditing ? "check" : "pencil"} 
              size={20} 
              color="tomato" 
            />
          </TouchableOpacity>
        </View>
        {isEditing ? (
          <TextInput
            style={styles.nicknameInput}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            placeholderTextColor="#999"
            maxLength={20}
            autoFocus
            onBlur={handleUpdateNickname}
          />
        ) : (
          <Text style={styles.sectionContent}>
            {user?.nickname || 'Tap to set a nickname'}
          </Text>
        )}
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

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="refresh" size={20} color="white" />
          <Text style={[styles.logoutButtonText, { fontFamily: 'RobotoCondensed_700Bold' }]}>
            RESET ACCOUNT
          </Text>
        </TouchableOpacity>
        
        {isAnonymous && (
          <Text style={[styles.upgradeHint, { fontFamily: 'Roboto_400Regular' }]}>
            💡 Your progress is saved to this anonymous account. 
            Account upgrades coming soon!
          </Text>
        )}
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
    justifyContent: 'flex-start',
    margin: 20,
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'tomato',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  title: {
    fontSize: 19,
    color: '#333333', // Dark gray text
  },
  email: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333', // Dark gray text
  },
  editButton: {
    padding: 5,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666666', // Lighter gray text
  },
  nicknameInput: {
    fontSize: 16,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: 'tomato',
    paddingVertical: 5,
    fontFamily: 'Roboto_400Regular',
  },
  logoutSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: 'tomato',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  upgradeHint: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default ProfileScreen;