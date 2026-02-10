import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import Loadin from "../ui/loadin";

const TournamentStats = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const maxPoints = Math.max(...teams.map((t) => t.totalPoints || 0), 1);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "teams"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          name: doc.id,
          ...doc.data(),
        }));

        // SORTING LOGIC
        data.sort((a, b) => {
          if (b.totalPoints !== a.totalPoints)
            return b.totalPoints - a.totalPoints;

          if ((b.firstCount || 0) !== (a.firstCount || 0))
            return (b.firstCount || 0) - (a.firstCount || 0);

          if ((b.secondCounts || 0) !== (a.secondCounts || 0))
            return (b.secondCounts || 0) - (a.secondCounts || 0);

          return 0;
        });

        setTeams(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch tournament stats:", error);
        setLoading(false);
      },
    );

    // CLEANUP — REQUIRED
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loadin>Where you at!</Loadin>;
  }

  return (
    <div className="w-full mx-2 rounded-2xl backdrop-blur-mdshadow-lg p-5 md:p-6">
      <Text variant="subheading" className="text-xl font-semibold mb-4">
        Tournament Standings
      </Text>

      <div className="overflow-x-auto rounded-lg flex flex-col justify-center">
        <table className="w-full text-center border-collapse">
          <thead className="bg-white/5">
            <tr className="border-b border-white/20 text-white/80 text-sm uppercase">
              <th className="py-3">#</th>
              <th className="py-3">Team</th>
              <th className="py-3">Points</th>
              <th className="py-3">1st</th>
              <th className="py-3">2nd</th>
              <th className="py-3">Zeros</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team, index) => (
              <tr
                key={team.name}
                className="text-white border-b border-white/10 hover:bg-white/5 transition"
              >
                <td className="py-3 font-bold">{index + 1}</td>
                <td className="py-3">{team.name}</td>
                <td className="py-3 font-semibold text-[#41FFEE]">
                  {team.totalPoints || 0}
                </td>
                <td className="py-3">{team.firstCount || 0}</td>
                <td className="py-3">{team.secondCounts || 0}</td>
                <td className="py-3">{team.zeroCounts || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* VERTICAL GRAPH */}
        <div className="mt-10">
          <Text variant="subheading" className="text-lg font-semibold mb-5">
           Graph View
          </Text>

          <div className="relative w-full overflow-x-auto">
            <div className="flex items-end gap-4 min-h-65 px-2">
              {teams.map((team, index) => {
                const height = ((team.totalPoints || 0) / maxPoints) * 100;

                return (
                  <div
                    key={team.name}
                    className="flex flex-col items-center justify-end gap-2 w-12"
                  >
                    {/* Points */}
                    <span className="text-md font-bold text-white/90">
                      {team.totalPoints || 0}
                    </span>

                    {/* Bar */}
                    <div className="relative w-full h-48 bg-white/10 overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full  transition-all duration-700 ease-out"
                        style={{
                          height: `${height}%`,
                          background:
                            "linear-gradient(180deg, #41FFEE, #41FFEE70)",
                          boxShadow: "0 0 18px #41FFEE66",
                        }}
                      />
                    </div>

                    {/* Team name */}
                    <span
                      className="text-xs text-white/80 truncate max-w-full"
                      title={team.name}
                    >
                      {team.name}
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
