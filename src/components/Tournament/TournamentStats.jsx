import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";

const TournamentStats = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }
    );

    // CLEANUP — REQUIRED
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Text className="text-center">Loading standings...</Text>;
  }

  return (
    <div className="w-full mx-2 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-lg p-5 md:p-6">
      <Text variant="subheading" className="text-xl font-semibold mb-4">Tournament Standings</Text>

      <div className="overflow-x-auto rounded-lg">
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
      </div>
    </div>
  );
};

export default TournamentStats;
