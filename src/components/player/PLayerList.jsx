import React from "react";
import PlayerCard from "./PlayerCard";

const PlayerList = ({ players, onPlayerClick, loading }) => {
  if (loading) return <p>Loading players...</p>;
  if (!players.length) return <p>No players found. Select Category</p>;

  return (
    <div className="realtive h-full grid grid-cols-1 items-center justify-center md:grid-cols-2 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.ID}
          player={player}
          onClick={onPlayerClick}
        />
      ))}
    </div>
  );
};

export default PlayerList;
