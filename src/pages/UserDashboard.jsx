import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase/config";
import { Anchor } from "../components/ui/Anchor";
import { Text } from "../components/ui/Text";
import TournamentStats from "../components/Tournament/TournamentStats";
import DisplaySquad from "../components/Squads/DisplaySquad";
import Loadin from "../components/ui/loadin"; 

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const renameMap = {
    City: "Manchester City F.C.",
    ManU: "Manchester United F.C.",
    Bayern: "FC Bayern Munich",
    Liverpool: "Liverpool F.C.",
    Wolves: "Wolverhampton Wanderers F.C.",
  };

  const shortMap = Object.fromEntries(
    Object.entries(renameMap).map(([k, v]) => [v, k])
  );

  const teamNameShort = userData ? shortMap[userData.teamName] || "City" : "City";

  // Fetch current user
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) return navigate("/login");

      setUserData(userDoc.data());
    };

    fetchUserData();
  }, [navigate]);

  // Live fetching of teams + rename
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teams"), async (snapshot) => {
      const data = [];

      for (const docSnap of snapshot.docs) {
        let docData = docSnap.data();
        let docId = docSnap.id;

        if (renameMap[docId]) {
          const fullName = renameMap[docId];
          const fullRef = doc(db, "teams", fullName);
          const fullSnap = await getDoc(fullRef);

          if (!fullSnap.exists()) {
            await setDoc(fullRef, docData);
            await deleteDoc(doc(db, "teams", docId));
            docId = fullName;
          } else {
            docId = fullName;
          }
        }

        data.push({ name: docId, ...docData });
      }

      // SORTING: points → firstCount → secondCounts
      data.sort((a, b) => {
        if ((b.totalPoints || 0) !== (a.totalPoints || 0))
          return (b.totalPoints || 0) - (a.totalPoints || 0);
        if ((b.firstCount || 0) !== (a.firstCount || 0))
          return (b.firstCount || 0) - (a.firstCount || 0);
        if ((b.secondCounts || 0) !== (a.secondCounts || 0))
          return (b.secondCounts || 0) - (a.secondCounts || 0);
        return 0;
      });

      setTeams(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userRank = teams.findIndex((t) => t.name === teamNameShort) + 1;
  const userPoints = teams.find((t) => t.name === teamNameShort)?.totalPoints || 0;

  if (!userData) return  <Loadin>Preparin your experience</Loadin>

  return (
    <div className="min-h-screen w-full text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">

        {/* USER HEADER */}
        <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
            <div className="flex justify-between w-full items-center">
            <div className="flex flex-col">
              <h1 className="text-4xl font-semibold tracking-tight">
                {userData.username}
              </h1>
              <Text variant="para" className="text-gray-300 mt-1">
                Team: <span className="text-white font-medium">{userData.teamName}</span>
              </Text>
              <Text variant="para" className="text-gray-300 mt-1">Welcome Back</Text>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <Text variant="subheading" className="text-gray-300">
                Points: <span className="font-semibold text-[#41FEee]">{userPoints}</span>
              </Text>
              <Text variant="subheading" className="text-gray-300">
                Rank: <span className="font-semibold text-[#41FEee]">{userRank}</span>
              </Text>
            </div>

            </div>
          </div>

        </div>

        {/* ACTION PANEL */}
        <div className="relative backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">
            What would you like to do?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Anchor to="/auction">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">Enter Auction</h3>
              </div>
            </Anchor>

            <Anchor to="/tournamentstats">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">See Tournament Stats</h3>
               
              </div>
            </Anchor>

            <Anchor to="/user/squad">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">See Your Squad</h3>
              </div>
            </Anchor>

            <Anchor to="/user/buildsquad">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">Build Squad</h3>
              </div>
            </Anchor>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default UserDashboard;

