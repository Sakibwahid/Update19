import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Text } from "../ui/Text";
import Stats from "../ui/Stats";
import Stars from "../ui/Stars";
const PlayerDetails = () => {
  const location = useLocation();
  const [player, setPlayer] = useState(
    () =>
      JSON.parse(localStorage.getItem("player")) ||
      location.state?.player ||
      null
  );

  useEffect(() => {
    if (location.state?.player) {
      localStorage.setItem("player", JSON.stringify(location.state.player));
      setPlayer(location.state.player);
    }
  }, [location.state]);

  if (!player) {
    return (
      <div className="p-10 text-center">
        <p>Player not found</p>
      </div>
    );
  }

  const numericStats = [
    "Potential",
    "Crossing",
    "Finishing",
    "HeadingAccuracy",
    "ShortPassing",
    "Dribbling",
    "BallControl",
    "SprintSpeed",
    "ShotPower",
    "Stamina",
    "Strength",
    "LongShots",
    "Marking",
    "StandingTackle",
    "SlidingTackle",
    "GKDiving",
    "GKHandling",
    "GKKicking",
    "GKPositioning",
    "GKReflexes",
  ];

  return (
    <div className="w-full flex justify-center p-2">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col gap-10">
        {/* TOP SECTION: Info + Photo */}
        <div className="flex  md:flex-row gap-4 justify-between items-center md:items-start">
          {/* LEFT: Player Info */}
          <div className="flex flex-col gap-2">
            <Text variant="subheading" className="text-3xl md:text-4xl">
              {player.Name}
            </Text>
            <Text
              variant="subheading"
              className="text-2xl md:text-4xl text-[#41FFEE] font-semibold"
            >
              {player.Overall}
            </Text>
            <Text variant="subheading" className="text-xl md:text-4xl">
              {player.Position}
            </Text>
          </div>
          <div>
            <div className="mt-2 flex flex-col gap-4">
              <Text variant="para">
                Nationality:{" "}
                <span className="text-white">{player.Nationality}</span>
              </Text>
              <Text variant="para">
                Club: <span className="text-white">{player.Club}</span>
              </Text>
              <Text variant="para">
                Age: <span className="text-white">{player.Age}</span>
              </Text>
              <Text variant="para">
                Height: <span className="text-white">{player.Height}</span>
              </Text>
            </div>

            <div className="mt-2 flex items-center gap-4"></div>
          </div>

          {/* RIGHT: Player Photo */}
          <div className="shrink-0">
            <img
              src={`/player_photos/${player.ID}.png`}
              alt={player.Name}
              className="w-28 h-30 md:w-44 md:h-40 object-cover rounded-xl"
            />
          </div>
        </div>

        {/* BOTTOM SECTION: Stats with labels */}
        <div className="flex flex-col gap-3">
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {numericStats.map((stat, index) =>
              player[stat] !== undefined && !isNaN(player[stat]) ? (
                <Stats key={index} width={player[stat]} label={stat} />
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
