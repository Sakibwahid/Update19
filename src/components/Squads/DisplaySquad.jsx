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

const DisplaySquad = () => {
  const [players, setPlayers] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null); // actual user's team
  const [selectedTeamId, setSelectedTeamId] = useState(null); // dropdown selection
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState("All players");

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
          setUserTeamId(id); // default view: user's own team
        }
      } catch (err) {
        console.error("Error fetching user team:", err);
      }
    };

    fetchUserTeam();
    const t = setTimeout(fetchUserTeam, 1000);
    return () => clearTimeout(t);
  }, []);

  // 🔹 Fetch players whenever selectedTeamId or position changes
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchPlayers = async () => {
      setLoading(true);

      try {
        let q;

        if (position === "All players" || !position) {
          // Query all players for the selected team
          q = query(
            collection(db, "players"),
            where("currentTeamId", "==", selectedTeamId),
            orderBy("Overall", "desc"),
          );
        } else {
          // Query only players of the selected position
          q = query(
            collection(db, "players"),
            where("currentTeamId", "==", selectedTeamId),
            where("Position", "==", position),
            orderBy("Overall", "desc"),
          );
        }

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
  }, [selectedTeamId, position]);

  // 🔹 Handlers
  const handlePosition = (e) => {
    setPosition(e.target.value);
  };

  const handleTeam = (e) => {
    const teamId = e.target.value;
    if (!teamId) return;

    setSelectedTeamId(teamId);
  };

  // 🔹 Group players by position
  const groupedPlayers = players.reduce((acc, p) => {
    const group = getGroup(p.Position);
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 min-w-full flex flex-col mx-auto space-y-2">
      <Text variant="heading" className="text-white text-center mb-4">
        Your Squad
      </Text>

      {loading && <Loadin>Stars are loading...</Loadin>}

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

        {/* Team select with label */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-300">Team</label>

          <select
            value={selectedTeamId || ""}
            onChange={handleTeam}
            className="
      text-white
      h-10
      border border-gray-400
      px-3
      rounded-lg
      bg-transparent
      appearance-none
      text-sm
      leading-none
      focus:outline-none
      focus:ring-1
      focus:ring-gray-300
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

      {/* Grouped Players */}
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
                w-full
                flex items-center gap-3
                rounded-lg
                px-3 py-2
                backdrop-blur-md
                bg-blue-50
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
                <Text className="text-slate-950 font-semibold text-xl">
                  {p.Name}
                </Text>
                <Text className="text-gray-800">{p.Position}</Text>
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
