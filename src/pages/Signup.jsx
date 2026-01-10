import React, { useState } from "react";
import { LockKeyhole, Mail, User } from "lucide-react";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/Password";
import { Button } from "../components/ui/Button";
import { Anchor } from "../components/ui/Anchor";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase/config";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [lengthError, setLengthError] = useState(false);
  const [teamName, setTeamName] = useState("");

  const navigate = useNavigate();

const handleSignup = async (e) => {
  e.preventDefault();
  setError("");

  if (password.length < 6) {
    setLengthError(true);
    return;
  }

  try {
    // Create Firebase Auth user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      username,
      teamName,
      role: "user",
      isApproved: false, // initially not verified
      createdAt: serverTimestamp(),
    });

    // Redirect to dashboard immediately
    navigate("/user"); // your user dashboard route

  } catch (err) {
    setError(err.message);
  }
};


  return (
    <div className="p-2 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-md flex flex-col gap-6 justify-center items-center
        backdrop-blur-xl bg-black border border-white/20 shadow-lg
        rounded-2xl px-6 py-10"
      >
        {/* Title */}
        <div className="text-center">
          <Text variant="heading" className="text-white text-3xl font-semibold">
            Create Your Account
          </Text>
          <Text className="mt-2 text-gray-200 text-sm">
            Sign up to get started
          </Text>
        </div>

        {error && <Text className="text-red-500 text-sm">{error}</Text>}

        <form className="w-[80%] flex flex-col gap-5" onSubmit={handleSignup}>
          <Input
            type="text"
            placeholder="Username"
            icon={<User size={18} color="white" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Email"
            icon={<Mail size={18} color="white" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="text-white w-full block border border-gray-400 px-4 py-2 rounded-lg bg-transparent appearance-none"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          >
            <option value="" disabled>Select Team Name</option>
            <option value="FC Bayern Munich">FC Bayern Munich</option>
            <option value="Manchester City F.C.">Manchester City F.C.</option>
            <option value="Wolverhampton Wanderers F.C.">Wolverhampton Wanderers F.C.</option>
            <option value="Liverpool FC">Liverpool FC</option>
            <option value="Manchester United F.C.">Manchester United F.C.</option>
            <option value="Chelsea F.C.">Chelsea F.C.</option>
            <option value="Arsenal F.C.">Arsenal F.C.</option>
            <option value="Real Madrid C.F.">Real Madrid C.F.</option>
          </select>
          
          <PasswordInput
            placeholder="Password"
            icon={<LockKeyhole size={18} color="white" />}
            error={lengthError && "Password must be at least 6 characters"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLengthError(e.target.value.length < 6);
            }}
          />

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-3"
          >
            Sign Up
          </Button>
        </form>

        {/* Link to login */}
        <Text className="mt-4 text-gray-300 text-sm">
          Already have an account?{" "}
          <Anchor to="/login" className="text-indigo-300 hover:text-indigo-400">
            Log in
          </Anchor>
        </Text>
      </div>
    </div>
  );
};

export default Signup;
