import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Field from "/public/Field.jpeg";

/*
  Fullscreen tactics board
  • Saved squad using localStorage
  • Reset button
  • No layout/design changes
  • Tiny football manager simulator for tired humans
*/

const OVERLAP_THRESHOLD = 7;
const STORAGE_KEY = "saved_tactics_squad";

const FieldView = ({ players }) => {

  /* ════════════════ LOAD SAVED SQUAD ════════════════ */

  const [placed, setPlaced] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [drag, setDrag] = useState(null);

  const dragRef = useRef(null);
  const pitchRef = useRef(null);
  const scrollerRef = useRef(null);

  const longPressTimer = useRef(null);
  const benchPointerStart = useRef(null);

  const LONG_PRESS_MS = 350;

  /* ════════════════ SAVE SQUAD ════════════════ */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(placed)
    );
  }, [placed]);

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

  const toPitchPercent = (clientX, clientY) => {
    const rect = pitchRef.current?.getBoundingClientRect();

    if (!rect) return null;

    const x = Math.min(
      Math.max(((clientX - rect.left) / rect.width) * 100, 2),
      98
    );

    const y = Math.min(
      Math.max(((clientY - rect.top) / rect.height) * 100, 2),
      98
    );

    return { x, y };
  };

  const isOverPitch = (clientX, clientY) => {
    const rect = pitchRef.current?.getBoundingClientRect();

    if (!rect) return false;

    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  const findOverlap = (coords, excludeId) => {
    for (const [id, pos] of Object.entries(placed)) {
      if (String(id) === String(excludeId)) continue;

      const dx = coords.x - pos.x;
      const dy = coords.y - pos.y;

      if (Math.sqrt(dx * dx + dy * dy) < OVERLAP_THRESHOLD) {
        return id;
      }
    }

    return null;
  };

  /* ════════════════ RESET ════════════════ */

  const resetPitch = () => {
    setPlaced({});
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ════════════════ FIELD DRAG ════════════════ */

  const onFieldPlayerPointerDown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      id,
      source: "field",
    };

    setDrag({
      id,
      source: "field",
      ghostX: e.clientX,
      ghostY: e.clientY,
    });
  };

  /* ════════════════ BENCH DRAG ════════════════ */

  const onBenchPointerDown = (e, id) => {
    const el = e.currentTarget;
    const pointerId = e.pointerId;

    const startX = e.clientX;
    const startY = e.clientY;

    clearTimeout(longPressTimer.current);

    benchPointerStart.current = {
      startX,
      startY,
      id,
    };

    longPressTimer.current = setTimeout(() => {
      try {
        el.setPointerCapture(pointerId);
      } catch {}

      dragRef.current = {
        id,
        source: "bench",
      };

      setDrag({
        id,
        source: "bench",
        ghostX: startX,
        ghostY: startY,
      });

      benchPointerStart.current = null;
    }, LONG_PRESS_MS);
  };

  const onBenchPointerMove = (e) => {
    if (!benchPointerStart.current || dragRef.current) return;

    const { startX, startY } = benchPointerStart.current;

    if (
      Math.abs(e.clientX - startX) > 6 ||
      Math.abs(e.clientY - startY) > 6
    ) {
      clearTimeout(longPressTimer.current);
      benchPointerStart.current = null;
    }
  };

  const onBenchPointerUp = () => {
    clearTimeout(longPressTimer.current);
    benchPointerStart.current = null;
  };

  /* ════════════════ GLOBAL POINTER ════════════════ */

  const onPointerMove = (e) => {
    if (!dragRef.current) return;

    e.preventDefault();

    setDrag((prev) =>
      prev
        ? {
            ...prev,
            ghostX: e.clientX,
            ghostY: e.clientY,
          }
        : null
    );
  };

  const onPointerUp = (e) => {
    benchPointerStart.current = null;

    if (!dragRef.current) return;

    const { id } = dragRef.current;

    if (isOverPitch(e.clientX, e.clientY)) {
      const coords = toPitchPercent(e.clientX, e.clientY);

      if (coords) {
        const evictId = findOverlap(coords, id);

        setPlaced((prev) => {
          const next = { ...prev };

          if (evictId) {
            delete next[evictId];
          }

          next[String(id)] = coords;

          return next;
        });
      }
    }

    dragRef.current = null;
    setDrag(null);
  };

  const removeFromField = (id) => {
    setPlaced((prev) => {
      const next = { ...prev };

      delete next[String(id)];

      return next;
    });
  };

  return (
    <div
      className="h-[500px] overflow-hidden flex justify-between flex-col bg-white/16 backdrop-blur-md select-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        touchAction: drag ? "none" : "auto",
      }}
    >
      {/* ════════════════ MAIN LAYOUT ════════════════ */}

      <div className="flex overflow-hidden">

        {/* ════════════════ PITCH ════════════════ */}

        <div className="flex-1 min-h-0">
          <div
            ref={pitchRef}
            className="relative w-full h-full overflow-hidden border border-white/15 shadow-2xl"
            style={{
              backgroundImage: `url(${Field})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* overlay */}

            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

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

              <circle
                cx="50"
                cy="75"
                r="1"
                fill="rgba(255,255,255,0.3)"
              />

              <rect
                x="22"
                y="111"
                width="56"
                height="36"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.6"
              />

              <rect
                x="35"
                y="129"
                width="30"
                height="18"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.6"
              />

              <rect
                x="40"
                y="145"
                width="20"
                height="4"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.8"
              />
            </svg>

            {/* LABELS */}

            <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[9px] text-white/25 uppercase tracking-widest">
                Opponent
              </span>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-[9px] text-white/25 uppercase tracking-widest">
                Your Goal
              </span>
            </div>

            {/* DRAG HINT */}

            {drag && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className="text-white/30 text-[10px] uppercase tracking-widest">
                  Release to place
                </span>
              </div>
            )}

            {/* PLAYERS */}

            {Object.entries(placed).map(([id, coords]) => {
              const player = getPlayer(id);

              if (!player) return null;

              const isBeingDragged =
                String(drag?.id) === String(id);

              return (
                <div
                  key={id}
                  onPointerDown={(e) =>
                    onFieldPlayerPointerDown(e, id)
                  }
                  onDoubleClick={() =>
                    removeFromField(id)
                  }
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 touch-none"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    opacity: isBeingDragged ? 0.2 : 1,
                    cursor: "grab",
                  }}
                >
                  <PlayerPin player={player} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════════════ BENCH ════════════════ */}

        <div className="w-[65px] flex flex-col min-h-0">

          <div className="flex items-center gap-2 my-2 px-1 shrink-0">
            <span className="w-1.5 h-4 rounded-full bg-white/25 inline-block" />

            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Bench
            </span>
          </div>

          {/* RESET BUTTON */}

          <button
            onClick={resetPitch}
            className="mx-1 mb-2 text-[9px] uppercase tracking-widest text-white/60 border border-white/10 rounded-md py-1 bg-white/5 active:scale-95 transition shrink-0"
          >
            Reset
          </button>

          {/* SCROLLABLE LIST */}

          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1"
            style={{
              touchAction: drag ? "none" : "pan-y",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {benchPlayers.map((player) => {
              const id = String(
                player.id ?? player.playerId
              );

              const isBeingDragged =
                String(drag?.id) === id;

              return (
                <div
                  key={id}
                  onPointerDown={(e) =>
                    onBenchPointerDown(e, id)
                  }
                  onPointerMove={onBenchPointerMove}
                  onPointerUp={onBenchPointerUp}
                  onPointerCancel={onBenchPointerUp}
                  className="flex flex-col items-center gap-1 shrink-0"
                  style={{
                    opacity: isBeingDragged ? 0.3 : 1,
                    cursor: "grab",
                    touchAction: "pan-y",
                  }}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-blue-900/60 shadow">
                    <img
                      src={`/player_photos/${
                        player.ID ?? player.playerId
                      }.png`}
                      alt={player.Name}
                      className="w-full h-full object-cover object-top"
                      draggable={false}
                    />
                  </div>

                  <div className="flex flex-col items-center">
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
              );
            })}

            <div className="h-2 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════ PLAYER PIN ════════════════ */

const PlayerPin = ({ player, ghost = false }) => (
  <div
    className="flex flex-col items-center gap-0.5"
    style={{
      opacity: ghost ? 0.9 : 1,
    }}
  >
    <div
      className="w-9 h-9 rounded-full overflow-hidden shadow-lg bg-blue-900 border-2"
      style={{
        borderColor: ghost
          ? "rgba(65,216,255,0.9)"
          : "rgba(255,255,255,0.65)",
      }}
    >
      <img
        src={`/player_photos/${player.ID ?? player.playerId}.png`}
        alt={player.Name}
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