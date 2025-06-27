import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import Toast from 'react-native-toast-message';

import { registerStyles as styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { Gender, Goal } from '@/services/interfaces';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  age: string | number;
  gender: Gender | '';
  height: string | number;
  weight: string | number;
  goal: Goal;
}

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: Goal.MAINTAIN_WEIGHT,
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const { register, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [clearError, formData, error]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
        position: 'top',
      });
    }
  }, [error]);

  const handleLoginNavigate = () => {
    navigation.navigate('Login');
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email',
      });
      return;
    }

    if (formData.password.length < 6 && !formData.password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your password',
      });
      return;
    }

    const ageNum = Number(formData.age);
    if (!formData.age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Age must be between 13 and 120',
      });
      return;
    }

    const heightNum = Number(formData.height);
    if (
      !formData.height ||
      isNaN(heightNum) ||
      heightNum < 100 ||
      heightNum > 250
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Height must be between 100cm and 250cm',
      });
      return;
    }

    const weightNum = Number(formData.weight);
    if (
      !formData.weight ||
      isNaN(weightNum) ||
      weightNum < 30 ||
      weightNum > 300
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Weight must be between 30kg and 300kg',
      });
      return;
    }

    if (!formData.gender) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a gender',
      });
      return;
    }

    if (!formData.goal) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a goal',
      });
      return;
    }

    try {
      await register({
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        gender: formData.gender as Gender,
      });
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Registration successful',
      });
    } catch (err) {
      console.log('Registration error handled by context', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🍎 Create Account</Text>
            <Text style={styles.subtitle}>Start your fitness journey</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={formData.email}
              editable={!isLoading}
              onChangeText={text => setFormData({ ...formData, email: text })}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
                value={formData.password}
                onChangeText={text =>
                  setFormData({ ...formData, password: text })
                }
              />
              <TouchableOpacity
                disabled={isLoading}
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
              value={formData.confirmPassword}
              onChangeText={text =>
                setFormData({ ...formData, confirmPassword: text })
              }
            />

            <Text style={[styles.sectionTitle, styles.sectionMargin]}>
              Personal Information
            </Text>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Age"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isLoading}
                value={formData.age.toString()}
                onChangeText={text => setFormData({ ...formData, age: text })}
              />

              <Picker
                style={[
                  styles.halfInput,
                  styles.pickerContainer,
                  styles.pickerStyle,
                ]}
                selectedValue={formData.gender}
                onValueChange={itemValue =>
                  setFormData({ ...formData, gender: itemValue })
                }
                itemStyle={styles.pickerText}
              >
                <Picker.Item label="Gender" value="" enabled={false} />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Height (cm)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isLoading}
                value={formData.height.toString()}
                onChangeText={text =>
                  setFormData({ ...formData, height: text })
                }
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Weight (kg)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isLoading}
                value={formData.weight.toString()}
                onChangeText={text =>
                  setFormData({ ...formData, weight: text })
                }
              />
            </View>

            <Text style={[styles.sectionTitle, styles.sectionMargin]}>
              Your Goal
            </Text>

            <View style={styles.goalContainer}>
              <TouchableOpacity
                disabled={isLoading}
                style={[
                  styles.goalButton,
                  formData.goal === Goal.LOSE_WEIGHT && styles.goalButtonActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, goal: Goal.LOSE_WEIGHT })
                }
              >
                <Text
                  style={[
                    styles.goalEmoji,
                    formData.goal === Goal.LOSE_WEIGHT &&
                      styles.goalEmojiActive,
                  ]}
                >
                  🔥
                </Text>
                <Text
                  style={[
                    styles.goalText,
                    formData.goal === Goal.LOSE_WEIGHT && styles.goalTextActive,
                  ]}
                >
                  Lose Weight
                </Text>
                <Text
                  style={[
                    styles.goalSubtext,
                    formData.goal === Goal.LOSE_WEIGHT &&
                      styles.goalSubtextActive,
                  ]}
                >
                  -0.5kg/week
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLoading}
                style={[
                  styles.goalButton,
                  formData.goal === Goal.MAINTAIN_WEIGHT &&
                    styles.goalButtonActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, goal: Goal.MAINTAIN_WEIGHT })
                }
              >
                <Text
                  style={[
                    styles.goalEmoji,
                    formData.goal === Goal.MAINTAIN_WEIGHT &&
                      styles.goalEmojiActive,
                  ]}
                >
                  ⚖️
                </Text>
                <Text
                  style={[
                    styles.goalText,
                    formData.goal === Goal.MAINTAIN_WEIGHT &&
                      styles.goalTextActive,
                  ]}
                >
                  Maintain
                </Text>
                <Text
                  style={[
                    styles.goalSubtext,
                    formData.goal === Goal.MAINTAIN_WEIGHT &&
                      styles.goalSubtextActive,
                  ]}
                >
                  Stay fit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLoading}
                style={[
                  styles.goalButton,
                  formData.goal === Goal.GAIN_WEIGHT && styles.goalButtonActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, goal: Goal.GAIN_WEIGHT })
                }
              >
                <Text
                  style={[
                    styles.goalEmoji,
                    formData.goal === Goal.GAIN_WEIGHT &&
                      styles.goalEmojiActive,
                  ]}
                >
                  💪
                </Text>
                <Text
                  style={[
                    styles.goalText,
                    formData.goal === Goal.GAIN_WEIGHT && styles.goalTextActive,
                  ]}
                >
                  Gain Muscle
                </Text>
                <Text
                  style={[
                    styles.goalSubtext,
                    formData.goal === Goal.GAIN_WEIGHT &&
                      styles.goalSubtextActive,
                  ]}
                >
                  +0.5kg/week
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              disabled={isLoading}
              style={styles.submitButton}
              onPress={handleRegister}
            >
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isLoading}
              style={styles.linkButton}
              onPress={handleLoginNavigate}
            >
              <Text style={styles.linkText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
