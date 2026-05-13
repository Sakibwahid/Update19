// UpdateTournament.jsx

import { useState } from "react";

import {
  doc,
  increment,
  writeBatch,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase/config";

import { Text } from "../ui/Text";
import { Button } from "../ui/Button";

import TournamentStats from "./TournamentStats";

const TEAMS = [
  "Wolverhampton Wanderers F.C.",
  "FC Bayern Munich",
  "Manchester City F.C.",
  "Manchester United F.C.",
  "Liverpool F.C.",
];

const POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"];

const SEASONS = ["S3", "S4", "S5"];

const UpdateTournament = () => {
  const [placements, setPlacements] = useState({});
  const [selectedSeason, setSelectedSeason] = useState("S3");

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
          thirdCount: increment(1),
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

  const handleChange = (team, position) => {
    setPlacements((prev) => ({
      ...prev,
      [team]: position,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(placements).length !== TEAMS.length) {
      alert("Please assign positions to all teams.");
      return;
    }

    const selectedPositions = Object.values(placements);

    if (new Set(selectedPositions).size !== POSITIONS.length) {
      alert("Each position must be unique.");
      return;
    }

    try {
      const batch = writeBatch(db);

      // UPDATE STANDINGS
      TEAMS.forEach((team) => {
        const updates = getStatsUpdate(placements[team]);

        const standingsRef = doc(
          db,
          "seasons",
          selectedSeason,
          "standings",
          team
        );

        batch.set(
          standingsRef,
          updates,
          { merge: true }
        );
      });

      // SAVE TOURNAMENT
      const tournamentRef = doc(
        collection(
          db,
          "seasons",
          selectedSeason,
          "tournaments"
        )
      );

      batch.set(tournamentRef, {
        season: selectedSeason,
        results: placements,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      alert(`${selectedSeason} tournament submitted successfully.`);

      setPlacements({});
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleResetSeason = async () => {
    const confirmReset = window.confirm(
      `Reset all standings for ${selectedSeason}?`
    );

    if (!confirmReset) return;

    try {
      const batch = writeBatch(db);

      TEAMS.forEach((team) => {
        const standingsRef = doc(
          db,
          "seasons",
          selectedSeason,
          "standings",
          team
        );

        batch.set(
          standingsRef,
          {
            totalPoints: 0,
            firstCount: 0,
            secondCounts: 0,
            thirdCount: 0,
            zeroCounts: 0,
          },
          { merge: true }
        );
      });

      await batch.commit();

      alert(`${selectedSeason} standings reset.`);
    } catch (error) {
      console.error(error);
      alert("Failed to reset standings.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-2 md:px-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg p-5 md:p-6">

          <Text className="text-2xl font-semibold mb-5 text-center">
            Update Tournament
          </Text>

          {/* SEASON SELECT */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full mb-5 bg-black/40 text-white px-3 py-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-[#41FFEE] outline-none transition"
          >
            {SEASONS.map((season) => (
              <option
                key={season}
                value={season}
              >
                {season}
              </option>
            ))}
          </select>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {TEAMS.map((team) => (
              <div
                key={team}
                className="flex items-center justify-between gap-3"
              >
                <Text className="text-sm font-medium">
                  {team}
                </Text>

                <select
                  value={placements[team] || ""}
                  onChange={(e) =>
                    handleChange(team, e.target.value)
                  }
                  className="min-w-[100px] bg-black/40 text-white px-3 py-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-[#41FFEE] outline-none transition"
                  required
                >
                  <option value="" disabled>
                    Position
                  </option>

                  {POSITIONS.map((pos) => (
                    <option
                      key={pos}
                      value={pos}
                    >
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
              onClick={handleResetSeason}
              className="w-full bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl border border-red-400/30 hover:bg-red-500/30 transition"
            >
              Clear Season Records
            </Button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg p-3 md:p-6">
          <TournamentStats selectedSeason={selectedSeason} />
        </div>
      </div>
    </div>
  );
};

export default UpdateTournament;