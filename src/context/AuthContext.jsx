import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { getUserData } from '../lib/firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State to store user authentication status
  const [user, setUser] = useState(null); // Firebase auth user (email, uid, etc.)
  const [userData, setUserData] = useState(null); // Our custom user data from Firestore (role, teamName, etc.)
  const [loading, setLoading] = useState(true); // Loading state while checking auth

  // 3. Listen for authentication state changes
  useEffect(() => {
    // onAuthStateChanged runs whenever user logs in or out
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
    
        setUser(firebaseUser);
       
        // Fetch additional user data from Firestore
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          setUserData(result.data);
        } 
      } else {

        setUser(null);
        setUserData(null);
      }
      setLoading(false); // Done loading
    });

    // Cleanup function - unsubscribe when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array = run once on mount

  // 4. Create the value object to share
  const value = {
    user,              // Firebase auth user object
    userData,          // Custom user data from Firestore
    loading,           // Is authentication being checked?
    isAdmin: userData?.role === 'admin',  // Helper: is user an admin?
    isApproved: userData?.isApproved || userData?.role === 'admin'  // Helper: is user approved?
  };

  // 5. Provide the value to all children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Custom hook to use the auth context
// This makes it easy to access auth data in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Make sure useAuth is used inside AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};