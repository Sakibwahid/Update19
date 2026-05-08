import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

const OVERLAP_THRESHOLD = 7;
const STORAGE_KEY = "saved_tactics_squad";

import Field from "/public/Field.jpeg";

const FieldView = ({ players, Field }) => {
  /* ═════════════ STATE ═════════════ */

  const [placed, setPlaced] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [drag, setDrag] = useState(null);

  const pitchRef = useRef(null);
  const longPressTimer = useRef(null);
  const benchStart = useRef(null);

  // IMPORTANT
  // this blocks bench scrolling while long press drag is active
  const dragModeRef = useRef(false);

  /* ═════════════ SAVE ═════════════ */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(placed));
  }, [placed]);

  /* ═════════════ GLOBAL POINTER EVENTS ═════════════ */

  useEffect(() => {
    const move = (e) => onPointerMove(e);
    const up = (e) => onPointerUp(e);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  });

  /* ═════════════ HELPERS ═════════════ */

  const placedIds = useMemo(() => new Set(Object.keys(placed)), [placed]);

  const benchPlayers = useMemo(
    () => players.filter((p) => !placedIds.has(String(p.id ?? p.playerId))),
    [players, placedIds],
  );

  const getPlayer = useCallback(
    (id) => players.find((p) => String(p.id ?? p.playerId) === String(id)),
    [players],
  );

  const toPercent = (x, y) => {
    const rect = pitchRef.current?.getBoundingClientRect();

    if (!rect) return null;

    return {
      x: Math.min(Math.max(((x - rect.left) / rect.width) * 100, 3), 97),

      y: Math.min(Math.max(((y - rect.top) / rect.height) * 100, 3), 97),
    };
  };

  const isOverPitch = (x, y) => {
    const rect = pitchRef.current?.getBoundingClientRect();

    if (!rect) return false;

    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  const findOverlap = (coords, excludeId) => {
    for (const [id, pos] of Object.entries(placed)) {
      if (String(id) === String(excludeId)) continue;

      const dx = coords.x - pos.x;
      const dy = coords.y - pos.y;

      if (dx * dx + dy * dy < OVERLAP_THRESHOLD * OVERLAP_THRESHOLD) {
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

  /* ═════════════ DRAG START ═════════════ */

  const startDrag = (id, clientX, clientY) => {
    dragModeRef.current = true;

    setDrag({
      id,
      ghostX: clientX,
      ghostY: clientY,
    });

    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  /* ═════════════ BENCH EVENTS ═════════════ */

  const onBenchPointerDown = (e, id) => {
    e.preventDefault();

    const { clientX, clientY } = e;

    benchStart.current = {
      id,
      clientX,
      clientY,
    };

    clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
      startDrag(id, clientX, clientY);

      benchStart.current = null;
    }, 280);
  };

  const onBenchPointerMove = (e) => {
    if (!benchStart.current || dragModeRef.current) return;

    const dx = Math.abs(e.clientX - benchStart.current.clientX);

    const dy = Math.abs(e.clientY - benchStart.current.clientY);

    // user scrolling bench
    if (dx > 7 || dy > 7) {
      clearTimeout(longPressTimer.current);
      benchStart.current = null;
    }
  };

  const onBenchPointerUp = () => {
    clearTimeout(longPressTimer.current);
    benchStart.current = null;
  };

  /* ═════════════ FIELD PLAYER DRAG ═════════════ */

  const onFieldPlayerPointerDown = (e, id) => {
    e.preventDefault();

    startDrag(id, e.clientX, e.clientY);
  };

  /* ═════════════ POINTER MOVE ═════════════ */

  const onPointerMove = (e) => {
    if (!dragModeRef.current) return;

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            ghostX: e.clientX,
            ghostY: e.clientY,
          }
        : null,
    );
  };

  /* ═════════════ POINTER UP ═════════════ */

  const onPointerUp = (e) => {
    if (!dragModeRef.current || !drag) return;

    const { clientX, clientY } = e;

    if (isOverPitch(clientX, clientY)) {
      const coords = toPercent(clientX, clientY);

      if (coords) {
        const overlap = findOverlap(coords, drag.id);

        setPlaced((prev) => {
          const next = { ...prev };

          if (overlap) {
            delete next[overlap];
          }

          next[String(drag.id)] = coords;

          return next;
        });
      }
    }

    dragModeRef.current = false;

    setDrag(null);

    clearTimeout(longPressTimer.current);
    benchStart.current = null;
  };

  /* ═════════════ REMOVE ═════════════ */

  const removeFromField = (id) => {
    setPlaced((prev) => {
      const next = { ...prev };

      delete next[String(id)];

      return next;
    });
  };

  const ghostPlayer = drag ? getPlayer(drag.id) : null;

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-white/16 backdrop-blur-md select-none"
      style={{
        touchAction: drag ? "none" : "auto",
      }}
    >
      {/* ════════════════ PITCH ════════════════ */}

      <div className="flex-1 min-h-0 pb-0">
        <div
          ref={pitchRef}
          className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10"
          style={{
            backgroundImage: `url(/public/Field.jpeg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
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

            <circle cx="50" cy="75" r="1" fill="rgba(255,255,255,0.35)" />

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

            <circle cx="50" cy="18" r="0.9" fill="rgba(255,255,255,0.35)" />

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

            <circle cx="50" cy="132" r="0.9" fill="rgba(255,255,255,0.35)" />

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

            const isDragging = String(drag?.id) === String(id);

            return (
              <div
                key={id}
                onPointerDown={(e) => onFieldPlayerPointerDown(e, id)}
                onDoubleClick={() => removeFromField(id)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  opacity: isDragging ? 0.2 : 1,
                }}
              >
                <PlayerPin player={player} />
              </div>
            );
          })}

          {/* drag indicator */}

          {drag && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                <span className="text-[10px] uppercase tracking-widest text-white/50">
                  Dragging Player
                </span>
              </div>
            </div>
          )}
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

            // THIS FIXES THE SCROLL ISSUE
            overflowY: dragModeRef.current ? "hidden" : "auto",

            touchAction: dragModeRef.current ? "none" : "pan-y",
          }}
        >
          <div className="grid grid-cols-4 gap-1 pb-8">
            {benchPlayers.map((player) => {
              const id = String(player.id ?? player.playerId);

              const isDragging = String(drag?.id) === id;

              return (
                <div
                  key={id}
                  onPointerDown={(e) => onBenchPointerDown(e, id)}
                  onPointerMove={onBenchPointerMove}
                  onPointerUp={onBenchPointerUp}
                  onPointerCancel={onBenchPointerUp}
                  className="flex flex-col items-center gap-1"
                  style={{
                    opacity: isDragging ? 0.25 : 1,
                    touchAction: "pan-y",
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }}
                >
                  <div
                    className="w-full flex flex-col items-center"
                    draggable={false}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-blue-900/60 shadow">
                      <img
                        src={`/player_photos/${
                          player.ID ?? player.playerId
                        }.png`}
                        className="w-full h-full object-cover object-top"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          WebkitTouchCallout: "none",
                          WebkitUserSelect: "none",
                          userSelect: "none",
                        }}
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

      {/* ════════════════ DRAG GHOST ════════════════ */}

      {drag && ghostPlayer && (
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: drag.ghostX,
            top: drag.ghostY,
          }}
        >
          <PlayerPin player={ghostPlayer} ghost />
        </div>
      )}
    </div>
  );
};

/* ════════════════ PLAYER PIN ════════════════ */

const PlayerPin = ({ player, ghost = false }) => (
  <div
    className="flex flex-col items-center gap-0.5"
    style={{
      opacity: ghost ? 0.95 : 1,
    }}
  >
    <div
      className="w-9 h-9 rounded-full overflow-hidden shadow-lg bg-blue-900 border-2"
      style={{
        borderColor: ghost ? "rgba(65,216,255,0.95)" : "rgba(255,255,255,0.65)",
      }}
    >
      <img
        src={`/player_photos/${player.ID ?? player.playerId}.png`}
        className="w-full h-full object-cover object-top"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
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
