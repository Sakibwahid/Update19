import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/ui/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlayerDetails from "./components/player/PlayerDetails";
import AuctionSection from "./components/auction/AuctionSection";
import AdminAuctionControl from "./components/auction/AdminAuctionControl";
import UpdateTournament from "./components/Tournament/UpdateTournament";
import TournamentStats from "./components/Tournament/TournamentStats";
import PlayerTableAssign from "./components/Squads/PlayerTableAssign";
import DisplaySquad from "./components/Squads/DisplaySquad";
import SquadBuilder from "./components/Squads/SquadBuilder";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();


function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router>
        <div className="flex flex-col md:flex-row md:justify-between min-h-screen bg-linear-to-t from-[#1D5AD0] to-[#0c368a]">
          <div className='fixed inset-0 bg-[url("/png.webp")] bg-no-repeat bg-cover opacity-60'></div>
          <div>
            <Navbar></Navbar>
          </div>
          <div className="flex-1 relative min-h-screen md:block flex justify-center items-center overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} /> 
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/user"
                element={
                  <ProtectedRoute role={["user"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
                <Route
                path="/squadupdate"
                element={
                  <ProtectedRoute role={["user", "admin"]}>
                    <PlayerTableAssign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/auction"
                element={
                  <ProtectedRoute role={["admin"]}>
                    <AdminAuctionControl />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/updatetournament"
                element={
                  <ProtectedRoute role={["admin"]}>
                    <UpdateTournament />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/player-details"
                element={
                  <ProtectedRoute role={["user", "admin"]}>
                    <PlayerDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/auction" element={<AuctionSection />} />
              
              <Route
                path="/tournamentstats"
                element={
                  <ProtectedRoute role={["user", "admin"]}>
                    <TournamentStats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/squad"
                element={
                  <ProtectedRoute role={["user", "admin"]}>
                    <DisplaySquad />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/buildsquad"
                element={
                  <ProtectedRoute role={["user", "admin"]}>
                    <SquadBuilder />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
