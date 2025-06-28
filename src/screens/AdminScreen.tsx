import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type UserProfile = {
  id: string;
  name: string;
  sport: string;
  level: string;
  imageURL: string;
  approvedAdvanced?: boolean;
  email?: string;
};

export default function AdminScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('level', '==', 'Advanced'),
        where('approvedAdvanced', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const pendingUsers: UserProfile[] = [];
      querySnapshot.forEach(docSnap => {
        pendingUsers.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      setUsers(pendingUsers);
    } catch (error: any) {
      Alert.alert('Error fetching users', error.message);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approvedAdvanced: true,
      });
      Alert.alert('User approved');
      fetchPendingUsers();
    } catch (error: any) {
      Alert.alert('Error approving user', error.message);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approvedAdvanced: false,
        level: 'Intermediate',
        imageURL: '',
      });
      Alert.alert('User rejected');
      fetchPendingUsers();
    } catch (error: any) {
      Alert.alert('Error rejecting user', error.message);
    }
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userCard}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Sport: {item.sport}</Text>
      <Text>Level: {item.level}</Text>
      {item.imageURL ? (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item.imageURL);
            setModalVisible(true);
          }}
        >
          <Image source={{ uri: item.imageURL }} style={styles.badgeImage} />
        </TouchableOpacity>
      ) : (
        <Text>No badge image</Text>
      )}
      <View style={styles.buttons}>
        <Button title="Approve" onPress={() => handleApprove(item.id)} color="#10b981" />
        <Button title="Reject" onPress={() => handleReject(item.id)} color="#ef4444" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: selectedImage || '' }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
    backgroundColor: '#f0fdf4',
    flex: 1,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  badgeImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
    borderRadius: 12,
  },
});
