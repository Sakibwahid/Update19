import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import PlayerDetails from "./components/player/PlayerDetails";

function App() {
  return (
    <AuthProvider>
      <div className="bg-blue-900 min-h-screen text-black">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/player-details" element={<PlayerDetails />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

