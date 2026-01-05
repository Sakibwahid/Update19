import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { useNavigate } from "react-router-dom";
import PlayerCard from "../player/PlayerCard";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

const POSITIONS = [
  "GK", "CB", "LB", "RB",
  "CDM", "CM", "CAM",
  "LW", "RW", "CF", "ST",
];

const STORAGE_KEY = "auction_state";

const AdminAuctionControl = () => {
  const navigate = useNavigate();

  const [availablePositions, setAvailablePositions] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CURRENT PLAYER ================= */

  const fetchCurrentPlayer = async () => {
    try {
      const ref = doc(db, "currentPlayer", "active");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setCurrentPlayer(snap.data());
      }
    } catch (err) {
      console.error("Fetch current player error:", err);
    }
  };

  /* ================= FETCH PLAYERS ================= */

  const fetchAllPlayers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "players"));
      const grouped = {};

      snapshot.docs.forEach((doc) => {
        const player = doc.data();
        if (!grouped[player.Position]) grouped[player.Position] = [];
        grouped[player.Position].push(player);
      });

      setAvailablePlayers(grouped);
      setAvailablePositions([...POSITIONS]);
    } catch (err) {
      console.error("Fetch players error:", err);
    }
  };

  /* ================= RESTORE FROM LOCALSTORAGE ================= */

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState) {
      const parsed = JSON.parse(savedState);
      setAvailablePositions(parsed.availablePositions);
      setAvailablePlayers(parsed.availablePlayers);
      setSelectedPosition(parsed.selectedPosition);
    } else {
      fetchAllPlayers();
    }

    fetchCurrentPlayer();
  }, []);

  /* ================= PERSIST TO LOCALSTORAGE ================= */

  useEffect(() => {
    if (!availablePositions.length && !selectedPosition) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        availablePositions,
        availablePlayers,
        selectedPosition,
      })
    );
  }, [availablePositions, availablePlayers, selectedPosition]);

  /* ================= HELPERS ================= */

  const getPlayersForPosition = (position) => {
    if (position === "LW") {
      return [
        ...(availablePlayers["LW"] || []),
        ...(availablePlayers["LM"] || []),
      ];
    }
    if (position === "RW") {
      return [
        ...(availablePlayers["RW"] || []),
        ...(availablePlayers["RM"] || []),
      ];
    }
    return availablePlayers[position] || [];
  };

  const chooseRandomPosition = () => {
    if (!availablePositions.length) return;
    const index = Math.floor(Math.random() * availablePositions.length);
    setSelectedPosition(availablePositions[index]);
  };

  const chooseRandomPlayer = async () => {
    if (!selectedPosition) return;

    const players = getPlayersForPosition(selectedPosition);
    if (!players.length) return;

    setLoading(true);

    try {
      const randomIndex = Math.floor(Math.random() * players.length);
      const randomPlayer = players[randomIndex];

      const positionGroup = [
        ...(availablePlayers[randomPlayer.Position] || []),
      ];

      const idx = positionGroup.findIndex((p) => p.ID === randomPlayer.ID);
      if (idx > -1) positionGroup.splice(idx, 1);

      setAvailablePlayers((prev) => ({
        ...prev,
        [randomPlayer.Position]: positionGroup,
      }));

      if (getPlayersForPosition(selectedPosition).length === 1) {
        setAvailablePositions((prev) =>
          prev.filter((p) => p !== selectedPosition)
        );
      }

      await setDoc(doc(db, "currentPlayer", "active"), {
        ...randomPlayer,
        updatedAt: serverTimestamp(),
      });

      setCurrentPlayer(randomPlayer);
    } catch (err) {
      console.error("Choose player error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen text-white px-4 py-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-4">
        {/* HEADER */}
        <div className="backdrop-blur-md bg-white/2 border border-white/10 rounded-2xl p-6">
          <Text variant="subheading" className="text-2xl font-semibold">
            Auction Panel
          </Text>
          <Text variant="para" className="text-sm text-gray-300 mt-2">
            Randomize positions and push players into live auction.
          </Text>
        </div>

        {/* CONTROL BAR */}
        <div className="backdrop-blur-md bg-white/2 border border-white/30 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AUCTION CONTROL */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-white/40"
                onClick={chooseRandomPosition}
                disabled={!availablePositions.length}
              >
                <Text variant="para" className="text-[#41FFEE]">
                  Random Position
                </Text>
              </Button>

              <Button
                variant="outline"
                className="flex-1 border-white/40"
                onClick={chooseRandomPlayer}
                disabled={
                  !selectedPosition ||
                  loading ||
                  !getPlayersForPosition(selectedPosition).length
                }
              >
                <Text variant="para" className="text-[#41FFEE]">
                  Random Player
                </Text>
              </Button>
            </div>

            {selectedPosition && (
              <Text
                variant="heading"
                className="text-xl font-bold border border-white/40 rounded-xl px-4 py-2 w-full text-center"
              >
                {selectedPosition}
              </Text>
            )}

            {currentPlayer ? (
              <div
                className="cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() =>
                  navigate("/player-details", {
                    state: { player: currentPlayer },
                  })
                }
              >
                <PlayerCard player={currentPlayer} />
              </div>
            ) : (
              <p className="text-gray-400">
                Select a position to begin the auction.
              </p>
            )}
          </div>

          {/* TEAMS */}
          <div className="flex justify-center items-center">
            <Text variant="heading">Teams</Text>
          </div>

          {/* FEATURES */}
          <div className="flex justify-center items-center">
            <Text variant="heading">Features</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuctionControl;


