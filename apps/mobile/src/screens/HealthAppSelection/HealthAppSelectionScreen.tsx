import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from './styles';
import { HealthApp, HealthAppType } from '@/types/health';
import { useAvailableHealthApps, useSelectHealthApp } from '@/hooks';

const HealthAppSelectionScreen = () => {
  const navigation = useNavigation();

  const { data: availableApps = [], isLoading } = useAvailableHealthApps();
  const selectHealthApp = useSelectHealthApp();

  const [selectedAppType, setSelectedAppType] = useState<HealthAppType | null>(
    null
  );

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
      await selectHealthApp.mutateAsync(app.source);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (error) {
      console.error('Failed to select health app:', error);
      setSelectedAppType(null);
    }
  };

  const handleSkip = async () => {
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
                disabled={selectHealthApp.isPending}
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
                {selectedAppType === app.source &&
                  selectHealthApp.isPending && (
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
