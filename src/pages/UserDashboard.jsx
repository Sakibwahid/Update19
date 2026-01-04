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



  if (!userData) {
    return <div className="p-6 text-white">Loading...</div>;
  }
return (
  <div className="min-h-screen text-white flex justify-center px-4 py-10">
    <div className="w-full max-w-4xl space-y-8">

      {/* USER HEADER */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {userData.username}
          </h1>
          <p className="text-gray-300 mt-1">
            Team: <span className="text-white">{userData.teamName}</span>
          </p>

          <p className="text-sm text-gray-400 mt-3 max-w-md">
            Welcome back. You can enter the live auction or manage your activities
            from here.
          </p>
        </div>

      </div>

      {/* ACTION PANEL */}
      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-6">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Anchor to="/auction">
            <div className="group cursor-pointer  border border-[#41FFEE] rounded-xl p-6 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">
                Enter Auction
              </h3>
              <p className="text-sm text-gray-300">
                Browse players, view live auctions, and place bids.
              </p>
            </div>
          </Anchor>

          {/* FUTURE OPTION */}
          <div className="border border-white/80 rounded-xl p-6 text-center opacity-50 cursor-not-allowed">
            <h3 className="text-lg font-semibold mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-gray-500">
              Additional features will be available here.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
);
};

export default UserDashboard;
