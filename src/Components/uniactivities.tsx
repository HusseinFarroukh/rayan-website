"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust path as needed

interface University {
  id: string;
  name: string;
  image?: string;
}

export default function UniActivities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch universities from Firestore
  const fetchUniversities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "universities"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<University, "id">),
      }));
      setUniversities(data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Filter only universities that have images and duplicate for seamless marquee
  const universitiesWithImages = universities.filter((uni) => uni.image);
  const marqueeUniversities = [
    ...universitiesWithImages,
    ...universitiesWithImages,
  ];

  // Don't display anything if no universities with images
  if (loading) {
    return null; // or you can return a loading spinner
  }

  if (universitiesWithImages.length === 0) {
    return null; // Don't display anything if no images
  }

  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="overflow-hidden relative h-24 flex items-center">
          <div
            className="flex animate-marquee gap-8"
            style={{ minWidth: "max-content" }}
          >
            {marqueeUniversities.map((uni, idx) => (
              <span key={uni.id + idx} className="relative inline-block">
                <Image
                  src={uni.image!}
                  alt={uni.name}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </span>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 18s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
