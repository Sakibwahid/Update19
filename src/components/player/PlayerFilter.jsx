import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { useNavigate, useSearchParams } from "react-router-dom";
import PlayerList from "../player/PLayerList";

const categories = [
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

const overalls = ["95", "85", "80"];

const PlayerFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

        const q = query(
          playersRef,
          where("Position", "==", category),
          where("Overall", "<=", maxOverall),
          orderBy("Overall", sortHighToLow ? "desc" : "asc")
        );

        const snapshot = await getDocs(q);
        const fetchedPlayers = snapshot.docs.map((doc) => doc.data());
        setPlayers(fetchedPlayers);
      } catch (err) {
        console.error("Error fetching players:", err);
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
    navigate("/player-details", { state: { player } });
  };

  return (
    <div className="h-full">
      {/* FILTERS */}
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-between mt-2">
          <Text className=" text-2xl text-white font-semibold mb-1">Filter By:</Text>
          <Button variant="filled" onClick={toggleSort}>Sort</Button>
        </div>
        <div className="flex gap-2">
          <div className="">
            <label className="block mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => updateParam("category", e.target.value)}
              className="border text-white px-3 py-2 rounded w-40"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
            <div>
             <label className="block mb-1 font-medium">Max Overall</label>
          <select
            value={maxOverall}
            onChange={(e) => updateParam("overall", e.target.value)}
            className="border px-3 py-2 rounded w-40"
          >
            {overalls.map((overall) => (
              <option key={overall} value={overall}>
                {overall}
              </option>
            ))}
          </select>
            </div>
        </div>
       
      </div>

      {/* PLAYER LIST */}
      <div className="w-full h-full flex justify-center items-center">
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
