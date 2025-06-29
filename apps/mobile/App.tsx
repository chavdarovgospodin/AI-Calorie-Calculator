import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Toast from 'react-native-toast-message';

import { AppNavigation } from './src/components';
import { AuthProvider } from './src/contexts/AuthContext';
import { ActivityProvider } from '@/contexts/ActivityContext';

export default function App() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <AppNavigation />
        <StatusBar style="auto" />
        <Toast />
      </ActivityProvider>
    </AuthProvider>
  );
}
