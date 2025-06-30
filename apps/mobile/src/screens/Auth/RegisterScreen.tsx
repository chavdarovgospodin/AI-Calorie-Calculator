import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/services/interfaces';
import { ActivityLevel, Gender, Goal } from '@/services/enums';

import { registerStyles as styles } from './styles';
import { RegisterFormData } from './interfaces';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: Gender.MALE,
    height: '',
    weight: '',
    activity_level: ActivityLevel.SEDENTARY,
    goal: Goal.MAINTAIN_WEIGHT,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 13 || age > 120) {
      errors.age = 'Please enter a valid age (13-120)';
    }

    const height = parseFloat(formData.height);
    if (!formData.height || isNaN(height) || height < 100 || height > 250) {
      errors.height = 'Please enter a valid height (100-250 cm)';
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight < 30 || weight > 300) {
      errors.weight = 'Please enter a valid weight (30-300 kg)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const registerData: RegisterData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        activity_level: formData.activity_level,
        goal: formData.goal,
      };

      await register(registerData);

      navigation.reset({
        index: 0,
        routes: [{ name: 'HealthAppSelection' }],
      });
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  const GoalOption = ({
    icon,
    iconName,
    title,
    subtitle,
    selected,
    onPress,
  }: {
    goal: string;
    icon: string;
    iconName: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.goalOption, selected && styles.goalOptionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={iconName}
        size={32}
        color={selected ? '#007AFF' : '#666'}
        style={{ marginBottom: 8 }}
      />
      <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>
        {title}
      </Text>
      <Text
        style={[styles.goalSubtitle, selected && styles.goalSubtitleSelected]}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🍎</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your fitness journey</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.email && styles.inputError,
                  ]}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={text => {
                    setFormData({ ...formData, email: text });
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                />
                {validationErrors.email && (
                  <Text style={styles.errorText}>{validationErrors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      validationErrors.password && styles.inputError,
                    ]}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={text => {
                      setFormData({ ...formData, password: text });
                      if (validationErrors.password) {
                        setValidationErrors(prev => ({
                          ...prev,
                          password: '',
                        }));
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {validationErrors.password && (
                  <Text style={styles.errorText}>
                    {validationErrors.password}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      validationErrors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    value={formData.confirmPassword}
                    onChangeText={text => {
                      setFormData({ ...formData, confirmPassword: text });
                      if (validationErrors.confirmPassword) {
                        setValidationErrors(prev => ({
                          ...prev,
                          confirmPassword: '',
                        }));
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {validationErrors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {validationErrors.confirmPassword}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.age && styles.inputError,
                    ]}
                    placeholder="Age"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.age}
                    onChangeText={text => {
                      setFormData({ ...formData, age: text });
                      if (validationErrors.age) {
                        setValidationErrors(prev => ({ ...prev, age: '' }));
                      }
                    }}
                  />
                  {validationErrors.age && (
                    <Text style={styles.errorTextSmall}>
                      {validationErrors.age}
                    </Text>
                  )}
                </View>

                <View style={styles.halfInput}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.gender}
                      onValueChange={value =>
                        setFormData({ ...formData, gender: value })
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Male" value={Gender.MALE} />
                      <Picker.Item label="Female" value={Gender.FEMALE} />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.height && styles.inputError,
                    ]}
                    placeholder="Height (cm)"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.height}
                    onChangeText={text => {
                      setFormData({ ...formData, height: text });
                      if (validationErrors.height) {
                        setValidationErrors(prev => ({ ...prev, height: '' }));
                      }
                    }}
                  />
                  {validationErrors.height && (
                    <Text style={styles.errorTextSmall}>
                      {validationErrors.height}
                    </Text>
                  )}
                </View>

                <View style={styles.halfInput}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.weight && styles.inputError,
                    ]}
                    placeholder="Weight (kg)"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.weight}
                    onChangeText={text => {
                      setFormData({ ...formData, weight: text });
                      if (validationErrors.weight) {
                        setValidationErrors(prev => ({ ...prev, weight: '' }));
                      }
                    }}
                  />
                  {validationErrors.weight && (
                    <Text style={styles.errorTextSmall}>
                      {validationErrors.weight}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.activity_level}
                  onValueChange={value =>
                    setFormData({ ...formData, activity_level: value })
                  }
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Sedentary"
                    value={ActivityLevel.SEDENTARY}
                  />
                  <Picker.Item
                    label="Lightly Active"
                    value={ActivityLevel.LIGHTLY_ACTIVE}
                  />
                  <Picker.Item
                    label="Moderately Active"
                    value={ActivityLevel.MODERATELY_ACTIVE}
                  />
                  <Picker.Item
                    label="Very Active"
                    value={ActivityLevel.VERY_ACTIVE}
                  />
                  <Picker.Item
                    label="Extremely Active"
                    value={ActivityLevel.EXTREMELY_ACTIVE}
                  />
                </Picker>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Goal</Text>
              <View style={styles.goalContainer}>
                <GoalOption
                  goal="lose"
                  icon="🔥"
                  iconName="flame-outline"
                  title="Lose Weight"
                  subtitle="Burn calories"
                  selected={formData.goal === Goal.LOSE_WEIGHT}
                  onPress={() =>
                    setFormData({ ...formData, goal: Goal.LOSE_WEIGHT })
                  }
                />
                <GoalOption
                  goal="maintain"
                  icon="⚖️"
                  iconName="scale-outline"
                  title="Maintain"
                  subtitle="Stay healthy"
                  selected={formData.goal === Goal.MAINTAIN_WEIGHT}
                  onPress={() =>
                    setFormData({ ...formData, goal: Goal.MAINTAIN_WEIGHT })
                  }
                />
                <GoalOption
                  goal="gain"
                  icon="💪"
                  iconName="barbell-outline"
                  title="Gain Muscle"
                  subtitle="Build strength"
                  selected={formData.goal === Goal.GAIN_WEIGHT}
                  onPress={() =>
                    setFormData({ ...formData, goal: Goal.GAIN_WEIGHT })
                  }
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleNavigateToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.globalErrorContainer}>
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
