"use client";
import { useState } from "react";
// import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full flex justify-center mt-6">
      <nav className="bg-white shadow-lg rounded-full flex items-center px-4 sm:px-8 py-3 gap-4 sm:gap-8 w-[98vw] max-w-6xl relative">
        <div className="flex items-center gap-2">
          {/* <Image
            src="/logo.png"
            alt="Project Connect Forum Logo"
            width={32}
            height={32}
          /> */}
          <span className="font-bold text-xl">LOGO</span>
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
              href="#"
            >
              Activities Dashboard
            </a>
          </li>
        </ul>
        <a
          className="hidden sm:inline-block ml-auto px-6 py-2 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition"
          href="#"
        >
          Sign In
        </a>
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
              href="#"
            >
              Activities Dashboard
            </a>
            <a
              className="px-6 py-2 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition w-11/12 text-center"
              href="#"
            >
              Sign In
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
