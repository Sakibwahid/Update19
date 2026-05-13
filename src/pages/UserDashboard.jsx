import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

import { db } from "../lib/firebase/config";
import { useAuth } from "../context/AuthContext";

import { Anchor } from "../components/ui/Anchor";
import { Text } from "../components/ui/Text";
import Loadin from "../components/ui/loadin";

const TEAMS_CACHE_KEY = "teams_cache_v1";
const CACHE_MAX_AGE_MS = 1000 * 60 * 5;

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

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();

  const [teams, setTeams] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!authLoading && !userData) {
      navigate("/login");
    }
  }, [authLoading, userData, navigate]);

  /* ---------------- LOAD CACHE FIRST ---------------- */
  useEffect(() => {
    try {
      const cached = localStorage.getItem(TEAMS_CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        if (
          parsed?.data &&
          Date.now() - parsed.savedAt < CACHE_MAX_AGE_MS
        ) {
          setTeams(parsed.data);
          setInitialLoad(false);
        }
      }
    } catch {
      localStorage.removeItem(TEAMS_CACHE_KEY);
    }
  }, []);

  /* ---------------- REALTIME FIRESTORE ---------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "teams"),
      async (snapshot) => {
        try {
          const resolvedTeams = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              let docId = docSnap.id;
              let data = docSnap.data();

              if (renameMap[docId]) {
                const fullName = renameMap[docId];

                const fullSnap = await getDoc(
                  doc(db, "teams", fullName)
                );

                if (fullSnap.exists()) {
                  docId = fullName;
                  data = fullSnap.data();
                }
              }

              return { name: docId, ...data };
            })
          );

          resolvedTeams.sort((a, b) => {
            if ((b.totalPoints || 0) !== (a.totalPoints || 0)) {
              return b.totalPoints - a.totalPoints;
            }

            if ((b.firstCount || 0) !== (a.firstCount || 0)) {
              return b.firstCount - a.firstCount;
            }

            return (b.secondCounts || 0) - (a.secondCounts || 0);
          });

          setTeams(resolvedTeams);

          localStorage.setItem(
            TEAMS_CACHE_KEY,
            JSON.stringify({
              data: resolvedTeams,
              savedAt: Date.now(),
            })
          );

          if (initialLoad) setInitialLoad(false);
        } catch (err) {
          console.error("Teams snapshot error:", err);
        }
      }
    );

    return () => unsubscribe();
  }, [initialLoad]);

  /* ---------------- DERIVED VALUES ---------------- */
  const teamNameShort = useMemo(() => {
    if (!userData) return "City";
    return shortMap[userData.teamName] || "City";
  }, [userData]);

  const userRank = useMemo(() => {
    return teams.findIndex((t) => t.name === teamNameShort) + 1;
  }, [teams, teamNameShort]);

  const userPoints = useMemo(() => {
    return (
      teams.find((t) => t.name === teamNameShort)?.totalPoints || 0
    );
  }, [teams, teamNameShort]);

  /* ---------------- LOADING LOGIC (FIXED) ---------------- */
  if (authLoading || (!userData && initialLoad)) {
    return <Loadin>Loading dashboard...</Loadin>;
  }

  return (
    <div className="min-h-screen w-full text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">

        {/* USER HEADER */}
        <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">

            <div className="flex justify-between w-full items-center">

              <div className="flex flex-col">
                <Text
                  variant="heading"
                  className="text-4xl font-semibold tracking-tight"
                >
                  {userData.username}
                </Text>

                <Text
                  variant="para"
                  className="text-gray-300 mt-1"
                >
                  Team:
                  <span className="text-white font-medium ml-1">
                    {userData.teamName}
                  </span>
                </Text>

                <Text
                  variant="para"
                  className="text-gray-300 mt-1"
                >
                  Welcome Back
                </Text>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1">

                <Text variant="subheading" className="text-gray-300">
                  Points:
                  <span className="font-semibold text-[#41FEee] ml-1">
                    {userPoints}
                  </span>
                </Text>

                <Text variant="subheading" className="text-gray-300">
                  Rank:
                  <span className="font-semibold text-[#41FEee] ml-1">
                    {userRank}
                  </span>
                </Text>

              </div>

            </div>

          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="relative backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">

          <Text
            variant="subheading"
            className="text-xl font-semibold text-center mb-6"
          >
            What would you like to do?
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Anchor to="/auction">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <Text
                  variant="subheading"
                  className="text-lg font-semibold mb-2 group-hover:text-blue-400"
                >
                  Enter Auction
                </Text>
              </div>
            </Anchor>

            <Anchor to="/tournamentstats">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <Text
                  variant="subheading"
                  className="text-lg font-semibold mb-2 group-hover:text-blue-400"
                >
                  See Tournament Stats
                </Text>
              </div>
            </Anchor>

            <Anchor to="/user/squad">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <Text
                  variant="subheading"
                  className="text-lg font-semibold mb-2 group-hover:text-blue-400"
                >
                  See Your Squad
                </Text>
              </div>
            </Anchor>

            <Anchor to="/user/buildsquad">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl py-2 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <Text
                  variant="subheading"
                  className="text-lg font-semibold mb-2 group-hover:text-blue-400"
                >
                  Build Squad
                </Text>
              </div>
            </Anchor>

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;