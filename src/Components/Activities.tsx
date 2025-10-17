"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Activity {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  link?: string;
  image?: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  useEffect(() => {
    // Fetch categories
    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Category, "id">),
        }));
        setCategories(categoryData);
      }
    );

    // Fetch all activities
    const unsubscribeActivities = onSnapshot(
      collection(db, "activities"),
      (snapshot) => {
        const data = snapshot.docs
          .filter((doc) => doc.id !== "activitiesTitle")
          .map((doc) => ({ ...(doc.data() as Activity), id: doc.id }));
        setActivities(data);
      }
    );

    // Fetch section title & description
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
      unsubscribeCategories();
      unsubscribeActivities();
      unsubscribeTitle();
    };
  }, []);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : null;
  };

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
          {activities.map((activity) => {
            const categoryName = getCategoryName(activity.category);

            return (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all overflow-hidden flex flex-col"
              >
                {/* Activity Image */}
                {activity.image ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-xl text-[#020d2b] font-bold mb-2 text-center">
                    {activity.title}
                  </h3>

                  {/* Short Description for card */}
                  <p className="text-gray-600 text-center mb-2 line-clamp-3 flex-grow">
                    {activity.shortDescription}
                  </p>

                  {/* Category Display */}
                  {categoryName && (
                    <div className="mb-4 text-center">
                      <span className="inline-block bg-[#020d2b] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {categoryName}
                      </span>
                    </div>
                  )}

                  {/* Button to open modal */}
                  <button
                    onClick={() => setSelectedActivity(activity)}
                    className="bg-[#020d2b] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition mt-auto"
                  >
                    Read More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              &times;
            </button>

            {/* Modal Image */}
            {selectedActivity.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={selectedActivity.image}
                  alt={selectedActivity.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <h3 className="text-2xl font-bold mb-4">
              {selectedActivity.title}
            </h3>

            {/* Category in Modal */}
            {selectedActivity.category && (
              <div className="mb-3">
                <span className="inline-block bg-[#020d2b] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {getCategoryName(selectedActivity.category)}
                </span>
              </div>
            )}

            <p className="text-gray-700 mb-4">{selectedActivity.description}</p>
            {selectedActivity.link && (
              <a
                href={selectedActivity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-[#020d2b] font-medium hover:underline"
              >
                Visit Link →
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
