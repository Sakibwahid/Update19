import React from "react";
import PlayerFilter from "../player/PlayerFilter";
import PlayerCard from "../player/PlayerCard";
import useCurrentPlayer from "../../hooks/useCurrentPlayer";

import { Text } from "../ui/Text";

const AuctionSection = () => {
  const { currentPlayer, loading: currentPlayerLoading } = useCurrentPlayer();

  return (
    <div className="h-screen text-white grid grid-cols-1 lg:grid-cols-3 gap-3 p-2">
      {/* CURRENT AUCTION PLAYER — Right */}
      <div className="lg:col-span-1 grid grid-cols-3 text-center justify-center items-start backdrop-blur-md bg-white/2 border border-blue-300 rounded-xl">
        <div className="flex h-full col-span-1 justify-center items-center">
        <Text
          variant="subheading"
          className="text-3xl text-center m-4"
        >
            Current Auction Player
        
        </Text>
        </div>
        {currentPlayerLoading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : currentPlayer ? (
          <div className="flex col-span-2 h-full items-center justify-center">
            <PlayerCard player={currentPlayer} />
          </div>
        ) : (
          <p className="text-center text-gray-500">No player in auction yet</p>
        )}
      </div>
      <div className="lg:col-span-2 backdrop-blur-md bg-white/2 border border-blue-300 rounded-xl p-4 overflow-y-scroll">
        <PlayerFilter />
      </div>
    </div>
  );
};

export default AuctionSection;
