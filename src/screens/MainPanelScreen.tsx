import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

export default function MainPanelScreen({ navigation }: any) {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // redirect to login
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SportsBuddy 🎯</Text>
      
      <Button
        title="👤 Complete / View Profile"
        onPress={() => navigation.navigate('CompleteProfile')}
        color="#10b981"
      />
      <Button
        title="🔎 Find Players"
        onPress={() => navigation.navigate('Users')}
        color="#10b981"
      />
      <Button
        title="📅 Schedule Match"
        onPress={() => navigation.navigate('ScheduleMatch')}
        color="#10b981"
      />
      <Button
        title="⚽ Join a Match"
        onPress={() => navigation.navigate('JoinMatch')}
        color="#10b981"
      />
      <Button
        title="🚪 Log Out"
        onPress={handleLogout}
        color="crimson"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f0fdf4'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 30, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    color: '#10b981' 
  },
});
