"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Hero() {
  const [heroData, setHeroData] = useState<{
    title: string;
    subtitle: string;
    description: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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

    return () => unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/activities?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <section className="flex bg-white flex-col items-center justify-center py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      {/* Static Cover Image - Covering entire section */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/cover.png"
          alt="Hero background"
          className="object-cover w-full h-full"
          fill
          priority
        />
      </div>
      {/* Hero Text */}
      <div className="text-center bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-block max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold pb-4 sm:pb-6 bg-gradient-to-br from-white to-white bg-clip-text text-transparent drop-shadow-xl leading-tight">
          {heroData?.title}
          {heroData?.subtitle && (
            <>
              <br className="hidden sm:block" />
              <span className="block mt-2 sm:mt-0">{heroData.subtitle}</span>
            </>
          )}
        </h1>

        <p className="text-sm relative sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          {heroData?.description}
        </p>
      </div>

      {/* Search Form */}
      <div className="w-full relative max-w-md sm:max-w-lg lg:max-w-xl mt-4 sm:mt-6">
        <form className="w-full" onSubmit={handleSearch}>
          <div className="flex flex-col sm:flex-row items-center bg-white rounded-2xl sm:rounded-full shadow-lg border border-gray-200 px-4 py-3 sm:px-6 sm:py-3 gap-3 sm:gap-0">
            <input
              type="text"
              placeholder="Search for extracurriculars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none px-2 py-2 sm:py-3 text-base sm:text-lg w-full text-center sm:text-left text-[#020d2b]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-gradient-to-br from-[#020d2b] to-[#1b7a49] text-white font-semibold shadow hover:bg-[#69959e] transition text-base sm:text-lg whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
