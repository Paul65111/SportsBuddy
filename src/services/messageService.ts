import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

/**
 * Sends a message from the current user to a specified recipient.
 *
 * @param {string} toId - The ID of the user receiving the message.
 * @param {string} message - The text content of the message.
 * @returns {Promise<string | void>} - A Promise that resolves with the message ID
 * on success, or rejects with an error.  Returns void on error, after logging.
 */
export const sendMessage = async (toId: string, message: string): Promise<string | void> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated. Cannot send message.');
    }
    const fromId = user.uid;

    if (!toId) {
      throw new Error('Recipient ID (toId) is required.');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message text cannot be empty.');
    }

    const messagesRef = collection(db, 'messages');
    const newMessage = {
      from: fromId,
      to: toId,
      message: message,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, newMessage);
    console.log('Message sent successfully!  Message ID: ', docRef.id);
    return docRef.id; // Return the document ID on success

  } catch (error: any) {
    // IMPORTANT:  Use 'any' for error, or specify a more specific type if you have one.
    console.error('Error sending message:', error.message || error); // Log the error
    //  Don't throw here, just log.  The caller can decide how to handle the error.
    //  Throwing can lead to unhandled promise rejections if the caller doesn't
    //  await and catch.
    return; // changed from throwing error to returning void
  }
};
