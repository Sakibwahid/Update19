import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import Field from "/public/Field.jpeg";

const OVERLAP_THRESHOLD = 7;
const STORAGE_KEY = "saved_tactics_squad";

const FieldView = ({ players }) => {
  /* ═════════════ STATE ═════════════ */

  const [placed, setPlaced] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const pitchRef = useRef(null);

  const lastTapRef = useRef({});

  /* ═════════════ SAVE ═════════════ */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(placed));
  }, [placed]);

  /* ═════════════ HELPERS ═════════════ */

  const placedIds = useMemo(
    () => new Set(Object.keys(placed)),
    [placed]
  );

  const benchPlayers = useMemo(
    () =>
      players.filter(
        (p) => !placedIds.has(String(p.id ?? p.playerId))
      ),
    [players, placedIds]
  );

  const getPlayer = useCallback(
    (id) =>
      players.find(
        (p) => String(p.id ?? p.playerId) === String(id)
      ),
    [players]
  );

  const toPercent = (x, y) => {
    const rect = pitchRef.current?.getBoundingClientRect();

    if (!rect) return null;

    return {
      x: Math.min(
        Math.max(((x - rect.left) / rect.width) * 100, 3),
        97
      ),

      y: Math.min(
        Math.max(((y - rect.top) / rect.height) * 100, 3),
        97
      ),
    };
  };

  const findOverlap = (coords, excludeId) => {
    for (const [id, pos] of Object.entries(placed)) {
      if (String(id) === String(excludeId)) continue;

      const dx = coords.x - pos.x;
      const dy = coords.y - pos.y;

      if (
        dx * dx + dy * dy <
        OVERLAP_THRESHOLD * OVERLAP_THRESHOLD
      ) {
        return id;
      }
    }

    return null;
  };

  /* ═════════════ RESET ═════════════ */

  const resetPitch = () => {
    setPlaced({});
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ═════════════ PLACE PLAYER ═════════════ */

  const placePlayer = (clientX, clientY) => {
    if (!selectedPlayer) return;

    const coords = toPercent(clientX, clientY);

    if (!coords) return;

    const overlap = findOverlap(
      coords,
      selectedPlayer
    );

    setPlaced((prev) => {
      const next = { ...prev };

      if (overlap) {
        delete next[overlap];
      }

      next[String(selectedPlayer)] = coords;

      return next;
    });

    setSelectedPlayer(null);

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  /* ═════════════ REMOVE PLAYER ═════════════ */

  const removeFromField = (id) => {
    setPlaced((prev) => {
      const next = { ...prev };

      delete next[String(id)];

      return next;
    });
  };

  /* ═════════════ DOUBLE TAP REMOVE ═════════════ */

  const handleFieldPlayerTap = (id) => {
    const now = Date.now();

    const lastTap = lastTapRef.current[id] || 0;

    if (now - lastTap < 300) {
      removeFromField(id);
    }

    lastTapRef.current[id] = now;
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white/16 backdrop-blur-md select-none">
      {/* ════════════════ PITCH ════════════════ */}

      <div className="flex-1 min-h-0 pb-0">
        <div
          ref={pitchRef}
          onPointerDown={(e) =>
            placePlayer(e.clientX, e.clientY)
          }
          className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10"
          style={{
            backgroundImage: `url(${Field})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* overlay */}

          <div className="absolute inset-0 bg-black/20" />

          {/* FIELD SVG */}

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 150"
            preserveAspectRatio="none"
          >
            {/* OUTER LINE */}

            <rect
              x="4"
              y="3"
              width="92"
              height="144"
              fill="none"
              stroke="rgba(255,255,255,0.30)"
              strokeWidth="0.7"
            />

            {/* HALF LINE */}

            <line
              x1="4"
              y1="75"
              x2="96"
              y2="75"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.7"
            />

            {/* CENTER CIRCLE */}

            <circle
              cx="50"
              cy="75"
              r="13"
              fill="none"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="0.7"
            />

            <circle
              cx="50"
              cy="75"
              r="1"
              fill="rgba(255,255,255,0.35)"
            />

            {/* TOP PENALTY BOX */}

            <rect
              x="22"
              y="3"
              width="56"
              height="22"
              fill="none"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="0.7"
            />

            {/* TOP GOAL BOX */}

            <rect
              x="35"
              y="3"
              width="30"
              height="10"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.7"
            />

            {/* TOP PENALTY SPOT */}

            <circle
              cx="50"
              cy="18"
              r="0.9"
              fill="rgba(255,255,255,0.35)"
            />

            {/* TOP ARC */}

            <path
              d="M 39 25 A 11 11 0 0 0 61 25"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.7"
            />

            {/* BOTTOM PENALTY BOX */}

            <rect
              x="22"
              y="125"
              width="56"
              height="22"
              fill="none"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="0.7"
            />

            {/* BOTTOM GOAL BOX */}

            <rect
              x="35"
              y="137"
              width="30"
              height="10"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.7"
            />

            {/* BOTTOM PENALTY SPOT */}

            <circle
              cx="50"
              cy="132"
              r="0.9"
              fill="rgba(255,255,255,0.35)"
            />

            {/* BOTTOM ARC */}

            <path
              d="M 39 125 A 11 11 0 0 1 61 125"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.7"
            />

            {/* TOP GOAL */}

            <rect
              x="42"
              y="0.5"
              width="16"
              height="2.5"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />

            {/* BOTTOM GOAL */}

            <rect
              x="42"
              y="147"
              width="16"
              height="2.5"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />

            {/* CORNER ARCS */}

            <path
              d="M4 10 A6 6 0 0 1 10 4"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />

            <path
              d="M90 4 A6 6 0 0 1 96 10"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />

            <path
              d="M4 140 A6 6 0 0 0 10 146"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />

            <path
              d="M90 146 A6 6 0 0 0 96 140"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.5"
            />
          </svg>

          {/* labels */}

          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            <span className="text-[9px] text-white/25 uppercase tracking-widest">
              Opponent
            </span>
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-[9px] text-white/25 uppercase tracking-widest">
              Your Goal
            </span>
          </div>

          {/* placed players */}

          {Object.entries(placed).map(([id, coords]) => {
            const player = getPlayer(id);

            if (!player) return null;

            return (
              <div
                key={id}
                onPointerDown={(e) => {
                  e.stopPropagation();

                  handleFieldPlayerTap(id);
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                }}
              >
                <PlayerPin player={player} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════ BENCH ════════════════ */}

      <div className="max-h-[140px] overflow-hidden px-2">
        {/* top bar */}

        <div className="flex items-center justify-between py-2">
          <span className="text-[11px] uppercase tracking-widest text-white/50 font-semibold">
            Bench
          </span>

          <button
            onClick={resetPitch}
            className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/60 active:scale-95"
          >
            Reset
          </button>
        </div>

        {/* scrollable grid */}

        <div
          className="h-full overflow-y-auto"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="grid grid-cols-4 gap-1 pb-8">
            {benchPlayers.map((player) => {
              const id = String(
                player.id ?? player.playerId
              );

              const isSelected =
                String(selectedPlayer) === id;

              return (
                <div
                  key={id}
                  onPointerDown={() =>
                    setSelectedPlayer(id)
                  }
                  className="flex flex-col items-center gap-1"
                  style={{
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }}
                >
                  <div className="w-full flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-xl overflow-hidden border bg-blue-900/60 shadow transition-all duration-150 ${
                        isSelected
                          ? "border-cyan-400 ring-2 ring-cyan-400/70 scale-105"
                          : "border-white/10"
                      }`}
                    >
                      <img
                        src={`/player_photos/${
                          player.ID ??
                          player.playerId
                        }.png`}
                        className="w-full h-full object-cover object-top"
                        draggable={false}
                        onDragStart={(e) =>
                          e.preventDefault()
                        }
                        onContextMenu={(e) =>
                          e.preventDefault()
                        }
                      />
                    </div>

                    <div className="flex flex-col items-center mt-1">
                      <span className="text-white text-[10px] font-semibold leading-tight max-w-[80px] truncate text-center">
                        {player.Name?.split(" ").pop()}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="text-white/40 text-[9px] uppercase">
                          {player.Position}
                        </span>

                        <span className="text-[#41d8ff] text-[10px] font-bold">
                          {player.Overall}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════ PLAYER PIN ════════════════ */

const PlayerPin = ({ player }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="w-9 h-9 rounded-full overflow-hidden shadow-lg bg-blue-900 border-2 border-white/65">
      <img
        src={`/player_photos/${
          player.ID ?? player.playerId
        }.png`}
        className="w-full h-full object-cover object-top"
        draggable={false}
      />
    </div>

    <div className="bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1 max-w-[72px]">
      <span className="text-white text-[10px] font-semibold truncate leading-none">
        {player.Name?.split(" ").pop()}
      </span>

      <span className="text-[#41d8ff] text-[10px] font-bold leading-none shrink-0">
        {player.Overall}
      </span>
    </div>
  </div>
);

export default FieldView;
