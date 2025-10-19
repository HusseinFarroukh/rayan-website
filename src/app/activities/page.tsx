"use client";

import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { useSearchParams } from "next/navigation";

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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionTitle, setSectionTitle] = useState("Activities");
  const [sectionDesc, setSectionDesc] = useState("");
  const [loading, setLoading] = useState(true);

  // Get search query from URL
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialSearch);
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

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string | undefined) => {
    if (!categoryId) return null;
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : null;
  };

  // Helper function to build category tree
  const buildCategoryTree = (
    categories: Category[]
  ): (Category & { level: number })[] => {
    const categoryMap = new Map();
    const rootCategories: (Category & {
      level: number;
      children: Category[];
    })[] = [];

    // Initialize all categories with level and children
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        level: 0,
        children: [],
      });
    });

    // Build the tree structure
    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          categoryNode.level = parent.level + 1;
          parent.children.push(categoryNode);
        } else {
          // If parent doesn't exist, treat as root
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Flatten the tree for display
    const flattenTree = (
      nodes: (Category & { level: number; children: Category[] })[],
      result: (Category & { level: number })[] = []
    ) => {
      nodes.forEach((node) => {
        // Create a new object without children property
        const { children, ...nodeData } = node;
        result.push({ ...nodeData, level: node.level });

        if (children.length > 0) {
          flattenTree(children, result);
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  // Build category tree for display
  const categoryTree = buildCategoryTree(categories);

  // Filter activities based on search term and selected category
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Search filter
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.shortDescription
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || activity.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [activities, searchTerm, selectedCategory]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  // Close modal
  const closeModal = () => {
    setSelectedActivity(null);
    document.body.style.overflow = "unset";
  };

  // Open modal
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

          {/* Filters Section */}
          <div className="mb-6 sm:mb-8 bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 sm:p-3 pl-9 sm:pl-10 pr-8 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#020d2b] focus:border-transparent text-sm sm:text-base"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
                    >
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48 lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#020d2b] focus:border-transparent bg-white text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  {categoryTree.map((category) => (
                    <option key={category.id} value={category.id}>
                      {"-".repeat(category.level)} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={resetFilters}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1 sm:gap-2">
              <span>
                Showing {filteredActivities.length} of {activities.length}{" "}
                activities
              </span>
              {(searchTerm || selectedCategory !== "all") && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <button
                    onClick={resetFilters}
                    className="text-[#020d2b] hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#020d2b] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading activities...</p>
            </div>
          )}

          {/* Activities Cards */}
          {!loading && filteredActivities.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg
                className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                No activities found
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No activities have been added yet."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={resetFilters}
                  className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-[#020d2b] hover:bg-gray-800 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            !loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredActivities.map((activity) => {
                  const categoryName = getCategoryName(activity.category);

                  return (
                    <div
                      key={activity.id}
                      className="bg-white rounded-xl sm:rounded-2xl shadow hover:shadow-lg sm:hover:shadow-2xl transition-all overflow-hidden flex flex-col border border-gray-100"
                    >
                      {/* Activity Image */}
                      {activity.image ? (
                        <div className="h-32 sm:h-40 lg:h-48 overflow-hidden">
                          <img
                            src={activity.image}
                            alt={activity.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-32 sm:h-40 lg:h-48 bg-gray-200 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400"
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
                      <div className="p-4 sm:p-6 flex flex-col flex-grow">
                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-[#020d2b] mb-2 text-center line-clamp-2">
                          {activity.title}
                        </h3>

                        {/* Short Description */}
                        <p className="text-gray-600 text-center mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 flex-grow text-xs sm:text-sm">
                          {activity.shortDescription ??
                            activity.description?.slice(0, 100)}
                        </p>

                        {/* Category Display */}
                        {categoryName && (
                          <div className="mb-3 sm:mb-4 text-center">
                            <span className="inline-block bg-[#020d2b] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                              {categoryName}
                            </span>
                          </div>
                        )}

                        {/* Read More Button */}
                        <button
                          onClick={() => openModal(activity)}
                          className="bg-[#020d2b] text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-gray-800 transition mt-auto text-sm sm:text-base w-full"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-800 font-bold text-xl sm:text-2xl z-10 bg-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-sm"
            >
              &times;
            </button>

            {/* Modal Image */}
            {selectedActivity.image && (
              <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                <img
                  src={selectedActivity.image}
                  alt={selectedActivity.title}
                  className="w-full h-40 sm:h-48 lg:h-56 object-cover"
                />
              </div>
            )}

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-[#020d2b] pr-6">
              {selectedActivity.title}
            </h3>

            {/* Category in Modal */}
            {selectedActivity.category && (
              <div className="mb-3 sm:mb-4">
                <span className="inline-block bg-[#020d2b] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {getCategoryName(selectedActivity.category)}
                </span>
              </div>
            )}

            <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              {selectedActivity.description}
            </p>

            {selectedActivity.link && (
              <a
                href={selectedActivity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#020d2b] font-medium hover:underline text-sm sm:text-base"
              >
                Visit Link
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
