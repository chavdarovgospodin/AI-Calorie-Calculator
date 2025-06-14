import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Toast from 'react-native-toast-message';

import { AppNavigation } from './src/components';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
      <StatusBar style='auto' />
      <Toast />
    </AuthProvider>
  );
}
