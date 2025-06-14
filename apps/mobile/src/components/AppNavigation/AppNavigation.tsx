import { NavigationContainer } from "@react-navigation/native";
import { useAuthStatus } from "../../contexts/AuthContext";
import LoadingScreen from "../LoadingScreen/LoadingScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen, LoginScreen } from "../../screens";

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Register: undefined;
    FoodAnalysis: undefined;
  };
  
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
    const { isAuthenticated, isLoading } = useAuthStatus();
  
    if (isLoading) {
      return <LoadingScreen />;
    }
  
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
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: '🍎 Calorie Tracker' }}
            />
          ) : (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                title: 'Login',
                headerShown: false
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
};
  
export default AppNavigation;