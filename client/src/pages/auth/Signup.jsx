// src/pages/Signup.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,   // ✅ popup instead of redirect
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Helper: Sync user to backend
  const syncUserToBackend = async (user) => {
    try {
      await fetch("http://localhost:5000/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || username,
          photo: user.photoURL || "",
        }),
      });
    } catch (err) {
      console.error("Error syncing user to backend:", err);
    }
  };

  // ✅ Email/Password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: username,
      });

      await syncUserToBackend(userCredential.user);

      console.log("User created with username:", username);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Google signup (popup version)
  const handleGoogleSignup = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider); // 👈 popup here
      console.log("Google Sign-In successful:", result.user);

      await syncUserToBackend(result.user);

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="p-2 rounded text-black"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 py-2 rounded"
          >
            Signup
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="bg-red-500 hover:bg-red-600 py-2 rounded w-full"
        >
          Sign up with Google
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-400 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
