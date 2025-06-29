import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useActivity } from '@/contexts/ActivityContext';

import { styles } from './styles';
import { HealthApp, HealthAppType } from '@/services/healthService/interfaces';

const HealthAppSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { availableApps, detectHealthApps, selectHealthApp, isLoading } =
    useActivity();

  const [selectedAppType, setSelectedAppType] = useState<HealthAppType | null>(
    null
  );

  useEffect(() => {
    detectHealthApps();
  }, []);

  const handleAppSelect = async (app: HealthApp) => {
    if (!app.isAvailable) {
      Alert.alert(
        'App Not Available',
        `${app.name} is not installed on your device. Please install it first or choose another option.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedAppType(app.type);

    const connected = await selectHealthApp(app.type);

    if (connected) {
      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: `Successfully connected to ${app.name}`,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: `Failed to connect to ${app.name}. Please check permissions.`,
      });
      setSelectedAppType(null);
    }
  };

  const handleSkip = () => {
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

  const getAppIcon = (
    appType: HealthAppType
  ): keyof typeof Ionicons.glyphMap => {
    switch (appType) {
      case HealthAppType.APPLE_HEALTH:
        return 'heart-outline';
      case HealthAppType.GOOGLE_FIT:
        return 'fitness-outline';
      case HealthAppType.SAMSUNG_HEALTH:
        return 'barbell-outline';
      case HealthAppType.HUAWEI_HEALTH:
        return 'pulse-outline';
      case HealthAppType.DEVICE_SENSORS:
        return 'phone-portrait-outline';
      case HealthAppType.MANUAL:
        return 'create-outline';
      default:
        return 'fitness-outline';
    }
  };

  const getIconColor = (appType: HealthAppType) => {
    switch (appType) {
      case HealthAppType.APPLE_HEALTH:
        return '#FF3B30';
      case HealthAppType.GOOGLE_FIT:
        return '#4285F4';
      case HealthAppType.SAMSUNG_HEALTH:
        return '#1428A0';
      case HealthAppType.HUAWEI_HEALTH:
        return '#FF6B6B';
      case HealthAppType.DEVICE_SENSORS:
        return '#007AFF';
      case HealthAppType.MANUAL:
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const renderHealthApp = (app: HealthApp) => {
    const isSelected = selectedAppType === app.type;
    const isDisabled = !app.isAvailable && app.type !== HealthAppType.MANUAL;

    return (
      <TouchableOpacity
        key={app.type}
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
            name={getAppIcon(app.type)}
            size={32}
            color={isDisabled ? '#999' : getIconColor(app.type)}
          />
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appName, isDisabled && styles.disabledText]}>
            {app.name}
          </Text>
          <Text
            style={[styles.appDescription, isDisabled && styles.disabledText]}
          >
            {app.description}
          </Text>
          {!app.isAvailable && app.type !== HealthAppType.MANUAL && (
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
