"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
const auth = getAuth();
import { doc, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = isLogin ? loginData.email : signupData.email;
    const password = isLogin ? loginData.password : signupData.password;
    const fullName = signupData.fullName;
    const username = signupData.username;

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        router.push("/"); // redirect to home after login
      } else {
        // Signup logic
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: fullName });

        // Save extra info in Firestore
        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          username: username,
          email: email,
          createdAt: new Date(),
        });

        alert("Account created successfully!");
        router.push("/"); // redirect to home after signup
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="bg-red-500 text-white text-center py-2">{error}</div>
        )}

        {/* Login Section */}
        <div className={`p-8 ${isLogin ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-white">
              Welcome back
            </h2>
            <p className="text-gray-400 text-center mt-2">
              Sign in to your account
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Signup Section */}
        <div className={`p-8 ${!isLogin ? "block" : "hidden"}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-white">
              Join us
            </h2>
            <p className="text-gray-400 text-center mt-2">
              Create your account
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={signupData.fullName}
              onChange={(e) =>
                setSignupData({ ...signupData, fullName: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={signupData.username}
              onChange={(e) =>
                setSignupData({ ...signupData, username: e.target.value })
              }
              required
            />

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
