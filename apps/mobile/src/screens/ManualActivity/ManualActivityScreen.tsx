import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

import { styles } from './styles';
import { useAuth } from '@/contexts/AuthContext';
import { calculateActivityCalories } from '@/services/deviceHealth';
import { useAddManualActivity } from '@/hooks/useActivity';

interface ActivityOption {
  type: string;
  label: string;
  icon: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: 'walking', label: 'Walking', icon: '🚶' },
  { type: 'running', label: 'Running', icon: '🏃' },
  { type: 'cycling', label: 'Cycling', icon: '🚴' },
  { type: 'swimming', label: 'Swimming', icon: '🏊' },
  { type: 'gym', label: 'Gym/Workout', icon: '🏋️' },
  { type: 'yoga', label: 'Yoga', icon: '🧘' },
  { type: 'sports', label: 'Sports', icon: '⚽' },
  { type: 'dancing', label: 'Dancing', icon: '💃' },
  { type: 'other', label: 'Other', icon: '🏃' },
];

const ManualActivityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activityType, setActivityType] = useState('walking');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>(
    'moderate'
  );
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const setManualActivity = useAddManualActivity();

  useEffect(() => {
    if (duration && !calories && user) {
      const durationNum = Number(duration);

      const estimated = calculateActivityCalories(
        {
          activityType,
          duration: durationNum,
          intensity,
        },
        {
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          activity_level: user.activity_level,
        }
      );

      setEstimatedCalories(estimated);
    }
  }, [duration, intensity, activityType, user]);

  const handleSubmit = async () => {
    if (!duration || isNaN(Number(duration))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Duration',
        text2: 'Please enter a valid duration in minutes',
      });
      return;
    }

    setIsLoading(true);
    try {
      const activityData = {
        activityType,
        duration: Number(duration),
        intensity,
        caloriesBurned: calories ? Number(calories) : estimatedCalories,
        notes,
      };

      await setManualActivity.mutate(activityData);

      Toast.show({
        type: 'success',
        text1: 'Activity Logged!',
        text2: `${activityData.caloriesBurned} calories burned`,
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to log activity',
        text2: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedActivity = ACTIVITY_OPTIONS.find(a => a.type === activityType);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Type</Text>
          <View style={styles.activityPicker}>
            <Text style={styles.activityIcon}>{selectedActivity?.icon}</Text>
            <Picker
              selectedValue={activityType}
              onValueChange={setActivityType}
              style={styles.picker}
            >
              {ACTIVITY_OPTIONS.map(option => (
                <Picker.Item
                  key={option.type}
                  label={option.label}
                  value={option.type}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intensity</Text>
          <View style={styles.intensityContainer}>
            {(['low', 'moderate', 'high'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityButton,
                  intensity === level && styles.intensityButtonActive,
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text
                  style={[
                    styles.intensityText,
                    intensity === level && styles.intensityTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Calories Burned{' '}
            {estimatedCalories > 0 &&
              !calories &&
              `(Est. ${estimatedCalories})`}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              estimatedCalories > 0 ? estimatedCalories.toString() : 'Optional'
            }
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.hint}>Leave empty to use our estimation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !duration}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Log Activity</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ManualActivityScreen;
