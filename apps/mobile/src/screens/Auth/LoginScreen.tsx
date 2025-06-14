import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from './styles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

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

  const handleLogin = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email',
      });
      return;
    }
    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your password',
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }
    try {
      await login(email.trim(), password);

      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Login successful',
      });
    } catch (error) {
      console.log('Login error handled by context');
    }
  };
  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!', [
      { text: 'OK' },
    ]);
  };
  const handleRegister = () => {
    Alert.alert('Register', 'Registration screen coming soon!', [{ text: 'OK' }]);
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🍎 Calorie Tracker</Text>
          <Text style={styles.subtitle}>AI-powered food tracking</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            autoComplete='email'
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize='none'
            autoComplete='password'
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testCredentials}>
          <Text style={styles.testTitle}>Quick Test:</Text>
          <Text style={styles.testText}>Email: test@example.com</Text>
          <Text style={styles.testText}>Password: any password</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
export default LoginScreen;
