import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { firebaseApp } from '../config/firebase';

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(firebaseApp);

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created!');
      navigation.navigate('CompleteProfile');
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a SportsBuddy Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} color="#10b981" />
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100, backgroundColor: '#f0fdf4', flex: 1 },
  input: { 
    borderBottomWidth: 1, 
    marginBottom: 15, 
    padding: 10, 
    borderColor: '#10b981',
    borderRadius: 5 
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#10b981', textAlign: 'center' },
  link: { marginTop: 20, color: '#10b981', textAlign: 'center' },
});
