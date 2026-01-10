import { useState } from "react";
import { doc, updateDoc, increment,writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import TournamentStats from "./TournamentStats";

const TEAMS = ["Wolves", "Bayern", "City", "ManU", "Liverpool"];
const POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"];

const UpdateTournament = () => {
  const [placements, setPlacements] = useState({});

  const handleChange = (team, position) => {
    setPlacements((prev) => ({
      ...prev,
      [team]: position,
    }));
  };

  const getStatsUpdate = (position) => {
    switch (position) {
      case "1st":
        return {
          totalPoints: increment(3),
          firstCount: increment(1),
        };
      case "2nd":
        return {
          totalPoints: increment(2),
          secondCounts: increment(1),
        };
      case "3rd":
        return {
          totalPoints: increment(1),
        };
      case "4th":
      case "5th":
        return {
          zeroCounts: increment(1),
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(placements).length !== TEAMS.length) {
      alert("Please assign positions to all teams.");
      return;
    }

    try {
      for (const team of TEAMS) {
        const position = placements[team];
        const updates = getStatsUpdate(position);

        const teamRef = doc(db, "teams", team);
        await updateDoc(teamRef, updates);
      }

      alert("Tournament data updated successfully.");
      setPlacements({});
    } catch (error) {
      console.error("Update failed:", error);
      alert("Something went wrong while updating.");
    }
  };
  const handleResetAll = async () => {
    const confirmReset = window.confirm(
      "This will reset ALL tournament stats. Are you sure?"
    );

    if (!confirmReset) return;

    try {
      const batch = writeBatch(db);

      for (const team of TEAMS) {
        const teamRef = doc(db, "teams", team);

        batch.update(teamRef, {
          totalPoints: 0,
          firstCount: 0,
          secondCounts: 0,
          zeroCounts: 0,
        });
      }

      await batch.commit();
      alert("All tournament records have been reset.");
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Failed to reset tournament data.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-2 md:px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT — UPDATE FORM */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg p-5 md:p-6">
          <Text className="text-2xl font-semibold mb-5 text-center">
            Update Tournament
          </Text>

          <form onSubmit={handleSubmit} className="space-y-4">
            {TEAMS.map((team) => (
              <div
                key={team}
                className="flex items-center justify-between gap-3"
              >
                <Text className="text-lg font-medium">{team}</Text>

                <select
                  value={placements[team] || ""}
                  onChange={(e) => handleChange(team, e.target.value)}
                  className="min-w-30 bg-black/40 text-white px-3 py-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-[#41FFEE] outline-none transition"
                  required
                >
                  <option value="" disabled>
                    Position
                  </option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <Button
              type="submit"
              className="w-full mt-4 bg-[#41FFEE] text-gray-800 font-semibold py-3 rounded-xl hover:opacity-90 transition"
            >
              Submit Tournament
            </Button>
            <Button
              type="button"
              onClick={handleResetAll}
              className="w-full bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl border border-red-400/30 hover:bg-red-500/30 transition"
            >
              Clear All Records
            </Button>
          </form>
        </div>

        {/* RIGHT — STANDINGS */}
        <div className="flex justify-center  lg:col-span-2 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg p-5 md:p-6">
          <TournamentStats />
        </div>
      </div>
    </div>
  );
};

export default UpdateTournament;
