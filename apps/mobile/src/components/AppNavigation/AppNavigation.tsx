import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStatus } from '../../contexts/AuthContext';
import { useActivity } from '../../contexts/ActivityContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import {
  EditProfileScreen,
  HomeScreen,
  LoginScreen,
  RegisterScreen,
} from '../../screens';
import HealthAppSelectionScreen from '../../screens/HealthAppSelection/HealthAppSelectionScreen';
import ManualActivityScreen from '../../screens/ManualActivity/ManualActivityScreen';
import UserSettingsScreen from '../../screens/Settings/UserSettingsScreen';
import FoodInputScreen from '../../screens/FoodInput/FoodInputScreen';
import ActivityScreen from '../../screens/Activity/ActivityScreen';

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

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const { selectedApp, isConnected } = useActivity();

  if (authLoading) {
    return <LoadingScreen />;
  }

  const needsHealthAppSetup = isAuthenticated && !selectedApp && !isConnected;

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
                  title: 'Setup Activity Tracking',
                  headerShown: true,
                  headerLeft: () => null,
                }}
              />
            ) : (
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }: HomeScreenNavigationProp) => ({
                  title: '🍎 Calorie Tracker',
                  headerRight: () => (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('UserSettings')}
                      style={{
                        marginRight: 10,
                        padding: 8,
                      }}
                      activeOpacity={0.7}
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
            )}
            {!needsHealthAppSetup && (
              <>
                <Stack.Screen
                  name="FoodInput"
                  component={FoodInputScreen}
                  options={{
                    title: 'Add meal',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="Activity"
                  component={ActivityScreen}
                  options={{
                    title: 'Activity',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="HealthAppSelection"
                  component={HealthAppSelectionScreen}
                  options={{
                    title: 'Activity Tracking',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="ManualActivity"
                  component={ManualActivityScreen}
                  options={{
                    title: 'Log Activity',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="UserSettings"
                  component={UserSettingsScreen}
                  options={{
                    title: 'Settings',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{
                    title: 'Edit Profile',
                    headerShown: true,
                  }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Login',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Register',
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
