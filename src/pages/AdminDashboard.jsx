import React, { useState } from "react";
import { auth, db, storage } from "../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PlayerFilter from "../components/player/PlayerFilter";
import AdminAuctionControl from "../components/auction/AdminAuctionControl";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  
  return (
    <div className=" h-fit flex flex-col justify-center items-center gap-6">
      <h1 className="text-4xl font-semibold">Admin Dashboard</h1>

      <AdminAuctionControl></AdminAuctionControl>

      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
