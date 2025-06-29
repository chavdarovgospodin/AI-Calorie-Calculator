import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/contexts/ActivityContext';
import { getUserProfile, UserProfile } from '@/services/users';
import { styles } from './styles';

const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { selectedApp, disconnect } = useActivity();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeHealthApp = () => {
    navigation.navigate('HealthAppSelection');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'Lose Weight (-0.5kg/week)';
      case 'gain':
        return 'Gain Weight (+0.5kg/week)';
      case 'maintain':
        return 'Maintain Weight';
      default:
        return goal;
    }
  };

  const formatHealthApp = (app: string | null) => {
    if (!app) return 'None';
    return app
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {profile?.age || 'N/A'} years
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1)
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>
                {profile?.height || 'N/A'} cm
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>
                {profile?.weight || 'N/A'} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Goal</Text>
              <Text style={styles.infoValue}>
                {profile?.goal ? getGoalText(profile.goal) : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Daily Calorie Target</Text>
              <Text style={styles.infoValue}>
                {profile?.calorie_goal || 'N/A'} cal
              </Text>
            </View>
          </View>
        </View>

        {/* Health App Integration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Tracking</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Connected App</Text>
              <Text style={styles.infoValue}>
                {formatHealthApp(selectedApp)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeHealthApp}
              activeOpacity={0.7}
            >
              <Text style={styles.changeButtonText}>Change Health App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserSettingsScreen;
