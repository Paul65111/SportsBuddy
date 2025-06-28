import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

export default function JoinMatchScreen() {
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredSport, setFilteredSport] = useState('All');
  const [playersNames, setPlayersNames] = useState<any[]>([]);
  const [isUserAdvanced, setIsUserAdvanced] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get user document to check if they're approved Advanced
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let approved = false;
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        approved = userData?.approvedAdvanced === true;
        console.log("User data:", userData);
        console.log("Is user advanced?", approved);
        setIsUserAdvanced(approved);
      }

      // Fetch all matches
      const snapshot = await getDocs(collection(db, 'matches'));
      const now = new Date();

      const allMatches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      
      const filtered = allMatches.filter(match => {
        const matchDate = match.dateTime?.toDate?.();
        const isAdvancedMatch = match.level?.trim().toLowerCase() === 'advanced';
        return (
          matchDate &&
          matchDate > now &&
          (!isAdvancedMatch || approved)
        );
      });

      setMatches(filtered);
      setPlayersNames(await fetchPlayerNames(filtered));
    };

    fetchData();
  }, [user]);

  const fetchPlayerNames = async (matches: any[]) => {
    const playerNames: any[] = [];

    for (const match of matches) {
      const players = match.players || [];
      const playersDetails = [];

      for (const playerId of players) {
        const userDoc = await getDoc(doc(db, 'users', playerId));
        if (userDoc.exists()) {
          playersDetails.push(userDoc.data()?.name);
        }
      }

      playerNames.push({ matchId: match.id, names: playersDetails });
    }
    return playerNames;
  };

  const handleJoin = async (match: any) => {
    if (!user) return;
    if (match.players.includes(user.uid)) return alert('You already joined this match.');
    if (match.players.length >= match.maxPlayers) return alert('Match is full.');

    const matchRef = doc(db, 'matches', match.id);
    await updateDoc(matchRef, {
      players: [...match.players, user.uid],
    });

    const updatedMatches = matches.map(m =>
      m.id === match.id ? { ...m, players: [...m.players, user.uid] } : m
    );
    setMatches(updatedMatches);
    setPlayersNames(await fetchPlayerNames(updatedMatches));

    alert('You joined the match!');
  };

  const handleLeave = async (match: any) => {
    if (!user) return;

    const updatedPlayers = match.players.filter((player: string) => player !== user.uid);

    const matchRef = doc(db, 'matches', match.id);
    await updateDoc(matchRef, {
      players: updatedPlayers,
    });

    const updatedMatches = matches.map(m =>
      m.id === match.id ? { ...m, players: updatedPlayers } : m
    );
    setMatches(updatedMatches);
    setPlayersNames(await fetchPlayerNames(updatedMatches));

    alert('You left the match!');
  };

  const handleFilter = (sport: string) => {
    setFilteredSport(sport);
  };

  const filteredMatches = filteredSport === 'All' ? matches : matches.filter((match: any) => match.sport === filteredSport);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Matches</Text>

      {}
      <View style={styles.filterContainer}>
        <Button title="All" onPress={() => handleFilter('All')} color="#10b981" />
        <Button title="Football" onPress={() => handleFilter('Football')} color="#10b981" />
        <Button title="Tennis" onPress={() => handleFilter('Tennis')} color="#10b981" />
        <Button title="Basketball" onPress={() => handleFilter('Basketball')} color="#10b981" />
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const matchPlayers = playersNames.find((p) => p.matchId === item.id)?.names || [];

          return (
            <View style={styles.card}>
              <Text style={styles.sport}>
                {item.sport}
                {item.level?.trim().toLowerCase() === 'advanced' && (
                  <Text style={styles.advancedLabel}>  🔥 Advanced Match Only</Text>
                )}
              </Text>

              <Text style={styles.date}>
                📅 {item.dateTime?.toDate().toLocaleDateString()} ⏰ {item.dateTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.location}>📍 {item.location}</Text>
              <Text style={styles.players}>
                👥 {item.players.length}/{item.maxPlayers}
              </Text>
              <Text style={styles.playersList}>
                👤 Players: {matchPlayers.length ? matchPlayers.join(', ') : 'No players yet'}
              </Text>

              {item.players.includes(user?.uid) ? (
                <Button title="🚪 Leave Match" onPress={() => handleLeave(item)} color="#ef4444" />
              ) : (
                <Button title="⚽ Join Match" onPress={() => handleJoin(item)} color="#10b981" />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f4f7f6',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  card: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  sport: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#10b981',
  },
  date: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  players: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  playersList: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  advancedLabel: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  }

});
