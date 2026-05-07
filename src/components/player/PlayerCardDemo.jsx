import React from "react";
import { Text } from "../ui/Text";

const PlayerCardDemo = ({ player, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(player)}
      className={`
        w-full max-w-full
        rounded-lg
        border border-white/40
        bg-blue-900
        px-4 py-4
        overflow-hidden
        ${
          onClick
            ? "cursor-pointer transition-all duration-200 hover:bg-blue-800"
            : ""
        }
      `}
    >
      <div className="flex items-stretch gap-3 w-full min-w-0">
        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* NAME + POSITION + RATING */}
          <div className=" min-w-0">
            <Text
            variant="subheading"
              className="
                text-white font-bold
                text-3xl md:text-2xl
                leading-[1.05]
                tracking-tight
                truncate
              "
            >
              {player.Name}
            </Text>

            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <Text
                variant="subheading"
                className="
                  text-cyan-300
                  font-semibold
                  tracking-[0.08em]
                  uppercase
                "
              >
                {player.Position}
              </Text>

              <Text
                variant="subheading"
                className="
                  text-cyan-300
                  text-[18px] sm:text-[22px]
                  font-bold
                  leading-none
                "
              >
                {player.Overall}
              </Text>

            </div>
          </div>

          {/* DIVIDER */}
          <div className="h-px bg-white/10 mb-3" />

          {/* STATS */}
          <div className="grid grid-cols-6 gap-1 min-w-0">
            <Stat label="PAC" value={player.Acceleration} />
            <Stat label="SHO" value={player.ShotPower} />
            <Stat label="PAS" value={player.ShortPassing} />
            <Stat label="DRI" value={player.Dribbling} />
            <Stat label="DEF" value={player.StandingTackle} />
            <Stat label="PHY" value={player.Strength} />
          </div>
        </div>

        {/* PHOTO SECTION */}
        <div className="flex items-center gap-3 shrink-0">
          {/* VERTICAL DIVIDER */}
          <div className="w-px self-stretch bg-white/10" />

          {/* PHOTO */}
          <div
            className="
              w-18 h-24
              sm:w-24 sm:h-29.5
              rounded-lg
              bg-blue-800
              border border-white/10
              overflow-hidden
              flex items-end justify-center
              shrink-0
            "
          >
            <img
              src={`/player_photos/${player.ID}.png`}
              alt={player.Name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center min-w-0">
    <Text
      className="
        text-[14px] sm:text-[14px]
        uppercase
        tracking-[0.08em]
        text-white/40
        leading-none
      "
    >
      {label}
    </Text>

    <Text
      className="
        mt-1
        text-[14px] sm:text-[16px]
        text-white/85
        leading-none
      "
    >
      {value}
    </Text>
  </div>
);

export default PlayerCardDemo;