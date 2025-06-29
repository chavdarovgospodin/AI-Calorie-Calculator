import React from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import ActivitySummary from '@/components/ActivitySummary/ActivitySummary';
import { styles } from './styles';

const ActivityScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Дневна активност</Text>
          <Text style={styles.subtitle}>
            Проследявайте изгорените калории и физическата активност
          </Text>
        </View>
        <ActivitySummary />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityScreen;
