import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase/config";

const positions = [
  "",
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
];

const overalls = ["95", "90", "85", "80"];

const PlayerTableAssign = ({ currentSeasonId }) => {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState({});
  const [position, setPosition] = useState("");
  const [maxOverall, setMaxOverall] = useState("95");
  const [teamId, setTeamId] = useState("");
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // 🔹 Fetch teamId once on mount
useEffect(() => {
  const fetchTeam = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setTeamId(snap.data().teamId);
        console.log("Team ID loaded:", snap.data().teamId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchTeam(); // first run
  const timer = setTimeout(fetchTeam, 1000); // second run after 1 sec

  return () => clearTimeout(timer);
}, []);


  // 🔹 Fetch filtered players when position or maxOverall changes
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      try {
        let q;

        if (position) {
          // With position filter
          q = query(
            collection(db, "players"),
            where("Position", "==", position),
            where("Overall", "<=", maxOverall),
            orderBy("Overall", "desc")
          );
        } else {
          // Without position filter
          q = query(
            collection(db, "players"),
            where("Overall", "<=", Number(maxOverall)),
            orderBy("Overall", "desc")
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
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [position, maxOverall]);

  // 🔹 Select / deselect a player
  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev[id]) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { soldPrice: "" } };
    });
  };

  // 🔹 Update sold price per player
  const updatePrice = (id, value) => {
    setSelected((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        soldPrice: value,
      },
    }));
  };

  // 🔹 Assign selected players to team
  const assignPlayers = async () => {
    if (!teamId) return alert("Team not found");
    if (Object.keys(selected).length === 0)
      return alert("No players selected");

    const invalid = Object.entries(selected).some(
      ([_, data]) => !data.soldPrice
    );
    if (invalid) return alert("Please enter sold price for all selected players");

    setAssigning(true);

    try {
      const batch = writeBatch(db);

      Object.entries(selected).forEach(([playerId, data]) => {
        const playerRef = doc(db, "players", playerId);
        batch.update(playerRef, {
          currentTeamId: teamId,
          currentSeasonId: "S2",
          soldPrice: Number(data.soldPrice),
        });
      });

      await batch.commit();
      setSelected({});
      alert("Players assigned successfully");
    } catch (err) {
      console.error("Error assigning players:", err);
      alert("Error assigning players");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Assign Players to Team</h2>

      {/* Filters and Assign Button */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p || "All Positions"}
            </option>
          ))}
        </select>

        <select
          value={maxOverall}
          onChange={(e) => setMaxOverall(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {overalls.map((o) => (
            <option key={o} value={o}>
              ≤ {o}
            </option>
          ))}
        </select>

        <button
          onClick={assignPlayers}
          disabled={!teamId || assigning}
          className={`px-4 py-2 rounded text-white ${
            assigning ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {assigning ? "Assigning..." : "Assign Selected Players"}
        </button>

        {teamId && (
          <span className="ml-4 font-medium">Team ID: {teamId}</span>
        )}
      </div>

      {/* Player Table */}
      {loadingPlayers ? (
        <p>Loading players...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Select</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Pos</th>
              <th className="border p-2">Ovr</th>
              <th className="border p-2">Sold Price</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={!!selected[p.id]}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>
                <td className="border p-2">{p.Name}</td>
                <td className="border p-2">{p.Position}</td>
                <td className="border p-2">{p.Overall}</td>
                <td className="border p-2">
                  {selected[p.id] && (
                    <input
                      type="number"
                      value={selected[p.id].soldPrice}
                      onChange={(e) =>
                        updatePrice(p.id, e.target.value)
                      }
                      className="border px-2 py-1 w-24"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlayerTableAssign;
