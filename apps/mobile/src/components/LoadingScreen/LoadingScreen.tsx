import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { styles } from './styles';

const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
);
  
export default LoadingScreen;