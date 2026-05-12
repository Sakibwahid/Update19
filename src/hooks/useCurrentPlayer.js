import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase/config";

const useCurrentPlayer = () => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "currentPlayer", "active");

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setCurrentPlayer(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      (err) => {
        console.error("currentPlayer listener error:", err);
        setLoading(false); // stop spinner even on network/rules error
      },
    );

    return () => unsubscribe();
  }, []);

  return { currentPlayer, loading };
};

export default useCurrentPlayer;