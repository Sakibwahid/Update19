import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase/config";

const useCurrentPlayer = () => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "currentPlayer", "active");

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setCurrentPlayer(snap.data());
      } else {
        setCurrentPlayer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentPlayer, loading };
};

export default useCurrentPlayer;