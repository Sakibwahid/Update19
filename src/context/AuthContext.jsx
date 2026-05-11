import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../lib/firebase/config";
import { getUserData } from "../lib/firebase/auth";

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  // Firebase Auth User
  const [user, setUser] = useState(null);

  // Firestore User Data
  const [userData, setUserData] = useState(null);

  // Initial Auth Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          // USER LOGGED IN
          if (firebaseUser) {
            if (!mounted) return;

            setUser(firebaseUser);

            // Check local cache first
            const cachedUserData =
              localStorage.getItem("userData");

            if (cachedUserData) {
              setUserData(JSON.parse(cachedUserData));
            }

            // Fetch latest user data from Firestore
            const result = await getUserData(
              firebaseUser.uid
            );

            if (
              mounted &&
              result?.success &&
              result?.data
            ) {
              setUserData(result.data);

              // Cache locally
              localStorage.setItem(
                "userData",
                JSON.stringify(result.data)
              );
            }
          }

          // USER LOGGED OUT
          else {
            if (!mounted) return;

            setUser(null);
            setUserData(null);

            // Clear cache
            localStorage.removeItem("userData");
          }
        } catch (error) {
          console.error(
            "AuthContext Error:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Memoized Context Value
  const value = useMemo(
    () => ({
      user,
      userData,
      loading,

      // Helpers
      isAdmin:
        userData?.role === "admin",

      isApproved:
        userData?.isApproved ||
        userData?.role === "admin",
    }),
    [user, userData, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};