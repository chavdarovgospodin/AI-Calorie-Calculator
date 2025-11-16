import { DailyDashboard } from '@/screens/Dashboard/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getTimeOfDay = (timestamp: string) => {
  const hour = new Date(timestamp).getHours();
  if (hour < 11) return '🌅 Breakfast';
  if (hour < 15) return '🌞 Lunch';
  if (hour < 19) return '🌆 Dinner';
  return '🌙 Snack';
};

const RecentFood = memo(
  ({
    dashboard,
    handleDeleteFood,
  }: {
    dashboard: DailyDashboard;
    handleDeleteFood: (id: string) => void;
  }) => {
    const { foodEntries } = dashboard;
    if (foodEntries.length === 0) {
      return (
        <View style={styles.emptyFoodsContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#ccc" />
          <Text style={styles.emptyFoodsText}>No food logged today</Text>
          <Text style={styles.emptyFoodsSubtext}>
            Start by adding your first meal
          </Text>
        </View>
      );
    }

    // Show last 3 food entries
    const recentFoods = dashboard.foodEntries.slice(-3).reverse();

    return (
      <View style={styles.foodsSection}>
        <View style={styles.foodsSectionHeader}>
          <Text style={styles.foodsSectionTitle}>Today's Food</Text>
          {dashboard.foodEntries.length > 3 && (
            <TouchableOpacity
              onPress={() => {
                /* TODO: Navigate to food history */
              }}
            >
              <Text style={styles.seeAllText}>
                See all ({dashboard.foodEntries.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {recentFoods.map(food => (
          <View key={food.id} style={styles.foodItem}>
            <View style={styles.foodItemLeft}>
              <Text style={styles.timeOfDay}>
                {getTimeOfDay(food.created_at)}
              </Text>
              <Text style={styles.foodName}>{food.food_name}</Text>
              <Text style={styles.foodDetails}>
                {food.quantity}
                {food.unit} • {formatTime(food.created_at)}
              </Text>
            </View>
            <View style={styles.foodItemRight}>
              <Text style={styles.foodCalories}>{food.calories} cal</Text>
              <TouchableOpacity
                onPress={() => handleDeleteFood(food.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  }
);

export default RecentFood;
