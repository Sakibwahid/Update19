import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
const { firebaseConfig } = require("./lib/firebase/config"); // ✅ Import from your config file

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapping from short name → full name
const renameMap = {
  City: "Manchester City F.C.",
  ManU: "Manchester United F.C.",
  Bayern: "FC Bayern Munich",
  Liverpool: "Liverpool F.C.",
  Wolves: "Wolverhampton Wanderers F.C.",
};

async function renameDocs() {
  for (const [shortName, fullName] of Object.entries(renameMap)) {
    const oldRef = doc(db, "teams", shortName);
    const newRef = doc(db, "teams", fullName);

    const oldSnap = await getDoc(oldRef);

    if (!oldSnap.exists()) {
      console.log(`Document ${shortName} does not exist, skipping.`);
      continue;
    }

    // Check if new doc already exists
    const newSnap = await getDoc(newRef);
    if (newSnap.exists()) {
      console.log(`Document ${fullName} already exists, skipping.`);
      continue;
    }

    // Copy old data to new doc
    await setDoc(newRef, oldSnap.data());
    // Delete old doc
    await deleteDoc(oldRef);

    console.log(`Renamed ${shortName} → ${fullName}`);
  }

  console.log("All documents processed.");
}

// Run the script
renameDocs().catch(console.error);

