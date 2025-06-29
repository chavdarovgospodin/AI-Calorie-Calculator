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

  const getAppIcon = (appType: HealthAppType) => {
    switch (appType) {
      case HealthAppType.APPLE_HEALTH:
        return '❤️';
      case HealthAppType.GOOGLE_FIT:
        return '🏃';
      case HealthAppType.SAMSUNG_HEALTH:
        return '💪';
      case HealthAppType.HUAWEI_HEALTH:
        return '🏋️';
      case HealthAppType.DEVICE_SENSORS:
        return '📱';
      case HealthAppType.MANUAL:
        return '✏️';
      default:
        return '🏃';
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
          <Text style={styles.appIcon}>{getAppIcon(app.type)}</Text>
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

        {isSelected && isLoading && (
          <ActivityIndicator color="#007AFF" style={styles.loader} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
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
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HealthAppSelectionScreen;
