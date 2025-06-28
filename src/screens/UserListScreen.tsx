import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function UserListScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [sportFilter, setSportFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const navigation = useNavigation(); 

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      let q = usersRef;

      if (sportFilter || levelFilter) {
        const conditions = [];
        if (sportFilter) conditions.push(where('sport', '==', sportFilter));
        if (levelFilter) conditions.push(where('level', '==', levelFilter));

        q = query(usersRef, ...conditions);
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error: any) {
      console.log('Error fetching users:', error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sportFilter, levelFilter]);

  const handleUserPress = (user: any) => {
    navigation.navigate('Messages', { userId: user.id, userName: user.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find SportsBuddies</Text>

      {}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.input}
          placeholder="Sport (e.g. Tennis)"
          value={sportFilter}
          onChangeText={setSportFilter}
        />
        <TextInput
          style={styles.input}
          placeholder="Level (e.g. Beginner)"
          value={levelFilter}
          onChangeText={setLevelFilter}
        />
      </View>

      {}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleUserPress(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>{item.sport} • {item.level}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40, backgroundColor: '#f4f7f6' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  filtersContainer: { marginBottom: 20 },
  input: {
    borderBottomWidth: 2,
    borderColor: '#10b981',
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 5,  
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#f4f7f6',
  },
  name: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  details: { fontSize: 14, color: '#555' },
});
