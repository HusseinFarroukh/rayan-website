"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Image from "next/image";
import ActivitiesSearch from "@/Components/ActivitiesSearch"; // new search component

interface Activity {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  link?: string;
  category?: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
}

interface CategoryNode extends Category {
  level: number;
  children: CategoryNode[];
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionTitle, setSectionTitle] = useState("Activities");
  const [sectionDesc, setSectionDesc] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal state
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Fetch categories
  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const categoryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Category, "id">),
        }));
        setCategories(categoryData);
      }
    );
    return () => unsubCategories();
  }, []);

  // Fetch activities
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activities"), (snapshot) => {
      const items = snapshot.docs
        .filter((d) => d.id !== "activitiesTitle")
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Activity, "id">) }));
      setActivities(items);
      setLoading(false);
    });

    (async () => {
      try {
        const titleDoc = await getDoc(doc(db, "activities", "activitiesTitle"));
        if (titleDoc.exists()) {
          const data = titleDoc.data() as {
            title?: string;
            description?: string;
          };
          if (data.title) setSectionTitle(data.title);
          if (data.description) setSectionDesc(data.description);
        }
      } catch (err) {
        console.error("Failed to load activities title:", err);
      }
    })();

    return () => unsub();
  }, []);

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : null;
  };

  const buildCategoryTree = (
    categories: Category[]
  ): (Category & { level: number })[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, level: 0, children: [] });
    });

    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (!node) return;
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          node.level = parent.level + 1;
          parent.children.push(node);
        } else rootCategories.push(node);
      } else rootCategories.push(node);
    });

    const flattenTree = (
      nodes: CategoryNode[],
      result: (Category & { level: number })[] = []
    ): (Category & { level: number })[] => {
      nodes.forEach((node) => {
        const { children, ...nodeData } = node;
        result.push({ ...nodeData, level: node.level });
        if (children.length > 0) flattenTree(children, result);
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  const categoryTree = buildCategoryTree(categories);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.shortDescription
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || activity.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activities, searchTerm, selectedCategory]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const closeModal = () => {
    setSelectedActivity(null);
    document.body.style.overflow = "unset";
  };

  const openModal = (activity: Activity) => {
    setSelectedActivity(activity);
    document.body.style.overflow = "hidden";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-8 sm:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#020d2b] mb-2 sm:mb-3">
              {sectionTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              {sectionDesc}
            </p>
          </div>

          {/* Search and Filters Component */}
          <ActivitiesSearch
            categories={categoryTree}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            resetFilters={resetFilters}
            filteredCount={filteredActivities.length}
            totalCount={activities.length}
          />

          {/* Activities Cards */}
          {!loading && filteredActivities.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">
                No activities found
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredActivities.map((activity) => {
                const categoryName = getCategoryName(activity.category);
                return (
                  <div
                    key={activity.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow hover:shadow-lg flex flex-col overflow-hidden border border-gray-100"
                  >
                    {activity.image ? (
                      <div className="h-32 sm:h-40 lg:h-48 overflow-hidden relative">
                        <Image
                          src={activity.image}
                          alt={activity.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-32 sm:h-40 lg:h-48 bg-gray-200 flex items-center justify-center" />
                    )}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-[#020d2b] mb-2 text-center line-clamp-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 text-center mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 flex-grow text-xs sm:text-sm">
                        {activity.shortDescription ??
                          activity.description?.slice(0, 100)}
                      </p>
                      {categoryName && (
                        <div className="mb-3 sm:mb-4 text-center">
                          <span className="inline-flex items-center text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            {categoryName}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => openModal(activity)}
                        className="bg-gradient-to-br from-[#020d2b] to-[#1b7a49] text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl mt-auto w-full"
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal */}
          {selectedActivity && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
                >
                  &times;
                </button>
                {selectedActivity.image && (
                  <div className="mb-4 rounded-lg overflow-hidden relative h-64">
                    <Image
                      src={selectedActivity.image}
                      alt={selectedActivity.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-4">
                  {selectedActivity.title}
                </h3>
                {selectedActivity.category && (
                  <div className="mb-3">
                    <span className="inline-flex items-center text-black px-3 py-1 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {getCategoryName(selectedActivity.category)}
                    </span>
                  </div>
                )}
                <p className="text-gray-700 mb-4">
                  {selectedActivity.description}
                </p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
