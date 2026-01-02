import React from "react";
import { Text } from "../ui/Text";

const PlayerCard = ({ player, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(player)}
      className="relative flex flex-col bg-no-repeat items-center text-black p-6 cursor-pointer"
      style={{
        backgroundImage: `url(/Card.png)`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        width: "250px",
        height: "350px",
      }}
    >
      <div className="h-full w-full flex flex-col">
        {/* Top section */}
        <div className="flex justify-between items-center pt-4 px-4 mt-2">
          <Text variant="para" className="font-bold text-2xl text-yellow-900">
            {player.Overall}
          </Text>
          <Text variant="para" className="font-semibold text-yellow-900">
            {player.Position}
          </Text>
        </div>

        {/* Player image */}
        <div className="w-full h-32 flex justify-center items-center">
          <img
            src={`/player_photos/${player.ID}.png`}
            alt={player.Name}
            className="w-32 h-38 object-cover"
          />
        </div>

        {/* Name */}
        <div className="text-center mt-2">
          <Text variant="para" className="font-bold text-xl text-yellow-900">
            {player.Name}
          </Text>
        </div>

        {/* Stats */}
        <div className="flex gap-2 justify-center items-center mt-1">
          <Stat label="PAC" value={player.Acceleration} />
          <Stat label="SHO" value={player.ShotPower} />
          <Stat label="PAS" value={player.ShortPassing} />
          <Stat label="DRI" value={player.Dribbling} />
          <Stat label="DEF" value={player.StandingTackle} />
          <Stat label="PHY" value={player.Strength} />
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="flex flex-col justify-center items-center">
    <Text className="text-yellow-900 text-sm">{label}</Text>
    <Text className="text-yellow-900 font-semibold">{value}</Text>
  </div>
);

export default PlayerCard;
