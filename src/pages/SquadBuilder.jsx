import { useState } from "react";

const SquadBuilderTest = () => {
  const [droppedText, setDroppedText] = useState("");

  const player = [{ id: "1", name: "Messi" }, { id: "2", name: "Ronaldo" }]; // sample text

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-800 text-white p-4">
      <h1 className="text-3xl font-bold">Squad Builder Test</h1>

      {/* Draggable Text */}
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", player.name)}
        className="cursor-grab bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        {player.name}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const text = e.dataTransfer.getData("text/plain");
          setDroppedText(text);
        }}
        className="w-64 h-32 border-4 border-dashed border-white flex items-center justify-center rounded"
      >
        {droppedText ? (
          <span className="text-xl font-semibold">{droppedText}</span>
        ) : (
          <span className="text-gray-400">Drop here</span>
        )}
      </div>
    </div>
  );
};

export default SquadBuilderTest;
