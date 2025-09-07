// src/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
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
          name: user.displayName || "",
          photo: user.photoURL || "",
        }),
      });
    } catch (err) {
      console.error("Error syncing user to backend:", err);
    }
  };

  // ✅ Handle Google redirect result after returning from Google
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log("Google Login successful:", result.user);
          await syncUserToBackend(result.user);
          navigate("/");
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [navigate]);

  // ✅ Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserToBackend(result.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Google login (redirect version)
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
            className="bg-red-500 hover:bg-red-600 py-2 rounded"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 hover:bg-blue-600 w-full py-2 rounded"
        >
          Continue with Google
        </button>

        {/* Redirect to Signup */}
        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <span
            className="text-red-400 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
