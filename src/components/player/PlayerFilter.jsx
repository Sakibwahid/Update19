import React, { useMemo, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { useQuery } from "@tanstack/react-query";
import PlayerList from "../player/PlayerList";

const fetchPlayers = async () => {
  const q = query(collection(db, "players"), limit(500));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    Overall: Number(doc.data().Overall),
  }));
};

const PlayerFilter = () => {
  const [category, setCategory] = useState("");
  const [maxOverall, setMaxOverall] = useState(95);
  const [sortHighToLow, setSortHighToLow] = useState(true);

  const { data: allPlayers = [], isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache (your old logic)
  });

  const filteredPlayers = useMemo(() => {
    let result = [...allPlayers];

    if (category) {
      result = result.filter((p) => p.Position === category);
    }

    result = result.filter((p) => Number(p.Overall) <= maxOverall);

    result.sort((a, b) =>
      sortHighToLow ? b.Overall - a.Overall : a.Overall - b.Overall
    );

    return result;
  }, [allPlayers, category, maxOverall, sortHighToLow]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex gap-2 mb-2">
        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Positions</option>
        </select>

        <select onChange={(e) => setMaxOverall(Number(e.target.value))}>
          <option value={95}>95</option>
          <option value={85}>85</option>
          <option value={80}>80</option>
        </select>

        <button onClick={() => setSortHighToLow((p) => !p)}>
          Sort
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PlayerList players={filteredPlayers} loading={isLoading} />
      </div>
    </div>
  );
};

export default PlayerFilter;