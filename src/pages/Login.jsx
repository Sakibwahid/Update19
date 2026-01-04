import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/Password";
import { Button } from "../components/ui/Button";
import { Anchor } from "../components/ui/Anchor";

import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lengthError, setLengthError] = useState(false);

  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  // 🔁 Redirect AFTER auth + Firestore data is ready
  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    }
  }, [user, userData, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setLengthError(true);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthContext handles state + redirect
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="p-2 min-h-screen flex justify-center items-center">
      <div
        className="w-full max-w-md flex flex-col gap-6 justify-center items-center
        backdrop-blur-xl bg-black border border-white/20 shadow-lg
        rounded-2xl px-6 py-10"
      >
        {/* Title */}
        <div className="text-center">
          <Text variant="heading" className="text-white text-3xl font-semibold">
            Welcome Back
          </Text>
          <Text className="mt-2 text-gray-200 text-sm">
            Please sign in to your account
          </Text>
        </div>

        {error && <Text className="text-red-500 text-sm">{error}</Text>}

        {/* Form */}
        <form className="w-[80%] flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} color="white" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            placeholder="Enter your password"
            icon={<LockKeyhole size={18} color="white" />}
            error={lengthError && "Password must be at least 6 characters"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLengthError(e.target.value.length < 6);
            }}
          />

          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded-full" />
              Remember me
            </label>
            <Anchor to="#" className="text-indigo-300 hover:text-indigo-400">
              Forgot password?
            </Anchor>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-3"
          >
            Sign In
          </Button>
          <Text className="mt-4 text-gray-300 text-sm text-center">
            Don’t have an account?{" "}
            <Anchor
              to="/signup"
              className="text-indigo-300 hover:text-indigo-400"
            >
              Sign up
            </Anchor>
          </Text>
        </form>
      </div>
    </div>
  );
};

export default Login;
