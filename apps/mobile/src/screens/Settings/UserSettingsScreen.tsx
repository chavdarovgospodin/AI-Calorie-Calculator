// apps/mobile/src/screens/Settings/UserSettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

import { HealthAppType } from '@/types/health';
import { styles } from './styles';
import { useUserProfile } from '@/hooks/useUser';
import {
  useDisconnectHealthApp,
  useSelectedHealthApp,
} from '@/hooks/useHealthApp';

const UserSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { data: selectedApp } = useSelectedHealthApp();
  const disconnectHealthApp = useDisconnectHealthApp();
  const { data: profile, isLoading } = useUserProfile();

  const handleChangeHealthApp = () => {
    navigation.navigate('HealthAppSelection');
  };

  const handleDisconnectHealthApp = () => {
    if (!selectedApp) return;

    Alert.alert(
      'Disconnect Health App',
      `Are you sure you want to disconnect from ${formatHealthApp(selectedApp)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnectHealthApp.mutate();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
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

  const formatHealthApp = (app: HealthAppType): string => {
    const appNames: Record<HealthAppType, string> = {
      [HealthAppType.APPLE_HEALTH]: 'Apple Health',
      [HealthAppType.GOOGLE_FIT]: 'Google Fit',
      [HealthAppType.HUAWEI_HEALTH]: 'Huawei Health',
      [HealthAppType.SAMSUNG_HEALTH]: 'Samsung Health',
      [HealthAppType.DEVICE_SENSORS]: 'Device Sensors',
      [HealthAppType.MANUAL]: 'Manual Entry',
    };
    return appNames[app] || app;
  };

  if (isLoading) {
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
      <ScrollView>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{profile?.age || '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{profile?.gender || '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{profile?.height || '-'} cm</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{profile?.weight || '-'} kg</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Goal</Text>
              <Text style={styles.infoValue}>
                {profile?.daily_calorie_goal || '-'} cal
              </Text>
            </View>
          </View>
        </View>

        {/* Health App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health App</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Connected App</Text>
              <Text style={styles.infoValue}>
                {selectedApp ? formatHealthApp(selectedApp) : 'Not connected'}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeHealthApp}
              >
                <Ionicons name="apps-outline" size={18} color="#fff" />
                <Text style={styles.changeButtonText}>
                  {selectedApp ? 'Change App' : 'Connect App'}
                </Text>
              </TouchableOpacity>

              {selectedApp && (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnectHealthApp}
                  activeOpacity={0.7}
                  disabled={disconnectHealthApp.isPending}
                >
                  {disconnectHealthApp.isPending ? (
                    <ActivityIndicator size="small" color="#ff6b6b" />
                  ) : (
                    <>
                      <Ionicons
                        name="unlink-outline"
                        size={18}
                        color="#ff6b6b"
                      />
                      <Text style={styles.disconnectButtonText}>
                        Disconnect
                      </Text>
                    </>
                  )}
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
