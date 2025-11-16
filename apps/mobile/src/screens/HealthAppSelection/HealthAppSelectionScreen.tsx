import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useActivity } from '@/contexts/ActivityContext';

import { styles } from './styles';
import { HealthApp, HealthAppType } from '@/hooks/interfaces';

const HealthAppSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { availableApps, detectHealthApps, selectHealthApp, isLoading } =
    useActivity();

  const [selectedAppSource, setSelectedAppSource] =
    useState<ActivitySourceType | null>(null);

  useEffect(() => {
    detectHealthApps();
  }, [detectHealthApps]);

  const handleAppSelect = async (app: any) => {
    if (!app.isInstalled && app.source !== 'manual') {
      Alert.alert(
        'App Not Available',
        `${app.name} is not installed on your device. Please install it first or choose another option.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedAppType(app.source);

    const connected = await selectHealthApp(app.source);

      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: `Successfully connected to ${app.name}`,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: `Failed to connect to ${app.name}. Please check permissions.`,
      });
      setSelectedAppSource(null);
    }
  };

  const handleSkip = async () => {
    // Save skip status
    await AsyncStorage.setItem('healthSetupSkipped', 'true');

    // For web testing, directly navigate to Home
    if (Platform.OS === 'web') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    }

    Alert.alert(
      'Skip Health App Setup?',
      'You can always connect a health app later from settings. For now, you can manually log your activities.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  };

  const getAppIcon = (appSource: string): keyof typeof Ionicons.glyphMap => {
    switch (appSource) {
      case 'apple_health':
        return 'heart-outline';
      case 'google_fit':
        return 'fitness-outline';
      case 'samsung_health':
        return 'barbell-outline';
      case 'huawei_health':
        return 'pulse-outline';
      case 'device_sensors':
        return 'phone-portrait-outline';
      case 'manual':
        return 'create-outline';
      default:
        return 'fitness-outline';
    }
  };

  const getIconColor = (appSource: string) => {
    switch (appSource) {
      case 'apple_health':
        return '#FF3B30';
      case 'google_fit':
        return '#4285F4';
      case 'samsung_health':
        return '#1428A0';
      case 'huawei_health':
        return '#FF6B6B';
      case 'device_sensors':
        return '#007AFF';
      case 'manual':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const renderHealthApp = (app: HealthApp) => {
    const isSelected = selectedAppType === app.source;
    const isDisabled = !app.isAvailable && app.source !== HealthAppType.MANUAL;

    return (
      <TouchableOpacity
        key={app.source}
        style={[
          styles.appCard,
          isSelected && styles.selectedCard,
          isDisabled && styles.disabledCard,
        ]}
        onPress={() => handleAppSelect(app)}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.appIconContainer}>
          <Ionicons
            name={getAppIcon(app.source)}
            size={32}
            color={isDisabled ? '#999' : getIconColor(app.source)}
          />
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appName, isDisabled && styles.disabledText]}>
            {app.name}
          </Text>
          <Text
            style={[styles.appDescription, isDisabled && styles.disabledText]}
          >
            {getAppDescription(app.source)}
          </Text>
          {!app.isAvailable && app.source !== HealthAppType.MANUAL && (
            <Text style={styles.notAvailableText}>Not installed</Text>
          )}
        </View>

        {isSelected && isLoading ? (
          <ActivityIndicator color="#007AFF" style={styles.loader} />
        ) : isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
        ) : null}
      </TouchableOpacity>
    );
  };

  const getAppDescription = (source: string): string => {
    switch (source) {
      case 'apple_health':
        return 'Integrates with all iOS health apps';
      case 'google_fit':
        return 'Integrates with most Android fitness apps';
      case 'samsung_health':
        return 'Direct Samsung Health integration';
      case 'huawei_health':
        return 'Direct Huawei Health integration';
      case 'device_sensors':
        return 'Use built-in phone sensors';
      case 'manual':
        return 'Manually log your activities';
      default:
        return '';
    }
  };

  // Add manual entry option if not already in the list
  const appsToDisplay = [...availableApps];
  if (!appsToDisplay.find(app => app.source === 'manual')) {
    appsToDisplay.push({
      name: 'Manual Entry',
      source: 'manual',
      isInstalled: true,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons
            name="fitness-outline"
            size={48}
            color="#007AFF"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Connect Your Health App</Text>
          <Text style={styles.subtitle}>
            Choose how you want to track your physical activity and calories
            burned
          </Text>
        </View>

        <View style={styles.appsContainer}>
          {isLoading && availableApps.length === 0 ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <Text style={styles.sectionTitle}>Available Options</Text>
              {appsToDisplay.map(renderHealthApp)}
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color="#666"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HealthAppSelectionScreen;
