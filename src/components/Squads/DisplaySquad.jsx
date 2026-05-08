import React, { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import Loadin from "../ui/loadin";
import FieldView from "./FieldView";

const POSITION_GROUPS = {
  GK: ["GK"],
  DEF: ["CB", "LB", "RB", "LWB", "RWB"],
  MID: ["CDM", "CM", "CAM", "LM", "RM"],
  FWD: ["LW", "RW", "CF", "ST"],
};

const getGroup = (pos) => {
  if (POSITION_GROUPS.GK.includes(pos)) return "GK";
  if (POSITION_GROUPS.DEF.includes(pos)) return "DEF";
  if (POSITION_GROUPS.MID.includes(pos)) return "MID";
  if (POSITION_GROUPS.FWD.includes(pos)) return "FWD";
  return "Others";
};

// Sum soldPrice for an array of players
const sumValue = (list) =>
  list.reduce((acc, p) => acc + (p.soldPrice ?? 0), 0);

const DisplaySquad = () => {
  const [players, setPlayers] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState("All players");
  const [viewMode, setViewMode] = useState("list");
  const [seasonId, setSeasonId] = useState("S2");

  /* ---------------- USER TEAM ---------------- */
  useEffect(() => {
    const fetchUserTeam = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const teamId = snap.data().teamId;
        setUserTeamId(teamId);
        setSelectedTeamId(teamId);
      }
    };
    fetchUserTeam();
  }, []);

  /* ---------------- FETCH SQUAD ---------------- */
  useEffect(() => {
    if (!selectedTeamId || !seasonId) return;

    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const seasonQuery = query(
          collection(db, "season_players"),
          where("teamId", "==", selectedTeamId),
          where("seasonId", "==", seasonId)
        );
        const seasonSnap = await getDocs(seasonQuery);
        const seasonData = seasonSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (seasonData.length === 0) {
          setPlayers([]);
          setLoading(false);
          return;
        }

        const playerPromises = seasonData.map((sp) =>
          getDoc(doc(db, "players", sp.playerId))
        );
        const playerSnaps = await Promise.all(playerPromises);

        const playerMap = {};
        playerSnaps.forEach((snap) => {
          if (snap.exists()) playerMap[snap.id] = snap.data();
        });

        let merged = seasonData.map((sp) => ({
          ...playerMap[sp.playerId],
          ...sp,
        }));

        if (position !== "All players") {
          merged = merged.filter((p) => p.Position === position);
        }

        merged.sort((a, b) => (b.Overall || 0) - (a.Overall || 0));
        setPlayers(merged);
      } catch (err) {
        console.error("Error fetching squad:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeamId, position, seasonId]);

  /* ---------------- GROUP PLAYERS ---------------- */
  const groupedPlayers = players.reduce((acc, p) => {
    const group = getGroup(p.Position);
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  const totalValue = sumValue(players);

  if (loading) return <Loadin>Stars are loading...</Loadin>;

  return (
    <div className="p-4 max-h-screen min-w-full flex flex-col mx-auto space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Text variant="subheading" className="text-white mb-4">
          {viewMode === "list" ? "Your Squad" : "Squad Builder"}
        </Text>

        <button
          className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => setViewMode(viewMode === "list" ? "squad" : "list")}
        >
          {viewMode === "list" ? "Squad View" : "Back to List"}
        </button>
      </div>

      {viewMode === "list" && (
        <>
          {/* FILTERS */}
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              label="Position"
              options={[
                "All players", "GK", "CB", "LB", "RB", "LWB", "RWB",
                "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST",
              ]}
              onChange={(e) => setPosition(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-300">Team</label>
              <select
                value={selectedTeamId || ""}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="text-white h-10 border border-gray-400 px-3 rounded-lg bg-transparent text-sm"
              >
                {userTeamId && <option value={userTeamId}>Your Squad</option>}
                <option value="wolves01">Wolves</option>
                <option value="bayern05">Bayern Munich</option>
                <option value="city04">Manchester City</option>
                <option value="united03">Manchester United</option>
                <option value="liverpool01">Liverpool</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-300">Season</label>
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="text-white h-10 border border-gray-400 px-3 rounded-lg bg-transparent text-sm"
              >
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>
            </div>
          </div>

          {/* SQUAD VALUE SUMMARY */}
          {players.length > 0 && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex flex-col gap-3">

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                  Total Squad Value
                </span>
                <span className="text-xl font-bold text-white tracking-tight">
                  {totalValue}M
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10" />

              {/* Per-group breakdown */}
              <div className="flex justify-between gap-x-6 gap-y-2">
                {Object.entries(groupedPlayers).map(([group, list]) => {
                  const groupValue = sumValue(list);
                  return (
                    <div key={group} className="flex flex-col items-center">
                      <span className="text-xs text-white/40 uppercase tracking-widest">
                        {group}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {groupValue}M
                      </span>
                      <span className="text-[10px] text-white/25">
                        ({list.length} players)
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* PLAYER LIST */}
          {Object.entries(groupedPlayers).map(([group, list]) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center justify-between mt-4">
                <Text className="text-gray-300 text-xl font-semibold">
                  {group}
                </Text>
                <span className="text-sm text-white/40 font-medium">
                  {sumValue(list)}M
                </span>
              </div>

              {list.map((p) => (
                <div
                  key={p.id}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 backdrop-blur-md bg-blue-50 border border-white/10"
                >
                  <img
                    src={`/player_photos/${p.playerId || p.id}.png`}
                    alt={p.Name}
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <Text className="text-black font-semibold text-xl">
                      {p.Name}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <Text className="text-gray-800 font-semibold text-xl">
                      {p.Position}
                    </Text>
                    <Text className="text-black font-bold text-xl">
                      {p.Overall}
                    </Text>
                    <Text className="text-blue-700 font-bold text-xl">
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

      {/* FIELD VIEW */}
      {viewMode === "squad" && <FieldView players={players} />}
    </div>
  );
};

export default DisplaySquad;