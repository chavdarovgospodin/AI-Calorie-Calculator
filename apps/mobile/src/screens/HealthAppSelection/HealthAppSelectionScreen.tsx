// apps/mobile/src/screens/HealthAppSelection/HealthAppSelectionScreen.tsx
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
  const [isConnecting, setIsConnecting] = useState(false);

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
    setIsConnecting(true);

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
    } finally {
      setIsConnecting(false);
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
        { text: 'Cancel', style: 'cancel' },
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Your Health App</Text>
        <Text style={styles.subtitle}>
          Sync your activities automatically from your favorite fitness app
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Available Apps</Text>
          <View style={styles.appsContainer}>
            {availableApps.map(app => (
              <TouchableOpacity
                key={app.source}
                style={[
                  styles.appCard,
                  selectedAppType === app.source && styles.selectedCard,
                  !app.isAvailable &&
                    app.source !== 'manual' &&
                    styles.disabledCard,
                ]}
                onPress={() => handleAppSelect(app)}
                disabled={isConnecting}
              >
                <View style={styles.appIconContainer}>
                  <Text style={styles.appIcon}>{app.icon}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appDescription}>{app.description}</Text>
                  {!app.isAvailable && app.source !== 'manual' && (
                    <Text style={styles.notAvailableText}>Not installed</Text>
                  )}
                </View>
                {selectedAppType === app.source && isConnecting && (
                  <ActivityIndicator size="small" color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default HealthAppSelectionScreen;
