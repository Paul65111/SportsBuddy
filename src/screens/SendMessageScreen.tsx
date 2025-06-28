import { getAuth } from 'firebase/auth';
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ChatScreen({ route }) {
  const auth = getAuth(); 
  const currentUserId = auth.currentUser?.uid; 

  const { userId, userName } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  // Reference for FlatList to scroll to the bottom
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const messagesRef = collection(db, 'messages');

    // Get messages where (from=currentUser AND to=userId) OR (from=userId AND to=currentUser)
    const q = query(
      messagesRef,
      where('participants', 'array-contains', currentUserId), 
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter only messages between current user and the selected user
      const filteredMessages = allMessages.filter(
        (msg: any) => 
          (msg.from === currentUserId && msg.to === userId) ||
          (msg.from === userId && msg.to === currentUserId)
      );

      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [currentUserId, userId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!currentUserId) {
      console.error('User not authenticated');
      return;
    }

    try {
      const newMessage = {
        from: currentUserId,
        to: userId,
        message,
        timestamp: new Date(),
        participants: [currentUserId, userId], 
      };

      await addDoc(collection(db, 'messages'), newMessage);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000); // Firebase timestamp
    const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const time = `${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
    return `${day} at ${time}`;
  };

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.from === currentUserId ? styles.sentMessage : styles.receivedMessage]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        )}
        ref={flatListRef}  // Set ref to FlatList
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}  // Ensure scrolling to the bottom on content change
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={`Message ${userName}`}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#EAEAEA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});
