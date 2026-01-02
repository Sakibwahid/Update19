import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase/config";

import PlayerFilter from "../components/player/PlayerFilter";
import PlayerCard from "../components/player/PlayerCard";
import useCurrentPlayer from "../hooks/useCurrentPlayer";
import { Button } from "../components/ui/Button"; 

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const { currentPlayer, loading: currentPlayerLoading } = useCurrentPlayer();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        navigate("/login");
        return;
      }

      setUserData(userDoc.data());
    };

    fetchUserData();
  }, [userData]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!userData || currentPlayerLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* USER HEADER */}
        <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {userData.username}
            </h1>
            <p className="text-gray-700">Team: {userData.teamName}</p>
            <p className="mt-1">
              Status:{" "}
              <span
                className={
                  userData.isApproved ? "text-green-600" : "text-yellow-600"
                }
              >
                {userData.isApproved ? "Verified" : "Pending Approval"}
              </span>
            </p>
          </div>

          <Button
          variant="primary"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Logout
          </Button>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PLAYER FILTER — LEFT */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              Browse Players
            </h2>
            <PlayerFilter />
          </div>

          {/* CURRENT AUCTION PLAYER — RIGHT */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Current Auction Player
            </h2>

            {currentPlayer ? (
              <div className="flex justify-center">
                <PlayerCard player={currentPlayer} />
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No player in auction yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
