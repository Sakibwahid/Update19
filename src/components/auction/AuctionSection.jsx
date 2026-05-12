import React, { memo } from "react";
import useCurrentPlayer from "../../hooks/useCurrentPlayer";
import PlayerFilter from "../player/PlayerFilter";
import { Text } from "../ui/Text";
import PlayerCardDemo from "../player/PlayerCardDemo";

/* ─────────────────────────────────────────
   CurrentAuctionPanel
   Isolated component — only this re-renders
   when onSnapshot fires. PlayerFilter is
   completely unaffected.
───────────────────────────────────────── */
const CurrentAuctionPanel = () => {
  const { currentPlayer, loading } = useCurrentPlayer();
  const isSold = currentPlayer?.status === "sold";

  return (
    <div
      className="
        lg:col-span-1 h-full sticky top-0 py-2
        flex flex-col backdrop-blur-md bg-white/3
        border border-white/10 rounded-xl overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-cyan-300" />
          <Text variant="subheading" className="text-lg sm:text-xl font-semibold tracking-wide">
            Current Auction
          </Text>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-2 py-2 sm:p-2 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-cyan-300 animate-spin" />
            <p className="text-sm text-white/40 tracking-wide">Loading player...</p>
          </div>

        ) : currentPlayer ? (
          <div className="w-full flex flex-col gap-4">
            <PlayerCardDemo player={currentPlayer} />

            {isSold ? (
              <div className="rounded-md border border-white/10 bg-white/3 px-2 py-1 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white">Last Sold Price</span>
                <span className="text-xl font-bold text-cyan-300">${currentPlayer.soldPrice}</span>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 bg-white/3 px-2 py-1 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white">Auction status</span>
                <span className="text-xl font-bold text-white/60">UNSOLD</span>
              </div>
            )}
          </div>

        ) : (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full border border-dashed border-white/10 flex items-center justify-center">
              <span className="text-white/20 text-2xl">⚽</span>
            </div>
            <div>
              <p className="text-sm text-white/50 font-medium">No player in auction</p>
              <p className="text-xs text-white/25 mt-1">Waiting for admin selection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   StablePlayerFilter
   memo() means React skips re-rendering
   this entirely when the parent re-renders.
   It mounts once and stays mounted.
───────────────────────────────────────── */
const StablePlayerFilter = memo(() => <PlayerFilter />);
StablePlayerFilter.displayName = "StablePlayerFilter";

/* ─────────────────────────────────────────
   AuctionSection — layout only
   Owns no state. Never re-renders itself
   due to auction changes.
───────────────────────────────────────── */
const AuctionSection = () => {
  return (
    <div className="h-screen overflow-hidden text-white grid grid-cols-1 lg:grid-cols-3 gap-3 p-3">

      {/* LEFT — re-renders on auction changes */}
      <CurrentAuctionPanel />

      {/* RIGHT — mounts once, immune to auction changes */}
      <div
        className="
          lg:col-span-2 backdrop-blur-md bg-white/3
          border border-white/10 rounded-xl overflow-hidden
          flex flex-col h-full min-h-0
        "
      >
        <div className="px-3 py-2 border-b border-white/10 flex items-center gap-3 shrink-0">
          <span className="w-1.5 h-5 rounded-full bg-cyan-300" />
          <Text variant="subheading" className="text-lg sm:text-xl font-semibold tracking-wide">
            Search the market
          </Text>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto p-4 h-0">
          <StablePlayerFilter />
        </div>
      </div>

    </div>
  );
};

export default AuctionSection;