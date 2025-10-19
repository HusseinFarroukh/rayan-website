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
    setMenuOpen(false); // Close menu on sign out
    router.push("/");
  };

  const username = user?.displayName
    ? user.displayName
    : user?.email
    ? user.email.split("@")[0]
    : "";

  return (
    <header className="w-full flex justify-center mt-4 sm:mt-6 px-3 sm:px-4">
      <nav className="bg-white shadow-lg rounded-2xl sm:rounded-full flex items-center px-4 sm:px-6 lg:px-8 py-3 gap-3 sm:gap-6 lg:gap-8 w-full max-w-6xl relative">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={50}
            className="object-contain w-24  h-6 sm:w-28 h-7 md:w-32 h-8 lg:w-50 h-10"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden sm:flex flex-1 items-center gap-4 lg:gap-6 justify-center">
          <li>
            <a
              className="px-4 py-2 rounded-lg font-medium bg-[#020d2b] text-white hover:bg-[#1a2d4d] transition text-sm lg:text-base"
              href="#"
            >
              Home
            </a>
          </li>
          <li>
            <a
              className="px-4 py-2 rounded-lg font-medium text-[#020d2b] hover:bg-gray-100 transition text-sm lg:text-base"
              href="/activities"
            >
              Activities Dashboard
            </a>
          </li>
        </ul>

        {/* Desktop User Section */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4 ml-auto">
          {user ? (
            <>
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-[#020d2b] font-medium text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-32 lg:max-w-40">
                {username}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-400 transition text-sm lg:text-base whitespace-nowrap"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              className="px-5 py-2.5 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition text-sm lg:text-base whitespace-nowrap"
              href="/auth"
            >
              Sign In
            </a>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="sm:hidden ml-auto flex-shrink-0"
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

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 sm:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-50 flex flex-col items-stretch gap-3 py-4 px-4 sm:hidden border border-gray-200">
              {/* Mobile Navigation Links */}
              <a
                className="px-4 py-3 rounded-xl font-medium bg-[#020d2b] text-white text-center text-base"
                href="#"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </a>
              <a
                className="px-4 py-3 rounded-xl font-medium text-[#020d2b] hover:bg-gray-100 text-center text-base border border-gray-200"
                href="/activities"
                onClick={() => setMenuOpen(false)}
              >
                Activities Dashboard
              </a>

              {/* Mobile User Section - Stacked with smaller text */}
              <div className="border-t border-gray-200 pt-3 mt-1">
                {user ? (
                  <div className="flex flex-col gap-2">
                    {/* Username with smaller text */}
                    <div className="px-3 py-2 rounded-lg bg-gray-100 text-[#020d2b] text-center text-sm font-medium">
                      {username}
                    </div>
                    {/* Sign Out with smaller text */}
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-400 transition text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <a
                    className="px-4 py-3 rounded-xl bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition text-center text-base block"
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
