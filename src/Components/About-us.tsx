"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AboutUs() {
  const [AboutusData, setAboutusData] = useState<{
    Title: string;
    Description: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Aboutus"), (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setAboutusData({
          Title: doc.data().Title,
          Description: doc.data().Description,
        });
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex flex-col items-center md:items-start">
          <Image
            src="/about-image.jpg"
            alt="About Project Connect Forum"
            width={320}
            height={320}
            className="rounded-2xl object-cover mb-6"
          />
        </div>
        <div className="md:w-2/3">
          <h2 className="text-3xl text-[#020d2b] md:text-4xl font-extrabold mb-6">
            {AboutusData?.Title}
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            {AboutusData?.Description}
          </p>
        </div>
      </div>
    </section>
  );
}
