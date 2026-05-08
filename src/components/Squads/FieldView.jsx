import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import Field from "/public/Field.jpeg";

/*
  MOBILE TACTICS BOARD
  • Bottom bench
  • 3 players per row
  • Vertical scroll only inside bench
  • No page scrolling
  • Long press drag
  • Ghost preview
  • Vibration feedback
  • Prevents browser image save popup
  • Modern mobile UX instead of browser caveman behavior
*/

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

  const dragRef = useRef(null);
  const pitchRef = useRef(null);

  const longPressTimer = useRef(null);
  const benchPointerStart = useRef(null);

  const LONG_PRESS_MS = 280;

  /* ════════════════ SAVE SQUAD ════════════════ */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(placed)
    );
  }, [placed]);

  /* ════════════════ HELPERS ════════════════ */

  const placedIds = useMemo(
    () => new Set(Object.keys(placed)),
    [placed]
  );

  const benchPlayers = useMemo(
    () =>
      players.filter(
        (p) =>
          !placedIds.has(
            String(p.id ?? p.playerId)
          )
      ),
    [players, placedIds]
  );

  const getPlayer = useCallback(
    (id) =>
      players.find(
        (p) =>
          String(p.id ?? p.playerId) ===
          String(id)
      ),
    [players]
  );

  const toPitchPercent = (clientX, clientY) => {
    const rect =
      pitchRef.current?.getBoundingClientRect();

    if (!rect) return null;

    const x = Math.min(
      Math.max(
        ((clientX - rect.left) / rect.width) * 100,
        3
      ),
      97
    );

    const y = Math.min(
      Math.max(
        ((clientY - rect.top) / rect.height) * 100,
        3
      ),
      97
    );

    return { x, y };
  };

  const isOverPitch = (clientX, clientY) => {
    const rect =
      pitchRef.current?.getBoundingClientRect();

    if (!rect) return false;

    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  };

  const findOverlap = (coords, excludeId) => {
    for (const [id, pos] of Object.entries(
      placed
    )) {
      if (
        String(id) === String(excludeId)
      )
        continue;

      const dx = coords.x - pos.x;
      const dy = coords.y - pos.y;

      if (
        Math.sqrt(dx * dx + dy * dy) <
        OVERLAP_THRESHOLD
      ) {
        return id;
      }
    }

    return null;
  };

  /* ════════════════ RESET ════════════════ */

  const resetPitch = () => {
    setPlaced({});
    localStorage.removeItem(STORAGE_KEY);

    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }
  };

  /* ════════════════ FIELD DRAG ════════════════ */

  const onFieldPlayerPointerDown = (
    e,
    id
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      id,
      source: "field",
    };

    setDrag({
      id,
      ghostX: e.clientX,
      ghostY: e.clientY,
    });

    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  /* ════════════════ BENCH DRAG ════════════════ */

  const onBenchPointerDown = (e, id) => {

    // PREVENT IMAGE SAVE / CALL OUT
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    clearTimeout(longPressTimer.current);

    benchPointerStart.current = {
      startX,
      startY,
      id,
    };

    longPressTimer.current = setTimeout(() => {

      dragRef.current = {
        id,
        source: "bench",
      };

      setDrag({
        id,
        ghostX: startX,
        ghostY: startY,
      });

      // vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }

      benchPointerStart.current = null;

    }, LONG_PRESS_MS);
  };

  const onBenchPointerMove = (e) => {

    if (
      !benchPointerStart.current ||
      dragRef.current
    )
      return;

    const { startX, startY } =
      benchPointerStart.current;

    // scrolling intent
    if (
      Math.abs(e.clientX - startX) > 7 ||
      Math.abs(e.clientY - startY) > 7
    ) {
      clearTimeout(longPressTimer.current);
      benchPointerStart.current = null;
    }
  };

  const onBenchPointerUp = () => {
    clearTimeout(longPressTimer.current);
    benchPointerStart.current = null;
  };

  /* ════════════════ GLOBAL DRAG ════════════════ */

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

    if (
      isOverPitch(e.clientX, e.clientY)
    ) {

      const coords = toPitchPercent(
        e.clientX,
        e.clientY
      );

      if (coords) {

        const evictId = findOverlap(
          coords,
          id
        );

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

  /* ════════════════ REMOVE PLAYER ════════════════ */

  const removeFromField = (id) => {

    setPlaced((prev) => {

      const next = { ...prev };

      delete next[String(id)];

      return next;
    });

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const ghostPlayer = drag
    ? getPlayer(drag.id)
    : null;

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-white/16 backdrop-blur-md select-none"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        touchAction: drag
          ? "none"
          : "auto",
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

            <circle
              cx="50"
              cy="75"
              r="1"
              fill="rgba(255,255,255,0.3)"
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

          {Object.entries(placed).map(
            ([id, coords]) => {

              const player =
                getPlayer(id);

              if (!player) return null;

              const isDragging =
                String(drag?.id) ===
                String(id);

              return (
                <div
                  key={id}
                  onPointerDown={(e) =>
                    onFieldPlayerPointerDown(
                      e,
                      id
                    )
                  }
                  onDoubleClick={() =>
                    removeFromField(id)
                  }
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    opacity: isDragging
                      ? 0.2
                      : 1,
                  }}
                >
                  <PlayerPin
                    player={player}
                  />
                </div>
              );
            }
          )}

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
            WebkitOverflowScrolling:
              "touch",
            overscrollBehavior:
              "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >

          <div className="grid grid-cols-4 gap-1 pb-8">

            {benchPlayers.map((player) => {

              const id = String(
                player.id ??
                  player.playerId
              );

              const isDragging =
                String(drag?.id) === id;

              return (
                <div
                  key={id}
                  onPointerDown={(e) =>
                    onBenchPointerDown(
                      e,
                      id
                    )
                  }
                  onPointerMove={
                    onBenchPointerMove
                  }
                  onPointerUp={
                    onBenchPointerUp
                  }
                  onPointerCancel={
                    onBenchPointerUp
                  }
                  className="flex flex-col items-center gap-1"
                  style={{
                    opacity: isDragging
                      ? 0.25
                      : 1,
                    touchAction: "pan-y",
                    WebkitTouchCallout:
                      "none",
                    WebkitUserSelect:
                      "none",
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
                        src={`/player_photos/${
                          player.ID ??
                          player.playerId
                        }.png`}
                        alt={player.Name}
                        draggable={false}
                        onDragStart={(e) =>
                          e.preventDefault()
                        }
                        className="w-full h-full object-cover object-top pointer-events-none select-none"
                        style={{
                          WebkitUserDrag:
                            "none",
                          WebkitTouchCallout:
                            "none",
                          userSelect: "none",
                        }}
                      />

                    </div>

                    <div className="flex flex-col items-center mt-1">

                      <span className="text-white text-[10px] font-semibold leading-tight max-w-[80px] truncate text-center">
                        {player.Name
                          ?.split(" ")
                          .pop()}
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

          <PlayerPin
            player={ghostPlayer}
            ghost
          />

        </div>

      )}

    </div>
  );
};

/* ════════════════ PLAYER PIN ════════════════ */

const PlayerPin = ({
  player,
  ghost = false,
}) => (

  <div
    className="flex flex-col items-center gap-0.5"
    style={{
      opacity: ghost ? 0.95 : 1,
    }}
  >

    <div
      className="w-9 h-9 rounded-full overflow-hidden shadow-lg bg-blue-900 border-2"
      style={{
        borderColor: ghost
          ? "rgba(65,216,255,0.95)"
          : "rgba(255,255,255,0.65)",
      }}
    >

      <img
        src={`/player_photos/${
          player.ID ??
          player.playerId
        }.png`}
        alt={player.Name}
        draggable={false}
        onDragStart={(e) =>
          e.preventDefault()
        }
        className="w-full h-full object-cover object-top pointer-events-none select-none"
        style={{
          WebkitUserDrag: "none",
          WebkitTouchCallout: "none",
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