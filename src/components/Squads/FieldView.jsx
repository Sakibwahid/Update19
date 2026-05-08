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
  /* ════════════════ STATE ════════════════ */

  const [placed, setPlaced] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [drag, setDrag] = useState(null);
  const [dragLock, setDragLock] = useState(false);

  const dragRef = useRef(null);
  const pitchRef = useRef(null);

  const longPressTimer = useRef(null);
  const benchPointerStart = useRef(null);
  const dragModeRef = useRef(false);

  const LONG_PRESS_MS = 280;

  /* ════════════════ GLOBAL SAFETY (BLOCK IMAGE MENU) ════════════════ */

  useEffect(() => {
    const blockMenu = (e) => e.preventDefault();

    document.addEventListener("contextmenu", blockMenu);

    return () => {
      document.removeEventListener("contextmenu", blockMenu);
    };
  }, []);

  /* ════════════════ SAVE SQUAD ════════════════ */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(placed));
  }, [placed]);

  /* ════════════════ HELPERS ════════════════ */

  const placedIds = useMemo(() => new Set(Object.keys(placed)), [placed]);

  const benchPlayers = useMemo(
    () =>
      players.filter((p) => !placedIds.has(String(p.id ?? p.playerId))),
    [players, placedIds]
  );

  const getPlayer = useCallback(
    (id) =>
      players.find((p) => String(p.id ?? p.playerId) === String(id)),
    [players]
  );

  const toPitchPercent = (x, y) => {
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
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
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

  /* ════════════════ RESET ════════════════ */

  const resetPitch = () => {
    setPlaced({});
    localStorage.removeItem(STORAGE_KEY);
    if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
  };

  /* ════════════════ DRAG START ════════════════ */

  const startDrag = (id, source, x, y) => {
    dragRef.current = { id, source };

    setDrag({
      id,
      ghostX: x,
      ghostY: y,
    });

    setDragLock(true);

    if (navigator.vibrate) navigator.vibrate(30);
  };

  /* ════════════════ FIELD DRAG ════════════════ */

  const onFieldPlayerPointerDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const point = e.touches?.[0] || e;
    startDrag(id, "field", point.clientX, point.clientY);
  };

  /* ════════════════ BENCH DRAG ════════════════ */

  const onBenchPointerDown = (e, id) => {
    e.preventDefault();

    const point = e.touches?.[0] || e;

    const startX = point.clientX;
    const startY = point.clientY;

    clearTimeout(longPressTimer.current);

    benchPointerStart.current = {
      startX,
      startY,
      id,
    };

    longPressTimer.current = setTimeout(() => {
      startDrag(id, "bench", startX, startY);
      benchPointerStart.current = null;
    }, LONG_PRESS_MS);
  };

  const onBenchPointerMove = (e) => {
    if (!benchPointerStart.current || dragRef.current) return;

    const point = e.touches?.[0] || e;
    const { startX, startY } = benchPointerStart.current;

    if (
      Math.abs(point.clientX - startX) > 7 ||
      Math.abs(point.clientY - startY) > 7
    ) {
      clearTimeout(longPressTimer.current);
      benchPointerStart.current = null;
    }
  };

  const onBenchPointerUp = () => {
    clearTimeout(longPressTimer.current);
    benchPointerStart.current = null;
  };

  /* ════════════════ GLOBAL MOVE ════════════════ */

  const onPointerMove = (e) => {
    if (!dragRef.current) return;

    e.preventDefault();

    const point = e.touches?.[0] || e;

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            ghostX: point.clientX,
            ghostY: point.clientY,
          }
        : null
    );
  };

  /* ════════════════ END DRAG ════════════════ */

  const cancelDrag = () => {
    dragRef.current = null;
    benchPointerStart.current = null;
    setDrag(null);
    setDragLock(false);
  };

  const onPointerUp = (e) => {
    if (!dragRef.current) return;

    const point = e.touches?.[0] || e;
    const { id } = dragRef.current;

    if (isOverPitch(point.clientX, point.clientY)) {
      const coords = toPitchPercent(point.clientX, point.clientY);

      if (coords) {
        const evictId = findOverlap(coords, id);

        setPlaced((prev) => {
          const next = { ...prev };

          if (evictId) delete next[evictId];

          next[String(id)] = coords;

          return next;
        });
      }
    }

    cancelDrag();
  };

  /* ════════════════ REMOVE PLAYER ════════════════ */

  const removeFromField = (id) => {
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      return next;
    });

    if (navigator.vibrate) navigator.vibrate(20);
  };

  const ghostPlayer = drag ? getPlayer(drag.id) : null;

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-white/16 backdrop-blur-md select-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        touchAction: drag ? "none" : "auto",
      }}
    >
      {/* ════════════════ PITCH ════════════════ */}

      <div className="flex-1 min-h-0 p-2 pb-0">
        <div
          ref={pitchRef}
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
            <rect
              x="4"
              y="3"
              width="92"
              height="144"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.6"
            />

            <line
              x1="4"
              y1="75"
              x2="96"
              y2="75"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.6"
            />

            <circle
              cx="50"
              cy="75"
              r="13"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.6"
            />

            <circle cx="50" cy="75" r="1" fill="rgba(255,255,255,0.3)" />
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

      <div className="h-[150px] min-h-[150px] overflow-hidden px-2">
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
            pointerEvents: dragModeRef.current ? "none" : "auto",
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
                  {/* touch-safe wrapper */}

                  <div
                    className="w-full flex flex-col items-center"
                    draggable={false}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-blue-900/60 shadow">
                      <img
                        src={`/player_photos/${player.ID ?? player.playerId}.png`}
                        className="w-full h-full object-cover object-top"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.preventDefault()}
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
          className="fixed z-[9999] pointer-events-none -translate-x-1/12 -translate-y-1/12 scale-100"
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
        onTouchStart={(e) => e.preventDefault()}
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
