import React, { useState } from "react";
import { auth, db, storage } from "../lib/firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleUploadPhotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const playerId = file.name.split(".")[0]; // assuming file name = player ID.jpg

      try {
        const storageRef = ref(storage, `players/${file.name}`);
        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        // Update Firestore with photo URL
        const playerDocRef = doc(db, "players", playerId);
        await updateDoc(playerDocRef, { Photo: url });

        setProgress(Math.floor(((i + 1) / total) * 100));
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploading(false);
    alert("All photos uploaded successfully!");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6">
      <h1 className="text-4xl font-semibold">Admin Dashboard</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUploadPhotos}
        className="mb-4"
      />

      {uploading && <p>Uploading: {progress}%</p>}

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
