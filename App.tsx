import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';
import UserListScreen from './src/screens/UserListScreen';
import MainPanelScreen from './src/screens/MainPanelScreen';
import ScheduleMatchScreen from './src/screens/ScheduleMatchScreen';
import JoinMatchScreen from './src/screens/JoinMatchScreen';
import SendMessageScreen from './src/screens/SendMessageScreen';
import AdminScreen from './src/screens/AdminScreen';



const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="MainPanel" component={MainPanelScreen} />
        <Stack.Screen name="Messages" component={SendMessageScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="ScheduleMatch" component={ScheduleMatchScreen} />
        <Stack.Screen name="JoinMatch" component={JoinMatchScreen} />
        <Stack.Screen name="Users" component={UserListScreen} />
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
