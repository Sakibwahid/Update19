import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlayerDetails from "./components/player/PlayerDetails";
import { Navbar } from "./components/ui/Navbar";
import AuctionSection from "./components/auction/AuctionSection";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col md:flex-row md:justify-between min-h-screen bg-linear-to-t from-[#1D5AD0] to-[#0c368a]">
          <div className='fixed inset-0 bg-[url("/png.png")] bg-no-repeat bg-cover opacity-60'></div>
          <div>
            <Navbar></Navbar>
          </div>
          <div className="flex-1 relative h-screen md:block flex justify-center items-center overflow-y-scroll">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/player-details" element={<PlayerDetails />} />
            <Route path="/auction" element={<AuctionSection />} />
          </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
