import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './app/Home';
import Login from './app/Login';
import Register from './app/Register';
import ForgotPassword from './app/ForgotPassword';

import UserDashboard from './app/UserDashboard';
import UserTable from './app/UserTable';
import UserMenu from './app/UserMenu';
import UserReservation from './app/UserReservation';
import UserReview from './app/UserReview';
import UserOrder from './app/UserOrder';
import UserProfile from './app/UserProfile'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={Register} options={{ title: 'Register ' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'UserProfile' }} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} options={{ title: 'UserDashboard' }} />
        <Stack.Screen name="UserMenu" component={UserMenu} options={{ title: 'UserMenu' }} />
        <Stack.Screen name="UserReservation" component={UserReservation} options={{ title: 'UserReservation' }} />
        <Stack.Screen name="UserReview" component={UserReview} options={{ title: 'UserReview' }} />
        <Stack.Screen name="UserTable" component={UserTable} options={{ title: 'UserTable' }} />
        <Stack.Screen name="UserOrder" component={UserOrder} options={{ title: 'UserOrder' }} />
        <Stack.Screen name="Cart" component={Cart} options={{ title: 'My Cart' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
