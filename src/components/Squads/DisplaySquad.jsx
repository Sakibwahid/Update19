import React, { useEffect, useState } from "react";
import { Input } from "../ui/Input";
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
import Loadin from "../ui/loadin";

const POSITION_GROUPS = {
  GK: ["GK"],
  DEF: ["CB", "LB", "RB", "LWB", "RWB"],
  MID: ["CDM", "CM", "CAM", "LM", "RM"],
  FWD: ["LW", "RW", "CF", "ST"],
};

const getGroup = (pos) => {
  if (POSITION_GROUPS.GK.includes(pos)) return "Goalkeepers";
  if (POSITION_GROUPS.DEF.includes(pos)) return "Defenders";
  if (POSITION_GROUPS.MID.includes(pos)) return "Midfielders";
  if (POSITION_GROUPS.FWD.includes(pos)) return "Forwards";
  return "Others";
};

// Define the field layout
const FIELD_LAYOUT = [
  ["GK"],
  ["LB", "CB1", "CB2", "RB"],
  ["LM", "CDM", "CM", "RM"],
  ["LW", "CAM", "RW"],
  ["CF", "ST"]
];

const DisplaySquad = () => {
  const [players, setPlayers] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState("All players");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'squad'

  const [fieldPositions, setFieldPositions] = useState({});
  const [remainingPlayers, setRemainingPlayers] = useState([]);

  // 🔹 Fetch user's teamId from Firebase
  useEffect(() => {
    const fetchUserTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const id = snap.data().teamId;
          setSelectedTeamId(id);
          setUserTeamId(id);
        }
      } catch (err) {
        console.error("Error fetching user team:", err);
      }
    };

    fetchUserTeam();
  }, []);

  // 🔹 Fetch players whenever selectedTeamId or position changes
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchPlayers = async () => {
      setLoading(true);

      try {
        let q;
        if (position === "All players" || !position) {
          q = query(
            collection(db, "players"),
            where("currentTeamId", "==", selectedTeamId),
            orderBy("Overall", "desc")
          );
        } else {
          q = query(
            collection(db, "players"),
            where("currentTeamId", "==", selectedTeamId),
            where("Position", "==", position),
            orderBy("Overall", "desc")
          );
        }

        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlayers(list);
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeamId, position]);

  // 🔹 Auto-place players on field whenever players change
  useEffect(() => {
    if (viewMode !== "squad") return;

    const positions = {};
    const remaining = [...players];

    FIELD_LAYOUT.flat().forEach((pos) => {
      // pick best available player for this position
      const candidates = remaining
        .filter(p => p.Position === pos || p.Position.startsWith(pos[0]))
        .sort((a, b) => b.Overall - a.Overall);

      if (candidates.length > 0) {
        positions[pos] = candidates[0];
        const index = remaining.findIndex(p => p.id === candidates[0].id);
        remaining.splice(index, 1);
      } else {
        positions[pos] = null;
      }
    });

    setFieldPositions(positions);
    setRemainingPlayers(remaining);
  }, [players, viewMode]);

  // 🔹 Drag & Drop handlers
  const onDragStart = (e, playerId) => {
    e.dataTransfer.setData("playerId", playerId);
  };

  const onDrop = (e, pos) => {
    const playerId = e.dataTransfer.getData("playerId");
    const player = players.find(p => p.id === playerId);

    setFieldPositions(prev => {
      const newPositions = { ...prev };

      // Swap if occupied
      const existingPlayer = newPositions[pos];
      if (existingPlayer) {
        setRemainingPlayers(prevRem => [...prevRem, existingPlayer]);
      }

      newPositions[pos] = player;
      setRemainingPlayers(prevRem => prevRem.filter(p => p.id !== player.id));

      return newPositions;
    });
  };

  const onDragOver = (e) => e.preventDefault();

  // 🔹 Handlers
  const handlePosition = (e) => setPosition(e.target.value);
  const handleTeam = (e) => setSelectedTeamId(e.target.value);

  // 🔹 Grouped players for list view
  const groupedPlayers = players.reduce((acc, p) => {
    const group = getGroup(p.Position);
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  if (loading) return <Loadin>Stars are loading...</Loadin>;

  return (
    <div className="p-6 min-w-full flex flex-col mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <Text variant="heading" className="text-white text-center mb-4">
          {viewMode === "list" ? "Your Squad" : "Squad Builder"}
        </Text>

        {/* Toggle View */}
        <button
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => setViewMode(viewMode === "list" ? "squad" : "list")}
        >
          {viewMode === "list" ? "Squad View" : "Back to List"}
        </button>
      </div>

      {viewMode === "list" && (
        <>
          <div className="flex items-center space-x-4">
            <Input
              label="Position"
              options={[
                "All players",
                "GK",
                "CB",
                "LB",
                "RB",
                "LWB",
                "RWB",
                "CDM",
                "CM",
                "CAM",
                "LM",
                "RM",
                "LW",
                "RW",
                "CF",
                "ST",
              ]}
              onChange={handlePosition}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-300">Team</label>
              <select
                value={selectedTeamId || ""}
                onChange={handleTeam}
                className="
                  text-white h-10 border border-gray-400 px-3 rounded-lg
                  bg-transparent appearance-none text-sm leading-none
                  focus:outline-none focus:ring-1 focus:ring-gray-300
                "
              >
                {userTeamId && <option value={userTeamId}>Your Squad</option>}
                <option value="wolves01">Wolverhampton Wanderers F.C.</option>
                <option value="bayern05">FC Bayern Munich</option>
                <option value="city04">Manchester City F.C.</option>
                <option value="united03">Manchester United F.C.</option>
                <option value="liverpool02">Liverpool F.C.</option>
              </select>
            </div>
          </div>

          {/* Grouped Players List */}
          {Object.entries(groupedPlayers).map(([group, list]) => (
            <div key={group} className="space-y-2">
              <Text
                variant="heading"
                className="text-gray-300 text-xl font-semibold mt-4"
              >
                {group}
              </Text>

              {list.map((p) => (
                <div
                  key={p.id}
                  className="
                    w-full flex items-center gap-3 rounded-lg px-3 py-2
                    backdrop-blur-md bg-blue-50 border border-white/10 shadow-sm
                  "
                >
                  <img
                    src={`/player_photos/${p.ID}.png`}
                    alt={p.Name}
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Text className="text-slate-950 font-semibold text-xl">
                      {p.Name}
                    </Text>
                    <Text className="text-gray-800">{p.Position}</Text>
                  </div>
                  <div className="text-center">
                    <Text className="text-gray-800 font-bold text-xl">
                      {p.Overall}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-[#053abe] font-bold text-xl">
                      {p.soldPrice ?? "—"}M
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {players.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No players found</p>
          )}
        </>
      )}

      {viewMode === "squad" && (
        <>
          {/* Football Field */}
          <div className="bg-green-700 w-full max-w-3xl p-4 rounded-lg flex flex-col gap-4">
            {FIELD_LAYOUT.map((row, i) => (
              <div key={i} className="flex justify-around gap-4">
                {row.map((pos) => (
                  <div
                    key={pos}
                    className="w-20 h-20 bg-green-500 rounded flex items-center justify-center border-2 border-white cursor-pointer"
                    onDrop={(e) => {
                      e.preventDefault();
                      onDrop(e, pos);
                    }}
                    onDragOver={onDragOver}
                  >
                    {fieldPositions[pos]?.Name || pos}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Remaining Players */}
          <div className="mt-6 flex flex-wrap gap-4">
            {remainingPlayers.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => onDragStart(e, p.id)}
                className="bg-blue-500 px-4 py-2 rounded cursor-grab hover:bg-blue-600"
              >
                {p.Name} ({p.Position})
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DisplaySquad;
