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

// Import context
import { useActivity } from '@/contexts/ActivityContext';

// Import types
import type { HealthAppType, HealthApp } from '@/services/deviceHealth';

import { styles } from './styles';

const HealthAppSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { availableApps, detectHealthApps, selectHealthApp, isLoading } =
    useActivity();

  const [selectedAppType, setSelectedAppType] = useState<HealthAppType | null>(
    null
  );

  useEffect(() => {
    detectHealthApps();
  }, [detectHealthApps]);

  const handleAppSelect = async (app: HealthApp) => {
    // Check if app is available
    if (!app.isAvailable && app.source !== 'manual') {
      Alert.alert(
        'App Not Available',
        `${app.name} is not available on your device. Please install it first or choose another option.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedAppType(app.source);

    try {
      await selectHealthApp(app.source);

      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: `Successfully connected to ${app.name}`,
      });

      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (error) {
      console.error('Failed to select health app:', error);

      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: `Failed to connect to ${app.name}. Please check permissions.`,
      });

      setSelectedAppType(null);
    }
  };

  const handleSkip = async () => {
    // Save skip status
    await AsyncStorage.setItem('healthSetupSkipped', 'true');

    // For web testing, directly navigate to Home
    if (Platform.OS === 'web') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
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
              routes: [{ name: 'Home' as never }],
            });
          },
        },
      ]
    );
  };

  const getAppIcon = (
    appSource: HealthAppType
  ): keyof typeof Ionicons.glyphMap => {
    switch (appSource) {
      case 'healthkit':
        return 'heart-outline';
      case 'googlefit':
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

  const getIconColor = (appSource: HealthAppType): string => {
    switch (appSource) {
      case 'healthkit':
        return '#FF3B30';
      case 'googlefit':
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

  const getAppDescription = (source: HealthAppType): string => {
    switch (source) {
      case 'healthkit':
        return 'Integrates with all iOS health apps';
      case 'googlefit':
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

  const renderHealthApp = (app: HealthApp) => {
    const isSelected = selectedAppType === app.source;
    const isDisabled = !app.isAvailable && app.source !== 'manual';

    return (
      <TouchableOpacity
        key={app.source}
        style={[
          styles.appCard,
          isSelected && styles.selectedCard,
          isDisabled && styles.disabledCard,
        ]}
        onPress={() => handleAppSelect(app)}
        disabled={isLoading || isDisabled}
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
          {!app.isAvailable && app.source !== 'manual' && (
            <Text style={styles.notAvailableText}>Not available</Text>
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
              {availableApps.map(renderHealthApp)}
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
