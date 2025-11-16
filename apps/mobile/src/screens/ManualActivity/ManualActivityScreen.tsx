// apps/mobile/src/screens/ManualActivity/ManualActivityScreen.tsx
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
import { useAuth } from '@/contexts/AuthContext';
import { calculateActivityCalories } from '@/services/deviceHealth';
import { User } from '@/types/user';
import { styles } from './styles';
import { useAddManualActivity } from '@/hooks/useActivity';

const ACTIVITY_OPTIONS = [
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

const ManualActivityScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const addActivity = useAddManualActivity();

  const [activityType, setActivityType] = useState('walking');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>(
    'moderate'
  );
  const [manualCalories, setManualCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedCalories, setEstimatedCalories] = useState(0);

  useEffect(() => {
    if (duration && !manualCalories && user) {
      const durationNum = Number(duration);
      if (durationNum > 0) {
        const estimated = calculateActivityCalories(
          { activityType, duration: durationNum, intensity },
          user as User
        );
        setEstimatedCalories(estimated);
      }
    }
  }, [duration, intensity, activityType, manualCalories, user]);

  const handleSubmit = () => {
    const durationNum = Number(duration);

    if (!duration || isNaN(durationNum) || durationNum <= 0) {
      return;
    }

    const finalCalories = manualCalories
      ? Number(manualCalories)
      : estimatedCalories;

    addActivity.mutate(
      {
        activityType,
        duration: durationNum,
        intensity,
        caloriesBurned: finalCalories,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      }
    );
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
              !manualCalories &&
              `(Est. ${estimatedCalories})`}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={estimatedCalories.toString() || '0'}
            value={manualCalories}
            onChangeText={setManualCalories}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optional)</Text>
          <TextInput
            style={[styles.input]}
            placeholder="Add notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton]}
          onPress={handleSubmit}
          disabled={addActivity.isPending || !duration}
        >
          {addActivity.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Log Activity</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ManualActivityScreen;
