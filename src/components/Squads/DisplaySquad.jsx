import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase/config";
import { Text } from "../ui/Text";

const DisplaySquad = () => {
  const [players, setPlayers] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch user's team
  useEffect(() => {
    const fetchTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setTeamId(snap.data().teamId);
      }
    };

    fetchTeam();
  }, []);

  // 🔹 Fetch squad players
  useEffect(() => {
    if (!teamId) return;

    const fetchPlayers = async () => {
      setLoading(true);

      try {
        const q = query(
          collection(db, "players"),
          where("currentTeamId", "==", teamId),
          orderBy("Overall", "desc")
        );

        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayers(list);
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [teamId]);

  return (
    <div className="p-6 min-w-full flex flex-col mx-auto space-y-2">
        <Text variant="heading" className="text-white text-center mb-4">Your Squad</Text>
      {loading && <p className="text-sm text-gray-500">Loading squad...</p>}

      {/* Glass Cards */}
      {players.map((p) => (
        <div
          key={p.id}
          className="
            w-full
            flex items-center gap-3
            rounded-lg
            px-3 py-2
            backdrop-blur-md
            bg-white/90
            border border-white/10
            shadow-sm
          "
        >
          {/* Player Photo */}
          <img
            src={`/player_photos/${p.ID}.png`}
            alt={p.Name}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />

          {/* Name + Position */}
          <div className="flex-1 flex flex-col min-w-0">
           <Text className="text-slate-950 font-semibold text-xl">{p.Name}</Text>
            <Text className="text-gray-800">
                {p.Position} 
            </Text>
          </div>

          {/* Rating */}
          <div className="text-center">
          
            <Text className="text-gray-800 font-bold text-xl">
                {p.Overall} 
            </Text>
          </div>

          {/* Sold Price */}
          <div className="text-right">
             <Text className="text-[#053abe] font-bold text-xl">
                {p.soldPrice ?? "—"}M 
            </Text>
          </div>
        </div>
      ))}

      {!loading && players.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No players found in squad
        </p>
      )}
    </div>
  );
};

export default DisplaySquad;
