import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase/config";
import { Button } from "../components/ui/Button"; 
import AuctionSection from "../components/auction/AuctionSection";
import { Anchor } from "../components/ui/Anchor";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [showAuction, setShowAuction] = useState(false);
  const navigate = useNavigate();

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
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!userData) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white flex flex-col items-center">
      {/* USER INTRO */}
      <div className="w-full max-w-3xl backdrop-blur-xl bg-white/5 rounded-xl shadow-lg p-6 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{userData.username}</h1>
          <p className="text-gray-300">Team: {userData.teamName}</p>
        </div>
        <Button
          variant="primary"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      {/* ACTION BOX */}
      <div className="w-full max-w-3xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-center mb-4">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Anchor to="/auction">
          <Button
            variant="secondary"
            className="w-full py-4 border border-white/30 rounded-lg hover:bg-white/5"
          >
            Enter Auction
          </Button>
          </Anchor>

          {/* Placeholder for future option */}
          <Button
            variant="secondary"
            className="w-full py-4 border border-white/30 rounded-lg hover:bg-white/5"
            disabled
          >
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
