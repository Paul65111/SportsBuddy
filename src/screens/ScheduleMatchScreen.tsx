import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

const sportLimits = {
  Football: 12,
  Tennis: 4,
  Basketball: 6,
};


export default function ScheduleMatchScreen({ navigation }: any) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [isAdvancedUser, setIsAdvancedUser] = useState(false);
  const [advancedOnly, setAdvancedOnly] = useState(false);

  useEffect(() => {
  const fetchUser = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsAdvancedUser(data?.approvedAdvanced === true);
      }
    }
  };

    fetchUser();
  }, []);
  

  const handleSportSelect = (selected: string) => {
    setSport(selected);
    setMaxPlayers(sportLimits[selected]);
  };

  const handleCreateMatch = async () => {
    if (!sport || !date || !time || !location) {
      return Alert.alert('Error', 'Please complete all fields.');
    }

    const fullDateTime = new Date(`${date}T${time}`);
    if (isNaN(fullDateTime.getTime())) {
      return Alert.alert('Invalid Date/Time', 'Please enter a valid date and time.');
    }

    const now = new Date();
    if (fullDateTime < now) {
      return Alert.alert('Invalid Date/Time', 'Match cannot be scheduled in the past.');
    }

    if (user) {
      const matchData = {
        sport,
        location,
        dateTime: Timestamp.fromDate(fullDateTime),
        createdBy: user.uid,
        players: [user.uid],
        maxPlayers,
        level: advancedOnly ? 'Advanced' : 'All',
      };

      try {
        await addDoc(collection(db, 'matches'), matchData);
        Alert.alert('Success', 'Match created!');
        navigation.goBack();
      } catch (error) {
        console.error('Error creating match:', error);
        Alert.alert('Error', 'Failed to create match.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule a Match</Text>

      <Text style={styles.subtitle}>Choose a sport:</Text>
      <View style={styles.sportSelectionContainer}>
        {['Football', 'Tennis', 'Basketball'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sportButton, sport === s && styles.selectedSportButton]}
            onPress={() => handleSportSelect(s)}
          >
            <Text style={[styles.sportText, sport === s && styles.selectedSportText]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sport !== '' && (
        <>
          <TextInput
            placeholder="📅 Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
          <TextInput
            placeholder="⏰ Time (HH:MM, 24h)"
            value={time}
            onChangeText={setTime}
            style={styles.input}
          />
          <TextInput
            placeholder="📍 Location"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
          <Text style={styles.players}>Max Players: {maxPlayers}</Text>

          {isAdvancedUser && (
          <TouchableOpacity
            onPress={() => setAdvancedOnly(!advancedOnly)}
            style={[
              styles.toggleButton,
              advancedOnly ? styles.toggleOn : styles.toggleOff,
            ]}
          >
            <Text style={styles.toggleText}>
              {advancedOnly ? '✅ Advanced Only Match' : '🔓 Open to All Players'}
            </Text>
          </TouchableOpacity>
        )}

          <Button title="✅ Create Match" onPress={handleCreateMatch} color="#10b981" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 40, backgroundColor: '#f0fdf4' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#10b981' },
  subtitle: { fontSize: 18, marginBottom: 10 },
  sportSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  sportButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    width: '30%',
  },
  selectedSportButton: {
    borderColor: '#10b981',
    backgroundColor: '#e0f8e1',
  },
  sportText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSportText: {
    fontWeight: 'bold',
    color: '#10b981',
  },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 6 },
  players: { fontSize: 16, marginBottom: 10 },
  toggleButton: {
  padding: 10,
  borderRadius: 8,
  marginBottom: 10,
  alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  toggleOff: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  toggleText: {
    color: '#10b981',
    fontWeight: 'bold',
  },

});
