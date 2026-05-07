import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { useNavigate, useSearchParams } from "react-router-dom";

import PlayerList from "../player/PlayerList";

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

const OVERALLS = ["95","85","80"];

const PlayerFilter = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const maxOverall = searchParams.get("overall") || "95";

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortHighToLow, setSortHighToLow] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);

      try {
        const playersRef = collection(db, "players");

        let playersQuery;

        if (category) {
          playersQuery = query(
            playersRef,
            where("Position", "==", category),
            where("Overall", "<=", (maxOverall)),
            orderBy("Overall", sortHighToLow ? "desc" : "asc")
          );
        } else {
          playersQuery = query(
            playersRef,
            where("Overall", "<=", Number(maxOverall)),
            orderBy("Overall", sortHighToLow ? "desc" : "asc")
          );
        }

        const snapshot = await getDocs(playersQuery);

        const fetchedPlayers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [category, maxOverall, sortHighToLow]);

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
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="
              border border-white/10
              bg-white/5
              text-white
              px-3 py-2
              rounded-md
              focus:outline-none
            "
          >
            {CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat}
                className="bg-[#0d1117]"
              >
                {cat || "All Positions"}
              </option>
            ))}
          </select>

          <select
            value={maxOverall}
            onChange={(e) => updateParam("overall", e.target.value)}
            className="
              border border-white/10
              bg-white/5
              text-white
              px-3 py-2
              rounded-md
              focus:outline-none
            "
          >
            {OVERALLS.map((overall) => (
              <option
                key={overall}
                value={overall}
                className="bg-[#0d1117]"
              >
              {overall}
              </option>
            ))}
          </select>
          <Button
            variant="filled"
            onClick={toggleSort}
            className="rounded-md"
          >
            {sortHighToLow ? "High → Low" : "Low → High"}
          </Button>
          
        </div>

        <div className="flex gap-2 flex-wrap">
          
        </div>
      </div>

      {/* PLAYER LIST */}
      <div className="flex-1 overflow-y-auto pr-1">
        <PlayerList
          players={players}
          loading={loading}
          onPlayerClick={openPlayerDetails}
        />
      </div>
    </div>
  );
};

export default PlayerFilter;