"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const auth = getAuth(app);

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, [auth]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const username = user?.displayName
    ? user.displayName
    : user?.email
    ? user.email.split("@")[0]
    : "";

  return (
    <header className="w-full flex justify-center mt-6">
      <nav className="bg-white shadow-lg rounded-full flex items-center px-4 sm:px-8 py-3 gap-4 sm:gap-8 w-[98vw] max-w-6xl relative">
        <div className="flex items-center gap-2">
          {/* Logo Image */}
          <Image
            src="/logo.png"
            alt="Logo"
            width={129}
            height={40}
            className="object-contain w-16 h-5 sm:w-20 h-6 md:w-32 h-10 lg:w-40 h-12"
          />
        </div>

        {/* Hamburger for mobile */}
        <button
          className="sm:hidden ml-auto"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-7 h-7 text-[#020d2b]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex flex-1 items-center gap-6 justify-center">
          <li>
            <a
              className="px-4 py-2 rounded-lg font-medium bg-[#020d2b] text-white"
              href="#"
            >
              Home
            </a>
          </li>
          <li>
            <a
              className="px-4 py-2 rounded-lg font-medium text-[#020d2b] hover:bg-gray-100"
              href="/activities"
            >
              Activities Dashboard
            </a>
          </li>
        </ul>

        {/* Right side: show username if logged in, otherwise show Sign In */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-[#020d2b] font-medium">
                {username}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-400 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              className="px-6 py-2 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition"
              href="/auth"
            >
              Sign In
            </a>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white rounded-b-2xl shadow-lg z-20 flex flex-col items-center gap-2 py-4 sm:hidden">
            <a
              className="px-4 py-2 rounded-lg font-medium bg-[#020d2b] text-white w-11/12 text-center"
              href="#"
            >
              Home
            </a>
            <a
              className="px-4 py-2 rounded-lg font-medium text-[#020d2b] hover:bg-gray-100 w-11/12 text-center"
              href="/activities"
            >
              Activities Dashboard
            </a>

            {user ? (
              <>
                <div className="w-11/12 text-center px-4 py-2 rounded bg-gray-100 text-[#020d2b]">
                  {username}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-400 transition w-11/12"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <a
                className="px-6 py-2 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition w-11/12 text-center"
                href="/auth"
              >
                Sign In
              </a>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
