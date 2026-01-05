import React from "react";
import { Text } from "../ui/Text";

const PlayerCard = ({ player, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(player)}
      className="w-full h-full flex flex-col justify-center items-center bg-no-repeat  cursor-pointer"
      style={{
        backgroundImage: `url(/Card.png)`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        width: "220px",
        height: "320px",
      }}
    >
      <div className="h-full w-full flex flex-col gap-1">
        {/* Top section */}
        <div className="flex justify-between items-center px-8 mt-10">
          <Text variant="para" className="text-gray-700 font-bold text-2xl p-2">
            {player.Overall}
          </Text>
          <Text variant="para" className="text-gray-700 font-semibold ">
            {player.Position}
          </Text>
        </div>

        {/* Player image */}
        <div className="w-full h-32 flex flex-col justify-center items-center">
          <img
            src={`/player_photos/${player.ID}.png`}
            alt={player.Name}
            className="w-28 h-27 object-fit"
          />
          <div className="text-center">
          <Text variant="para" className="text-gray-600 font-bold text-xl ">
            {player.Name}
          </Text>
        </div>
        </div>

        {/* Name */}
        

        {/* Stats */}
        <div className="text-gray-00 flex gap-[5px] justify-center items-center">
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
    <Text className="text-gray-900 text-sm">{label}</Text>
    <Text className="text-gray-600 font-semibold">{value}</Text>
  </div>
);

export default PlayerCard;
