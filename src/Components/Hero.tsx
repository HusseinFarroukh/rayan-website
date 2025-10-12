"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Hero() {
  const [heroData, setHeroData] = useState<{
    title: string;
    subtitle: string;

    description: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "home", "hero"), (snapshot) => {
      if (snapshot.exists()) {
        setHeroData({
          title: snapshot.data().title,
          subtitle: snapshot.data().subtitle,
          description: snapshot.data().description,
        });
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);
  return (
    <section className="flex bg-white flex-col items-center justify-center py-20">
      <h1 className="text-5xl sm:text-7xl font-extrabold text-center pb-6 bg-gradient-to-br from-[#020d2b] to-[#1b7a49] bg-clip-text text-transparent drop-shadow-xl">
        {heroData?.title} <br />
        {heroData?.subtitle}
      </h1>
      <p className="text-xl text-gray-600 text-center mb-10 max-w-2xl">
        {heroData?.description}
      </p>
      <div className="w-full max-w-xl mt-2 flex justify-center">
        <form className="w-full">
          <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
            <input
              type="text"
              placeholder="Search for extracurriculars..."
              className="flex-1 bg-transparent outline-none px-2 py-2 text-lg"
            />
            <button
              type="submit"
              className="ml-2 px-6 py-2 rounded-full bg-[#020d2b] text-white font-semibold shadow hover:bg-[#69959e] transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
