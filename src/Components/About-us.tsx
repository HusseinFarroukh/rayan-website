"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AboutUsData {
  Title: string;
  Description: string;
  image?: string;
}

export default function AboutUs() {
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Aboutus"), (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAboutUsData({
          Title: data.Title,
          Description: data.Description,
          image: data.image, // Get the image URL from Firestore
        });
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Function to get image source - use uploaded image if available, otherwise fallback
  const getImageSrc = () => {
    if (aboutUsData?.image) {
      return aboutUsData.image; // Use the uploaded image from Supabase
    }
    return "/about-image.jpg"; // Fallback to static image
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">
          {/* Image Section */}
          <div className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full">
              <Image
                src={getImageSrc()}
                alt="About Project Connect Forum"
                width={400}
                height={400}
                className="rounded-2xl object-cover w-full h-auto shadow-lg"
                priority
                onError={(e) => {
                  // If uploaded image fails to load, fallback to static image
                  const target = e.target as HTMLImageElement;
                  target.src = "/about-image.jpg";
                }}
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-[#020d2b] mb-4 sm:mb-6 lg:mb-8 leading-tight">
              {aboutUsData?.Title || "About Us"}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed sm:leading-loose">
              {aboutUsData?.Description || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
