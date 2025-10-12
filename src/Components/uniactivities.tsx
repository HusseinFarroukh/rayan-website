"use client";
import Image from "next/image";

export default function UniActivities() {
  const universities = [
    { name: "AUB", image: "/aub.png" },
    { name: "LAU", image: "/lau.png" },
    { name: "Notre Dame University", image: "/ndu.png" },
    { name: "USJ", image: "/usj.png" },
    { name: "BAU", image: "/bau.png" },
    { name: "LU", image: "/lu.png" },
  ];

  // Duplicate the array to ensure seamless looping
  const marqueeUniversities = [...universities, ...universities];

  return (
    <section className=" w-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="overflow-hidden relative h-24 flex items-center">
          <div
            className="flex animate-marquee gap-8"
            style={{ minWidth: "max-content" }}
          >
            {marqueeUniversities.map((uni, idx) => (
              <span key={uni.name + idx} className="relative inline-block">
                <Image
                  src={uni.image}
                  alt={uni.name}
                  width={200}
                  height={200}
                  className=" object-contain"
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
