import React, { memo } from "react";
import useCurrentPlayer from "../../hooks/useCurrentPlayer";
import PlayerFilter from "../player/PlayerFilter";
import { Text } from "../ui/Text";
import PlayerCardDemo from "../player/PlayerCardDemo";

/* ─────────────────────────────────────────
   CurrentAuctionPanel
───────────────────────────────────────── */
const CurrentAuctionPanel = () => {
  const { currentPlayer, loading } = useCurrentPlayer();
  const soldPrice = currentPlayer?.soldPrice;
  const isSold = currentPlayer?.status || false;
  const playerteam = currentPlayer?.team || "N/A";
  console.log(playerteam);
  console.log(soldPrice);
  console.log(currentPlayer)

  return (
    <div
      className="
        min-w-sm lg:col-span-1
        flex flex-col
        backdrop-blur-md bg-white/3
        border border-white/10
        rounded-xl overflow-hidden
        px-2 sm:px-4
        py-1 sm:py-2
      "
    >
      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          px-2 sm:px-4
          py-2 sm:py-3
          border-b border-white/10
          shrink-0
        "
      >
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-cyan-300" />

          <Text
            variant="subheading"
            className="
              text-base sm:text-lg
              font-semibold tracking-wide
            "
          >
            Current Auction
          </Text>
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="
          flex items-center justify-center
          px-2 sm:px-4
          py-2 sm:py-4
        "
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-9 h-9 rounded-full border-2 border-white/10 border-t-cyan-300 animate-spin" />
            <p className="text-xs sm:text-sm text-white/40 tracking-wide">
              Loading player...
            </p>
          </div>
        ) : currentPlayer ? (
          <div className="w-full flex flex-col gap-3">
            <PlayerCardDemo player={currentPlayer} />

            {soldPrice ? (
              <div
                className="
                  rounded-xl border border-white/10
                  bg-white/5
                  px-3 py-2
                  flex items-center justify-between
                "
              >
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/70">
                  Last Sold Price
                </span>

                <span className="text-lg sm:text-xl font-bold text-cyan-300">
                  {soldPrice}M
                </span>
              </div>
            ) : (
              <div
                className="
                  rounded-xl border border-white/10
                  bg-white/5
                  px-3 py-2
                  flex items-center justify-between
                "
              >
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/70">
                  Auction Status
                </span>

                <span className="text-lg sm:text-xl font-bold text-white/60">
                  UNSOLD
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full border border-dashed border-white/10 flex items-center justify-center">
              <span className="text-white/20 text-xl">⚽</span>
            </div>

            <div>
              <p className="text-sm text-white/50 font-medium">
                No player in auction
              </p>

              <p className="text-xs text-white/25 mt-1">
                Waiting for admin selection
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   StablePlayerFilter
───────────────────────────────────────── */
const StablePlayerFilter = memo(() => <PlayerFilter />);
StablePlayerFilter.displayName = "StablePlayerFilter";

/* ─────────────────────────────────────────
   AuctionSection
   Mobile-first optimized
───────────────────────────────────────── */
const AuctionSection = () => {
  return (
    <div
      className="
        h-screen overflow-hidden text-white
        grid grid-cols-1 lg:grid-cols-3
        gap-3
        p-1 sm:p-2 md:p-4
      "
    >
      {/* TOP PANEL */}
      <div
        className="
          lg:col-span-1
          max-h-[42vh] sm:max-h-[46vh] lg:max-h-full
          overflow-hidden
        "
      >
        <CurrentAuctionPanel />
      </div>

      {/* PLAYER LIST */}
      <div
        className="
          lg:col-span-2
          backdrop-blur-md bg-white/3
          border border-white/10
          rounded-xl overflow-hidden
          flex flex-col
          min-h-0
          px-2 sm:px-4
          py-1 sm:py-2
        "
      >
        {/* HEADER */}
        <div
          className="
            px-2 sm:px-4
            py-1 sm:py-2
            border-b border-white/10
            flex items-center gap-3
            shrink-0
          "
        >
          <span className="w-1 h-4 rounded-full bg-cyan-300" />

          <Text
            variant="subheading"
            className="
              text-base sm:text-lg
              font-semibold tracking-wide
            "
          >
            Search the market
          </Text>
        </div>

        {/* SCROLL AREA */}
        <div
          className="
            flex-1 overflow-y-auto
            p-2 sm:p-4
            min-h-0
          "
        >
          <StablePlayerFilter />
        </div>
      </div>
    </div>
  );
};

export default AuctionSection;