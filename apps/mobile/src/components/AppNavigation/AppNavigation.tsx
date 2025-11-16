import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStatus } from '../../contexts/AuthContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import {
  EditProfileScreen,
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  HealthAppSelectionScreen,
  ManualActivityScreen,
  UserSettingsScreen,
  FoodInputScreen,
  ActivityScreen,
} from '../../screens';
import { useSelectedHealthApp } from '@/hooks';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  FoodInput: undefined;
  Activity: undefined;
  HealthAppSelection: undefined;
  ManualActivity: undefined;
  UserSettings: undefined;
  EditProfile: undefined;
};

// Поправка - трябва да е на един ред или правилно форматирано
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const { data: selectedApp, isLoading: healthAppLoading } =
    useSelectedHealthApp();

  // Show loading while auth is checking
  if (authLoading) {
    return <LoadingScreen />;
  }

  // For authenticated users, wait for health app data to load
  if (isAuthenticated && healthAppLoading) {
    return <LoadingScreen />;
  }

  // Check if user needs health app setup
  const needsHealthAppSetup = isAuthenticated && !selectedApp;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            {needsHealthAppSetup ? (
              <Stack.Screen
                name="HealthAppSelection"
                component={HealthAppSelectionScreen}
                options={{
                  title: 'Setup',
                  headerShown: false,
                }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={({ navigation }) => ({
                    title: 'Dashboard',
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('UserSettings')}
                        style={{ marginRight: 15 }}
                      >
                        <Ionicons
                          name="settings-outline"
                          size={24}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    ),
                  })}
                />
                <Stack.Screen
                  name="FoodInput"
                  component={FoodInputScreen}
                  options={{ title: 'Add Food' }}
                />
                <Stack.Screen
                  name="Activity"
                  component={ActivityScreen}
                  options={{ title: 'Activity' }}
                />
                <Stack.Screen
                  name="ManualActivity"
                  component={ManualActivityScreen}
                  options={{ title: 'Log Activity' }}
                />
                <Stack.Screen
                  name="UserSettings"
                  component={UserSettingsScreen}
                  options={{ title: 'Settings' }}
                />
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{ title: 'Edit Profile' }}
                />
                <Stack.Screen
                  name="HealthAppSelection"
                  component={HealthAppSelectionScreen}
                  options={{ title: 'Health Apps' }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
