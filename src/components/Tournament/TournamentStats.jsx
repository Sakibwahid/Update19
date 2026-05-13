// TournamentStats.jsx

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import Loadin from "../ui/loadin";

const TEAM_SHORT_NAMES = {
  "Wolverhampton Wanderers F.C.": "Wolves",
  "FC Bayern Munich": "Bayern",
  "Manchester City F.C.": "Man City",
  "Manchester United F.C.": "Man United",
  "Liverpool F.C.": "Liverpool",
};

const sortTeams = (a, b) => {
  // Total points
  if ((b.totalPoints || 0) !== (a.totalPoints || 0)) {
    return (b.totalPoints || 0) - (a.totalPoints || 0);
  }

  // 1st place count
  if ((b.firstCount || 0) !== (a.firstCount || 0)) {
    return (b.firstCount || 0) - (a.firstCount || 0);
  }

  // 2nd place count
  if ((b.secondCounts || 0) !== (a.secondCounts || 0)) {
    return (b.secondCounts || 0) - (a.secondCounts || 0);
  }

  // 3rd place count
  if ((b.thirdCount || 0) !== (a.thirdCount || 0)) {
    return (b.thirdCount || 0) - (a.thirdCount || 0);
  }

  // Less zeros ranks higher
  return (a.zeroCounts || 0) - (b.zeroCounts || 0);
};

const TournamentStats = ({ selectedSeason = "S3" }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);

        const standingsRef = collection(
          db,
          "seasons",
          selectedSeason,
          "standings"
        );

        const snapshot = await getDocs(standingsRef);

        const data = snapshot.docs.map((doc) => ({
          name: doc.id,
          ...doc.data(),
        }));

        data.sort(sortTeams);

        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch standings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedSeason]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const shortName =
        TEAM_SHORT_NAMES[team.name] || team.name;

      return shortName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [teams, searchTerm]);

  const maxPoints = useMemo(() => {
    return Math.max(
      ...filteredTeams.map((t) => t.totalPoints || 0),
      1
    );
  }, [filteredTeams]);

  if (loading) {
    return <Loadin>Where you at!</Loadin>;
  }

  return (
    <div className="w-full mx-2 rounded-2xl backdrop-blur-md shadow-lg p-5 md:p-6">
      <Text variant="subheading" className="text-xl font-semibold mb-4">
        Tournament Standings
      </Text>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            bg-black/30
            border border-white/10
            rounded-xl
            px-4 py-3
            text-sm text-white
            placeholder:text-white/40
            outline-none
            focus:border-[#41FFEE]
            transition
          "
        />
      </div>

      <div className="overflow-x-auto rounded-lg flex flex-col">
        <table className="w-full border-separate border-spacing-y-1">
          <thead className="bg-white/5">
            <tr className="border-b border-white/20 text-white/80 text-sm uppercase">
              <th className="px-2 py-2 text-left">
                Team
              </th>

              <th className="px-2 py-2 text-center">
                Points
              </th>

              <th className="px-2 py-2 text-center">
                1st
              </th>

              <th className="px-2 py-2 text-center">
                2nd
              </th>

              <th className="px-2 py-2 text-center">
                3rd
              </th>

              <th className="px-2 py-2 text-center">
                Zeros
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTeams.map((team) => (
              <tr
                key={team.name}
                className="
                  text-white
                  border-b border-white/10
                  hover:bg-white/5
                  transition
                "
              >
                <td className="px-4 py-4">
                  {TEAM_SHORT_NAMES[team.name] || team.name}
                </td>

                <td className="px-4 py-4 font-semibold text-center text-[#41FFEE]">
                  {team.totalPoints || 0}
                </td>

                <td className="px-4 py-4 text-center">
                  {team.firstCount || 0}
                </td>

                <td className="px-4 py-4 text-center">
                  {team.secondCounts || 0}
                </td>

                <td className="px-4 py-4 text-center">
                  {team.thirdCount || 0}
                </td>

                <td className="px-4 py-4 text-center">
                  {team.zeroCounts || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GRAPH */}
        <div className="mt-10">
          <Text variant="subheading" className="text-lg font-semibold mb-5">
            Graph View
          </Text>

          <div className="relative w-full overflow-x-auto">
            <div className="flex items-end gap-4 min-h-65 px-2">
              {filteredTeams.map((team) => {
                const height =
                  ((team.totalPoints || 0) / maxPoints) * 100;

                return (
                  <div
                    key={team.name}
                    className="
                      flex flex-col
                      items-center justify-end
                      gap-2
                      w-16
                    "
                  >
                    {/* POINTS */}
                    <span className="text-md font-bold text-white/90">
                      {team.totalPoints || 0}
                    </span>

                    {/* BAR */}
                    <div className="relative w-full h-48 bg-white/10 overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full transition-[height] duration-700 ease-out"
                        style={{
                          height: `${height}%`,
                          background:
                            "linear-gradient(180deg, #41FFEE, #41FFEE70)",
                          boxShadow: "0 0 18px #41FFEE66",
                        }}
                      />
                    </div>

                    {/* NAME */}
                    <span
                      className="
                        text-xs text-white/80
                        truncate max-w-full
                        text-center
                      "
                      title={team.name}
                    >
                      {TEAM_SHORT_NAMES[team.name] || team.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentStats;