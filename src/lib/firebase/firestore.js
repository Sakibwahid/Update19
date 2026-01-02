import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// Get all players
export const getAllPlayers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'players'));
    const players = [];
    querySnapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: players };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single player
export const getPlayer = async (playerId) => {
  try {
    const playerDoc = await getDoc(doc(db, 'players', playerId));
    if (playerDoc.exists()) {
      return { success: true, data: { id: playerDoc.id, ...playerDoc.data() } };
    }
    return { success: false, error: 'Player not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user's team players
export const getMyPlayers = async (userId) => {
  try {
    const q = query(collection(db, 'players'), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    const players = [];
    querySnapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: players };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update player (assign to team)
export const updatePlayer = async (playerId, updates) => {
  try {
    await updateDoc(doc(db, 'players', playerId), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listener for auction
export const subscribeToAuction = (callback) => {
  const unsubscribe = onSnapshot(doc(db, 'auction', 'settings'), (doc) => {
    if (doc.exists()) {
      callback({ success: true, data: doc.data() });
    }
  }, (error) => {
    callback({ success: false, error: error.message });
  });
  
  return unsubscribe;
};

// Update auction settings
export const updateAuctionSettings = async (settings) => {
  try {
    await setDoc(doc(db, 'auction', 'settings'), settings, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};