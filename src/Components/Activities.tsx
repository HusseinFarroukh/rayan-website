"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Activity {
  id: string;
  title: string;
  description: string;
  link?: string;
  image?: string; // optional field for local/static images
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");

  useEffect(() => {
    // Listen for activities (real-time updates)
    const unsubscribeActivities = onSnapshot(
      collection(db, "activities"),
      (snapshot) => {
        const data = snapshot.docs
          .filter((doc) => doc.id !== "activitiesTitle") // exclude title doc
          .map((doc) => ({ ...(doc.data() as Activity), id: doc.id }));
        setActivities(data);
      }
    );

    // Listen for section title and description
    const unsubscribeTitle = onSnapshot(
      doc(db, "activities", "activitiesTitle"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as { title: string; description: string };
          setSectionTitle(data.title);
          setSectionDesc(data.description);
        }
      }
    );

    return () => {
      unsubscribeActivities();
      unsubscribeTitle();
    };
  }, []);

  // Static local images (no database)
  {
    /* Images for activities
  const staticImages = [
    "/images/activity1.jpg",
    "/images/activity2.jpg",
    "/images/activity3.jpg",
    "/images/activity4.jpg",
    "/images/activity5.jpg",
    "/images/activity6.jpg",
  ];
  */
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl text-[#020d2b] font-extrabold text-center mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl">
            {sectionDesc}
          </p>
        </div>

        {/* Activities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all p-6 flex flex-col items-center"
            >
              {/* Image 
              <img
                src={staticImages[index % staticImages.length]} // cycle through static images
                alt={activity.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              */}

              {/* Title */}
              <h3 className="text-xl text-[#020d2b] font-bold mb-2 text-center">
                {activity.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mb-4">
                {activity.description}
              </p>

              {/* Optional link */}
              {activity.link && (
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-2 text-[#020d2b] font-medium hover:underline"
                >
                  Read More →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
