import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { useNavigate } from "react-router-dom";
import PlayerCard from "../player/PlayerCard";

const POSITIONS = [
  "GK", "CB", "LB", "RB",
  "CDM", "CM", "CAM",
  "LW", "RW", "CF", "ST"
];

const AdminAuctionControl = () => {
  const navigate = useNavigate();
  const [availablePositions, setAvailablePositions] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current player
  const fetchCurrentPlayer = async () => {
    try {
      const docRef = doc(db, "currentPlayer", "active");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCurrentPlayer(docSnap.data());
    } catch (err) {
      console.error("Error fetching current player:", err);
    }
  };

  // Fetch all players
  const fetchAllPlayers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "players"));
      const grouped = {};
      snapshot.docs.forEach(doc => {
        const player = doc.data();
        if (!grouped[player.Position]) grouped[player.Position] = [];
        grouped[player.Position].push(player);
      });

      setAvailablePositions([...POSITIONS]);
      setAvailablePlayers(grouped);

    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  useEffect(() => {
    fetchCurrentPlayer();
    fetchAllPlayers();
  }, []);

  // Helper to get all eligible players for a position (LW includes LM, RW includes RM)
  const getPlayersForPosition = (position) => {
    if (position === "LW") return [...(availablePlayers["LW"] || []), ...(availablePlayers["LM"] || [])];
    if (position === "RW") return [...(availablePlayers["RW"] || []), ...(availablePlayers["RM"] || [])];
    return availablePlayers[position] || [];
  };

  const chooseRandomPosition = () => {
    if (availablePositions.length === 0) {
      setSelectedPosition(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    setSelectedPosition(availablePositions[randomIndex]);
  };

  const chooseRandomPlayer = async () => {
    if (!selectedPosition) return;

    const players = getPlayersForPosition(selectedPosition);
    if (players.length === 0) return;

    setLoading(true);
    try {
      const randomIndex = Math.floor(Math.random() * players.length);
      const randomPlayer = players[randomIndex];

      // Remove selected player from its actual group
      const posGroup = availablePlayers[randomPlayer.Position] || [];
      const idx = posGroup.findIndex(p => p.ID === randomPlayer.ID);
      if (idx > -1) posGroup.splice(idx, 1);
      setAvailablePlayers(prev => ({ ...prev, [randomPlayer.Position]: posGroup }));

      // Remove position if no players left
      if (getPlayersForPosition(selectedPosition).length === 1) {
        setAvailablePositions(prev => prev.filter(p => p !== selectedPosition));
      }

      // Save to Firestore
      await setDoc(doc(db, "currentPlayer", "active"), {
        ...randomPlayer,
        updatedAt: serverTimestamp(),
      });

      setCurrentPlayer(randomPlayer);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <button
          onClick={chooseRandomPosition}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={availablePositions.length === 0}
        >
          Choose Random Position
        </button>

        {selectedPosition && (
          <p className="font-semibold">Selected Position: {selectedPosition}</p>
        )}

        <button
          onClick={chooseRandomPlayer}
          disabled={!selectedPosition || loading || getPlayersForPosition(selectedPosition).length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Choose Random Player
        </button>
      </div>

      {currentPlayer ? (
        <div
          className="cursor-pointer w-full max-w-sm"
          onClick={() => navigate("/player-details", { state: { player: currentPlayer } })}
        >
          <PlayerCard player={currentPlayer} />
        </div>
      ) : selectedPosition ? (
        <p className="text-red-500 font-semibold mt-4">No player is left for this position</p>
      ) : (
        <p className="text-gray-500 mt-4">Choose a position to select a player</p>
      )}
    </div>
  );
};

export default AdminAuctionControl;
