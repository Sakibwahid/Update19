import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  limit,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import PlayerCardDemo from "../player/PlayerCardDemo";

const POSITIONS = [
  "GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "CF", "ST",
];

const TEAMS = [
  { id: "wolves01", name: "Wolves", color: "#FDB913" },
  { id: "bayern05", name: "Bayern Munich", color: "#DC052D" },
  { id: "city04", name: "Manchester City", color: "#6CABDD" },
  { id: "united03", name: "Manchester United", color: "#DA291C" },
  { id: "liverpool01", name: "Liverpool", color: "#C8102E" },
];

const STORAGE_KEY = "auction_state_v3";
const MIN_RATING = 82;
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const AdminAuctionControl = () => {
  const navigate = useNavigate();

  const [availablePlayers, setAvailablePlayers] = useState({});
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [prices, setPrices] = useState({});
  const [seasonId, setSeasonId] = useState("S3");
  const [soldFlash, setSoldFlash] = useState(null);

  // Keep ref to unsubscribe the live listener on unmount
  const unsubRef = useRef(null);

  /* ─────────────────────────────────────────
     LIVE LISTENER — currentPlayer/active
     Replaces getDoc — updates all screens
     instantly whenever any client writes to it
  ───────────────────────────────────────── */
  useEffect(() => {
    const ref = doc(db, "currentPlayer", "active");
    unsubRef.current = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setCurrentPlayer(snap.data());
        else setCurrentPlayer(null);
      },
      (err) => console.error("currentPlayer listener error:", err),
    );
    return () => unsubRef.current?.();
  }, []);

  /* ─────────────────────────────────────────
     FETCH ALL PLAYERS (once, with cache)
  ───────────────────────────────────────── */
  const fetchAllPlayers = async () => {
    try {
      // limit(318) correctly applied as a query modifier
      const q = query(collection(db, "players"), limit(318));
      const snapshot = await getDocs(q);
      const grouped = {};

      snapshot.docs.forEach((d) => {
        const player = d.data();
        const rating = Number(player.Overall ?? player.Rating ?? 0);
        if (rating < MIN_RATING) return;
        if (!grouped[player.Position]) grouped[player.Position] = [];
        grouped[player.Position].push(player);
      });

      setAvailablePlayers(grouped);
      return grouped;
    } catch (err) {
      console.error("Fetch players error:", err);
    }
  };

  /* ─────────────────────────────────────────
     RESTORE FROM CACHE OR FETCH FRESH
  ───────────────────────────────────────── */
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const ageMs = Date.now() - (parsed.savedAt ?? 0);

        if (ageMs > CACHE_MAX_AGE_MS) {
          // Cache expired — fetch fresh
          localStorage.removeItem(STORAGE_KEY);
          fetchAllPlayers();
        } else {
          // Cache valid — restore
          if (parsed.availablePlayers) setAvailablePlayers(parsed.availablePlayers);
          if (parsed.selectedPosition) setSelectedPosition(parsed.selectedPosition);
        }
      } else {
        fetchAllPlayers();
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      fetchAllPlayers();
    }
  }, []);

  /* ─────────────────────────────────────────
     PERSIST TO CACHE (with timestamp)
  ───────────────────────────────────────── */
  useEffect(() => {
    if (!Object.keys(availablePlayers).length) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        availablePlayers,
        selectedPosition,
        savedAt: Date.now(),
      }),
    );
  }, [availablePlayers, selectedPosition]);

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  const getPlayersForPosition = (position) => {
    if (position === "LW")
      return [...(availablePlayers["LW"] || []), ...(availablePlayers["LM"] || [])];
    if (position === "RW")
      return [...(availablePlayers["RW"] || []), ...(availablePlayers["RM"] || [])];
    return availablePlayers[position] || [];
  };

  const chooseRandomPosition = () => {
    const availablePositions = POSITIONS.filter(
      (position) => getPlayersForPosition(position).length > 0,
    );
    if (!availablePositions.length) {
      setSelectedPosition(null);
      return;
    }
    const index = Math.floor(Math.random() * availablePositions.length);
    setSelectedPosition(availablePositions[index]);
  };

  const chooseRandomPlayer = async () => {
    if (!selectedPosition) return;
    const players = getPlayersForPosition(selectedPosition);
    if (!players.length) return;
    setLoading(true);
    try {
      const randomIndex = Math.floor(Math.random() * players.length);
      const randomPlayer = players[randomIndex];

      const positionGroup = [...(availablePlayers[randomPlayer.Position] || [])];
      const idx = positionGroup.findIndex((p) => p.ID === randomPlayer.ID);
      if (idx > -1) positionGroup.splice(idx, 1);

      setAvailablePlayers((prev) => ({
        ...prev,
        [randomPlayer.Position]: positionGroup,
      }));

      await setDoc(
        doc(db, "currentPlayer", "active"),
        { ...randomPlayer, updatedAt: serverTimestamp() },
        { merge: true },
      );
      // No need to setCurrentPlayer here — onSnapshot picks it up automatically
    } catch (err) {
      console.error("Choose player error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (teamId, value) => {
    setPrices((prev) => ({ ...prev, [teamId]: value }));
  };

  const handleSell = () => {
    if (!currentPlayer || !selectedTeam || !prices[selectedTeam]) return;

    const playerId = currentPlayer.ID;
    const price = Number(prices[selectedTeam]);
    const teamId = selectedTeam;

    setSoldFlash(teamId);
    setTimeout(() => setSoldFlash(null), 1200);
    setSelectedTeam(null);
    setPrices({});

    // All three writes fire in parallel, none awaited
    updateDoc(doc(db, "players", playerId), {
      currentTeamId: teamId,
      currentSeasonId: seasonId,
      soldPrice: price,
      updatedAt: serverTimestamp(),
    }).catch(console.error);

    setDoc(
      doc(db, "season_players", `${seasonId}_${playerId}`),
      { playerId, teamId, seasonId, soldPrice: price },
      { merge: true },
    ).catch(console.error);

    setDoc(
      doc(db, "currentPlayer", "active"),
      {
        ...currentPlayer,
        soldPrice: price,
        soldTo: teamId,
        status: "sold",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch(console.error);
  };

  const handleResetAuction = async () => {
    const confirmReset = window.confirm("Reset auction state and local storage?");
    if (!confirmReset) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      setAvailablePlayers({});
      setSelectedPosition(null);
      setSelectedTeam(null);
      setPrices({});
      setSoldFlash(null);
      await setDoc(doc(db, "currentPlayer", "active"), {}, { merge: false });
      await fetchAllPlayers();
      alert("Auction reset complete.");
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const canSell = !!(selectedTeam && prices[selectedTeam] && currentPlayer);

  return (
    <div className="min-h-screen overflow-x-hidden text-white flex flex-col px-3 sm:px-4 py-3 sm:py-4 box-border">

      {/* HEADER */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-3 mb-3 flex items-center justify-between shrink-0 gap-3">
        <Text variant="subheading" className="text-lg sm:text-2xl font-semibold tracking-wide truncate">
          Auction Panel
        </Text>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-xs text-white/40 uppercase tracking-widest">Season</span>
          <input
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="w-14 sm:w-16 text-center text-sm font-semibold bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            onClick={handleResetAuction}
            className="px-3 py-1.5 rounded-lg text-xs uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 min-h-0 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* ── COLUMN 1 ── */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="w-1.5 h-5 rounded-full bg-white/30 inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white">Currently on Auction</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0 mb-4">
            <Button
              onClick={chooseRandomPosition}
              disabled={POSITIONS.every((p) => getPlayersForPosition(p).length === 0)}
              className="flex-1 text-sm"
            >
              Random Position
            </Button>
            <Button
              onClick={chooseRandomPlayer}
              disabled={loading || !selectedPosition || getPlayersForPosition(selectedPosition).length === 0}
              className="flex-1 text-sm"
            >
              Random Player
            </Button>
          </div>

          <div className="w-full flex flex-col items-start gap-2">
            <div className="w-full flex justify-center shrink-0">
              {selectedPosition ? (
                <div className="w-full inline-flex justify-between items-center rounded-xl px-4 sm:px-5 py-2 gap-3">
                  <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest leading-tight">
                    Auctioning<br />Position
                  </span>
                  <Text variant="heading" className="text-3xl sm:text-4xl font-semibold tracking-tight shrink-0">
                    {selectedPosition}
                  </Text>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-dashed border-white/10 rounded-xl px-5 py-2">
                  <span className="text-xs text-white/20 uppercase tracking-widest">No position selected</span>
                </div>
              )}
            </div>

            <div className="w-full flex justify-center shrink-0 mb-2">
              {currentPlayer ? (
                <div className="w-full max-w-full">
                  <PlayerCardDemo player={currentPlayer} />
                </div>
              ) : (
                <div className="w-full flex items-center justify-center h-36 rounded-xl border border-dashed border-white/10">
                  <p className="text-white/30 text-sm">No player selected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/10 shrink-0" />
        <div className="block lg:hidden h-px bg-white/10 shrink-0" />

        {/* ── COLUMN 2 ── */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="w-1.5 h-5 rounded-full bg-white/30 inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white">Player Assign</span>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-h-0">
            {TEAMS.map((team) => {
              const isSelected = selectedTeam === team.id;
              const justSold = soldFlash === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(isSelected ? null : team.id)}
                  className={`
                    w-full flex items-center gap-3
                    px-3 sm:px-4 py-3
                    rounded-xl border
                    transition-all duration-200 text-left min-w-0
                    ${justSold
                      ? "bg-white/20 border-white/40"
                      : isSelected
                        ? "bg-white/20 border-[#41ffee]"
                        : "bg-white/5 border-white/8 hover:bg-white/10"
                    }
                  `}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/10"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="flex-1 text-sm font-medium truncate">{team.name}</span>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 shrink-0"
                  >
                    <span className="text-white/30 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={prices[team.id] || ""}
                      onChange={(e) => handlePriceChange(team.id, e.target.value)}
                      className="w-12 sm:w-16 bg-transparent text-sm text-right text-white placeholder-white/20 focus:outline-none"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSell}
            disabled={!canSell}
            className={`
              shrink-0 mt-4 w-full py-3 rounded-xl
              text-sm font-semibold uppercase tracking-widest
              transition-all duration-200
              ${!canSell
                ? "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed"
                : "bg-white/10 border border-white/25 text-white hover:bg-white/15 hover:border-white/40 active:scale-[0.98]"
              }
            `}
          >
            Confirm Sale
          </button>
        </div>

        <div className="hidden lg:block w-px bg-white/10 shrink-0" />
        <div className="block lg:hidden h-px bg-white/10 shrink-0" />

        {/* ── COLUMN 3 ── */}
        <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <span className="w-1.5 h-5 rounded-full bg-white/30 inline-block" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white">More Features</span>
          </div>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full border border-dashed border-white/15 flex items-center justify-center">
                <span className="text-white/20 text-lg">+</span>
              </div>
              <span className="block text-xs text-white/20 uppercase tracking-widest">Coming soon</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAuctionControl;