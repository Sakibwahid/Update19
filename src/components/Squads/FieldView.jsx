import React, { useEffect, useMemo, useState } from "react";
import { Text } from "../ui/Text";
import Field from "/public/Field.jpeg";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/* =========================
   POSITION COORDINATES
   X: 0-100 (left to right)
   Y: 0-100 (top to bottom)
========================= */

const POSITION_COORDINATES = {
  // Attackers (Y: 10-15)
  LW: { x: 15, y: 12 },
  ST: { x: 50, y: 10 },
  RW: { x: 85, y: 12 },
  
  // Attacking Midfielders (Y: 25-30)
  LAM: { x: 25, y: 28 },
  CAM: { x: 50, y: 25 },
  RAM: { x: 75, y: 28 },
  
  // Central Midfielders (Y: 40-45)
  LCM: { x: 30, y: 42 },
  CM: { x: 50, y: 40 },
  RCM: { x: 70, y: 42 },
  
  // Defensive Midfielders (Y: 55-58)
  LCDM: { x: 35, y: 56 },
  CDM: { x: 50, y: 55 },
  RCDM: { x: 65, y: 56 },
  
  // Wide Midfielders (Y: 48)
  LM: { x: 10, y: 48 },
  RM: { x: 90, y: 48 },
  
  // Wing-backs (Y: 62)
  LWB: { x: 12, y: 62 },
  RWB: { x: 88, y: 62 },
  
  // Defenders (Y: 75-78)
  LB: { x: 15, y: 78 },
  LCB: { x: 38, y: 75 },
  CB: { x: 50, y: 75 },
  RCB: { x: 62, y: 75 },
  RB: { x: 85, y: 78 },
  
  // Goalkeeper (Y: 90)
  GK: { x: 50, y: 90 },
  
  // Alternative positions
  CF: { x: 50, y: 20 }, // False 9
};

/* =========================
   FORMATIONS
   Maps formation slots to position keys
========================= */

const FORMATIONS = {
  "4-3-3": {
    positions: {
      LW: "LW",
      ST: "ST",
      RW: "RW",
      LCM: "LCM",
      CDM: "CDM",
      RCM: "RCM",
      LB: "LB",
      LCB: "LCB",
      RCB: "RCB",
      RB: "RB",
      GK: "GK",
    },
    roles: {
      LW: "LW", ST: "ST", RW: "RW",
      LCM: "CM", CDM: "CDM", RCM: "CM",
      LB: "LB", LCB: "CB", RCB: "CB", RB: "RB",
      GK: "GK",
    },
  },

  "4-4-2": {
    positions: {
      ST1: "LW",  // Using LW position for left striker
      ST2: "RW",  // Using RW position for right striker
      LM: "LM",
      LCM: "LCM",
      RCM: "RCM",
      RM: "RM",
      LB: "LB",
      LCB: "LCB",
      RCB: "RCB",
      RB: "RB",
      GK: "GK",
    },
    roles: {
      ST1: "ST", ST2: "ST",
      LM: "LM", LCM: "CM", RCM: "CM", RM: "RM",
      LB: "LB", LCB: "CB", RCB: "CB", RB: "RB",
      GK: "GK",
    },
  },

  "3-5-2": {
    positions: {
      ST1: "LW",  // Left striker position
      ST2: "RW",  // Right striker position
      LWB: "LWB",
      LCM: "LCM",
      CDM: "CDM",
      RCM: "RCM",
      RWB: "RWB",
      LCB: "LCB",
      CB: "CB",
      RCB: "RCB",
      GK: "GK",
    },
    roles: {
      ST1: "ST", ST2: "ST",
      LWB: "LWB", LCM: "CM", CDM: "CDM", RCM: "CM", RWB: "RWB",
      LCB: "CB", CB: "CB", RCB: "CB",
      GK: "GK",
    },
  },

  "4-2-3-1": {
    positions: {
      ST: "ST",
      LAM: "LAM",
      CAM: "CAM",
      RAM: "RAM",
      LCDM: "LCDM",
      RCDM: "RCDM",
      LB: "LB",
      LCB: "LCB",
      RCB: "RCB",
      RB: "RB",
      GK: "GK",
    },
    roles: {
      ST: "ST",
      LAM: "LW", CAM: "CAM", RAM: "RW",
      LCDM: "CDM", RCDM: "CDM",
      LB: "LB", LCB: "CB", RCB: "CB", RB: "RB",
      GK: "GK",
    },
  },

  "4-3-3 False 9": {
    positions: {
      LW: "LW",
      CF: "CF",
      RW: "RW",
      LCM: "LCM",
      CDM: "CDM",
      RCM: "RCM",
      LB: "LB",
      LCB: "LCB",
      RCB: "RCB",
      RB: "RB",
      GK: "GK",
    },
    roles: {
      LW: "LW", CF: "CF", RW: "RW",
      LCM: "CM", CDM: "CDM", RCM: "CM",
      LB: "LB", LCB: "CB", RCB: "CB", RB: "RB",
      GK: "GK",
    },
  },

  "4-2-2-2": {
    positions: {
      LST: "LW",
      RST: "RW",
      LAM: "LAM",
      RAM: "RAM",
      LCDM: "LCDM",
      RCDM: "RCDM",
      LB: "LB",
      LCB: "LCB",
      RCB: "RCB",
      RB: "RB",
      GK: "GK",
    },
    roles: {
      LST: "ST", RST: "ST",
      LAM: "CAM", RAM: "CAM",
      LCDM: "CDM", RCDM: "CDM",
      LB: "LB", LCB: "CB", RCB: "CB", RB: "RB",
      GK: "GK",
    },
  },
};

/* =========================
   POSITION FIT LOGIC
========================= */

const getPositionFit = (player, role) => {
  if (!player) return 0;
  if (player.Position === role) return 1.0;
  if (player.SecondaryPositions?.includes(role)) return 0.85;

  const attack = ["ST", "CF", "LW", "RW"];
  const midfield = ["CM", "CDM", "CAM", "LM", "RM"];
  const defense = ["CB", "LB", "RB"];

  if (attack.includes(player.Position) && attack.includes(role)) return 0.75;
  if (midfield.includes(player.Position) && midfield.includes(role))
    return 0.75;
  if (defense.includes(player.Position) && defense.includes(role)) return 0.75;

  return 0.6;
};

/* =========================
   DRAGGABLE PLAYER (BENCH)
========================= */

const DraggablePlayer = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `bench-${player.id}`,
      data: { player, source: "bench" },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white/10 backdrop-blur-2xl px-3 py-3 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-white/20"
    >
      <div className="flex flex-col justify-center items-start gap-2">
        <div className="w-full flex justify-between items-center">
          <Text className="text-white text-xl">{player.Name}</Text>
          <img
            src={`/player_photos/${player.ID}.png`}
            alt={player.Name}
            className="w-14 h-14 object-cover"
          />
        </div>
        <div className="w-full flex justify-between items-center">
          <Text className="text-white">{player.Position}</Text>
          <Text className="text-[#41FEFE] font-bold">{player.Overall}</Text>
        </div>
      </div>
    </div>
  );
};

/* =========================
   DRAGGABLE FIELD PLAYER
========================= */

const DraggableFieldPlayer = ({ player, slotId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `field-${slotId}`,
      data: { player, source: "field", slotId },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute inset-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col justify-center items-center gap-1">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
          <img
            src={`/player_photos/${player.ID}.png`}
            alt={player.Name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-white font-semibold text-center text-sm whitespace-nowrap">
          {player.Name}
        </div>
      </div>
    </div>
  );
};

/* =========================
   DROPPABLE SLOT
========================= */

const Slot = ({ slotId, role, player, onRemove, isActive }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { slotId, role },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      onDoubleClick={() => player && onRemove(slotId)}
      className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-xs font-semibold relative transition-all duration-200
        ${isOver ? "ring-4 ring-yellow-400 scale-105 border-yellow-400" : ""}
        ${player ? "" : "bg-white/5"}
      `}
      title={player ? "Double-click to remove" : `Drop player here (${role})`}
    >
      {player ? (
        <DraggableFieldPlayer player={player} slotId={slotId} />
      ) : (
        <span className="text-white/60 text-sm">{role}</span>
      )}
    </div>
  );
};

/* =========================
   FIFA STYLE RATING CARD
========================= */

const FIFARatingCard = ({ attack, midfield, defense }) => {
  return (
    <div className="rounded-xl py-4 px-4 border-2 border-white/10 shadow-2xl">
      <h3 className="text-white font-bold text-lg mb-4 text-center">
        Squad Rating
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl text-white font-bold mb-1">{attack}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            Attack
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl text-white font-bold mb-1">{midfield}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            Midfield
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl text-white font-bold mb-1">{defense}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">
            Defense
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   FIELD VIEW
========================= */

const FieldView = ({ players }) => {
  const [formation, setFormation] = useState("4-3-3");
  const [lineup, setLineup] = useState({
    formation: "4-3-3",
    assignments: {},
  });

  const formationData = FORMATIONS[formation];

  useEffect(() => {
    const newAssignments = {};
    Object.keys(formationData.roles).forEach(
      (slot) => (newAssignments[slot] = null),
    );
    setLineup({
      formation,
      assignments: newAssignments,
    });
  }, [formation]);

  const benchPlayers = useMemo(() => {
    const assignedIds = Object.values(lineup.assignments)
      .filter(Boolean)
      .map((p) => p.id);
    return players.filter((p) => !assignedIds.includes(p.id));
  }, [players, lineup.assignments]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    if (activeData.source === "bench") {
      const targetSlot = over.id;
      const player = activeData.player;

      setLineup((prev) => {
        const updated = { ...prev.assignments };
        Object.keys(updated).forEach((slot) => {
          if (updated[slot]?.id === player.id) {
            updated[slot] = null;
          }
        });
        updated[targetSlot] = player;
        return { ...prev, assignments: updated };
      });
    } else if (activeData.source === "field") {
      const fromSlot = activeData.slotId;
      const toSlot = over.id;
      if (fromSlot === toSlot) return;

      setLineup((prev) => {
        const updated = { ...prev.assignments };
        const draggedPlayer = updated[fromSlot];
        const targetPlayer = updated[toSlot];
        updated[toSlot] = draggedPlayer;
        updated[fromSlot] = targetPlayer;
        return { ...prev, assignments: updated };
      });
    }
  };

  const handleRemovePlayer = (slotId) => {
    setLineup((prev) => {
      const updated = { ...prev.assignments };
      updated[slotId] = null;
      return { ...prev, assignments: updated };
    });
  };

  const ratings = useMemo(() => {
    const categoryRatings = { ATT: [], MID: [], DEF: [] };

    const attackPositions = ["ST", "CF", "LW", "RW"];
    const midfieldPositions = ["CM", "CDM", "CAM", "LM", "RM", "LWB", "RWB"];
    const defensePositions = ["CB", "LB", "RB"];

    Object.entries(lineup.assignments).forEach(([slotId, player]) => {
      if (!player) return;
      const role = formationData.roles[slotId];

      if (attackPositions.includes(role)) {
        categoryRatings.ATT.push(Number(player.Overall));
      } else if (midfieldPositions.includes(role)) {
        categoryRatings.MID.push(Number(player.Overall));
      } else if (defensePositions.includes(role)) {
        categoryRatings.DEF.push(Number(player.Overall));
      }
    });

    const attack =
      categoryRatings.ATT.length > 0
        ? Math.round(
            categoryRatings.ATT.reduce((a, b) => a + b, 0) /
              categoryRatings.ATT.length,
          )
        : 0;

    const midfield =
      categoryRatings.MID.length > 0
        ? Math.round(
            categoryRatings.MID.reduce((a, b) => a + b, 0) /
              categoryRatings.MID.length,
          )
        : 0;

    const defense =
      categoryRatings.DEF.length > 0
        ? Math.round(
            categoryRatings.DEF.reduce((a, b) => a + b, 0) /
              categoryRatings.DEF.length,
          )
        : 0;

    return { attack, midfield, defense };
  }, [lineup.assignments, formationData]);

  const filledPositions = Object.values(lineup.assignments).filter(
    Boolean,
  ).length;
  const totalPositions = Object.keys(formationData.roles).length;

  // Get active positions for current formation
  const activePositionKeys = Object.values(formationData.positions);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-white/10 backdrop-blur-2xl rounded-lg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              {Object.keys(FORMATIONS).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">Players: </span>
              <span className="text-white font-bold">
                {filledPositions}/{totalPositions}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Rating */}
          <div className="lg:col-span-1 flex flex-col justify-start">
            <FIFARatingCard
              attack={ratings.attack}
              midfield={ratings.midfield}
              defense={ratings.defense}
            />
          </div>

          {/* Center - Football Pitch */}
          <div className="lg:col-span-2">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              {/* Football Field */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[2/3]"
                style={{
                  background:
                    "linear-gradient(180deg, #2d5016 0%, #1a3d0a 50%, #2d5016 100%)",
                  backgroundImage: `url(${Field})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Field Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/30"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/30"></div>

                  {/* Center Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>

                  {/* Penalty Boxes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 border-2 border-white/30 border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 border-2 border-white/30 border-b-0"></div>

                  {/* Goal Boxes */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-12 border-2 border-white/30 border-t-0"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-12 border-2 border-white/30 border-b-0"></div>
                </div>

                {/* Absolute Positioned Players */}
                <div className="relative h-full w-full">
                  {Object.entries(formationData.positions).map(([slotId, posKey]) => {
                    const coords = POSITION_COORDINATES[posKey];
                    const player = lineup.assignments[slotId];
                    const role = formationData.roles[slotId];
                    const isActive = activePositionKeys.includes(posKey);

                    return (
                      <div
                        key={slotId}
                        className="absolute"
                        style={{
                          left: `${coords.x}%`,
                          top: `${coords.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <Slot
                          slotId={slotId}
                          role={role}
                          player={player}
                          onRemove={handleRemovePlayer}
                          isActive={isActive}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bench Section */}
              <div className="mt-6 rounded-xl">
                <div className="flex flex-col items-center justify-center mb-4 gap-1">
                  <div className="flex items-center gap-2">
                    <Text className="text-white font-bold text-lg">Bench</Text>
                    <Text className="text-white">({benchPlayers.length})</Text>
                  </div>
                  <Text className="text-white text-sm opacity-70">
                    Drag players onto the field
                  </Text>
                </div>

                {benchPlayers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {benchPlayers.map((player) => (
                      <DraggablePlayer key={player.id} player={player} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    All players are in the starting XI
                  </div>
                )}
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldView;