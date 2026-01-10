import React from "react";
import { Anchor } from "../components/ui/Anchor";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">

        {/* ADMIN HEADER */}
        <div className="relative backdrop-blur-md bg-white/2 border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg">
          <h1 className="text-4xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-3 max-w-md">
            Manage live auctions, control player flow, and monitor teams from
            this panel.
          </p>
        </div>

        {/* ACTION PANEL */}
        <div className="relative backdrop-blur-md bg-white/2 border border-white/20 rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">
            What would you like to do?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LAUNCH AUCTION */}
            <Anchor to="/admin/auction">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl p-6 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">
                  Launch Auction
                </h3>
                <p className="text-sm text-gray-300">
                  Start and control the live player auction.
                </p>
              </div>
            </Anchor>

            {/* VIEW TEAMS — PLACEHOLDER */}
            <Anchor to="/admin/updatetournament">
              <div className="group cursor-pointer border border-[#41FFEE] rounded-xl p-6 text-center transition-all hover:bg-white/10 hover:border-blue-400/50">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400">
                  Update Tournament
                </h3>
                <p className="text-sm text-gray-300">
                  Update team rankings and points after a tournament.
                </p>
              </div>
            </Anchor>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
