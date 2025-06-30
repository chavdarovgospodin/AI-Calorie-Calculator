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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/contexts/ActivityContext';
import { getUserProfile, UserProfile } from '@/services/users';
import { styles } from './styles';

const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { selectedApp, disconnectHealthApp } = useActivity();
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

  const handleDisconnectHealthApp = () => {
    if (!selectedApp) return;

    Alert.alert(
      'Disconnect Health App',
      `Are you sure you want to disconnect from ${formatHealthApp(selectedApp)}? You can always reconnect later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectHealthApp();
              Alert.alert('Success', 'Health app disconnected successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect health app');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile'); // Uncomment when EditProfile is implemented
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

  const calculateAge = () => {
    if (!profile?.age) return 'N/A';
    return `${profile.age} years`;
  };

  const getBMI = () => {
    if (!profile?.height || !profile?.weight) return 'N/A';
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = getBMI();
    if (bmi === 'N/A') return '';
    const bmiValue = parseFloat(bmi);

    if (bmiValue < 18.5) return '(Underweight)';
    if (bmiValue < 25) return '(Normal)';
    if (bmiValue < 30) return '(Overweight)';
    return '(Obese)';
  };

  const getBMIColor = () => {
    const bmi = getBMI();
    if (bmi === 'N/A') return '#666';
    const bmiValue = parseFloat(bmi);

    if (bmiValue < 18.5) return '#FF9500';
    if (bmiValue < 25) return '#34C759';
    if (bmiValue < 30) return '#FF9500';
    return '#FF3B30';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-outline" size={20} color="#007AFF" /> User
            Information
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="mail-outline" size={16} color="#666" /> Email
              </Text>
              <Text style={styles.infoValue}>
                {profile?.email || user?.email || 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="calendar-outline" size={16} color="#666" /> Age
              </Text>
              <Text style={styles.infoValue}>{calculateAge()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="person-outline" size={16} color="#666" /> Gender
              </Text>
              <Text style={styles.infoValue}>
                {profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1)
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="resize-outline" size={16} color="#666" /> Height
              </Text>
              <Text style={styles.infoValue}>
                {profile?.height || 'N/A'} cm
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="scale-outline" size={16} color="#666" /> Weight
              </Text>
              <Text style={styles.infoValue}>
                {profile?.weight || 'N/A'} kg
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="analytics-outline" size={16} color="#666" /> BMI
              </Text>
              <Text style={[styles.infoValue, { color: getBMIColor() }]}>
                {getBMI()} {getBMICategory()}
              </Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="at-outline" size={20} color="#007AFF" /> Goals
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="flag-outline" size={16} color="#666" /> Current
                Goal
              </Text>
              <Text style={styles.infoValue}>
                {profile?.goal ? getGoalText(profile.goal) : 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons name="flame-outline" size={16} color="#666" /> Daily
                Calorie Target
              </Text>
              <Text style={styles.infoValue}>
                {profile?.calorie_goal || 'N/A'} cal
              </Text>
            </View>
          </View>
        </View>

        {/* Health App Integration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="fitness-outline" size={20} color="#007AFF" />{' '}
            Activity Tracking
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color="#666"
                />{' '}
                Connected App
              </Text>
              <Text style={styles.infoValue}>
                {formatHealthApp(selectedApp)}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeHealthApp}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.changeButtonText}>
                  {selectedApp ? 'Change App' : 'Connect App'}
                </Text>
              </TouchableOpacity>

              {selectedApp && (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnectHealthApp}
                  activeOpacity={0.7}
                >
                  <Ionicons name="unlink-outline" size={18} color="#ff6b6b" />
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff4757" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserSettingsScreen;
