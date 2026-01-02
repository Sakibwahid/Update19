import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase/config";
import { doc, getDoc, db } from "../lib/firebase/config";
import { useEffect } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();


useEffect(() => {
  const fetchAdminData = async () => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // No Firestore user doc → kick out
    if (!userDoc.exists()) {
      navigate("/login");
      return;
    }

    const data = userDoc.data();

    if (data.role !== "admin") {
      navigate("/login");
      return;
    }


    setUserData(data);
  };

  fetchAdminData();
}, [navigate]);

  
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6">
      <h1 className="text-4xl font-semibold">Admin Dashboard</h1>

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
