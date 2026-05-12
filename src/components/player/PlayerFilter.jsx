import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { Button } from "../ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import PlayerList from "../player/PlayerList";
import { ArrowUpDown } from "lucide-react";

const CATEGORIES = [
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

const OVERALLS = ["95", "85", "80"];

const PlayerFilter = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const maxOverall = Number(searchParams.get("overall") || 95);

  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortHighToLow, setSortHighToLow] = useState(true);

  // 🚀 1. FETCH ONLY ONCE
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);

      try {
        const playersRef = collection(db, "players");

        const q = query(playersRef); // ❌ no filters in Firestore

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // 🚀 2. LOCAL FILTERING (FAST)
  const filteredPlayers = useMemo(() => {
    let result = [...allPlayers];

    if (category) {
      result = result.filter((p) => p.Position === category);
    }

    result = result.filter((p) => Number(p.Overall) <= maxOverall);

    result.sort((a, b) =>
      sortHighToLow ? b.Overall - a.Overall : a.Overall - b.Overall,
    );

    return result;
  }, [allPlayers, category, maxOverall, sortHighToLow]);

  // 🚀 3. URL PARAM UPDATE
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    setSearchParams(params);
  };

  const toggleSort = () => {
    setSortHighToLow((prev) => !prev);
  };

  const openPlayerDetails = (player) => {
    navigate("/player-details", {
      state: { player },
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* FILTER BAR */}
      <div className="flex flex-col gap-3 mb-2 shrink-0">
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
              className="border border-white/10 bg-white/5 text-white px-3 py-2 rounded-md"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0d1117]">
                  {cat || "All Positions"}
                </option>
              ))}
            </select>

            <select
              value={maxOverall}
              onChange={(e) => updateParam("overall", e.target.value)}
              className="border border-white/10 bg-white/5 text-white px-3 py-2 rounded-md"
            >
              {OVERALLS.map((o) => (
                <option key={o} value={o} className="bg-[#0d1117]">
                  {o}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={toggleSort}>
            <ArrowUpDown
              className={`w-4 h-4 transition-transform duration-200 ${
                sortHighToLow ? "rotate-0" : "rotate-180"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* PLAYER LIST */}
      <div className="flex-1 w-full overflow-y-scroll pr-1">
        <PlayerList
          players={filteredPlayers}
          loading={loading}
          onPlayerClick={openPlayerDetails}
        />
      </div>
    </div>
  );
};

export default PlayerFilter;
