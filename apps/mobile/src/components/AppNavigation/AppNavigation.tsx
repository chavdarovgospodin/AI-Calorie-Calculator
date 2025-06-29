import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStatus } from '../../contexts/AuthContext';
import { useActivity } from '../../contexts/ActivityContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import { HomeScreen, LoginScreen, RegisterScreen } from '../../screens';
import HealthAppSelectionScreen from '../../screens/HealthAppSelection/HealthAppSelectionScreen';
import ManualActivityScreen from '../../screens/ManualActivity/ManualActivityScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  FoodAnalysis: undefined;
  HealthAppSelection: undefined;
  ManualActivity: undefined;
};

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
                options={{ title: '🍎 Calorie Tracker' }}
              />
            )}
            {!needsHealthAppSetup && (
              <>
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
