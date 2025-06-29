import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  calorieCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  calorieTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  calorieMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 10,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  calorieDivider: {
    fontSize: 32,
    color: '#999',
    marginHorizontal: 5,
  },
  calorieTarget: {
    fontSize: 32,
    color: '#666',
  },
  netCaloriesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  netCaloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  netCaloriesValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  addFoodButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  addFoodIcon: {
    marginRight: 10,
  },
  addFoodText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
