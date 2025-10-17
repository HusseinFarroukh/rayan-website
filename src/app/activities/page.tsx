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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#020d2b]">
              {sectionTitle}
            </h1>
            <p className="text-gray-600 mt-2">{sectionDesc}</p>
          </div>

          {/* Filters Section */}
          <div className="mb-8 bg-gray-50 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#020d2b] focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
              <div className="w-full md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#020d2b] focus:border-transparent bg-white"
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
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredActivities.length} of {activities.length}{" "}
              activities
              {(searchTerm || selectedCategory !== "all") && (
                <span className="ml-2">
                  •{" "}
                  <button
                    onClick={resetFilters}
                    className="text-[#020d2b] hover:underline font-medium"
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Activities Cards */}
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No activities found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No activities have been added yet."}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#020d2b] hover:bg-gray-800 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredActivities.map((activity) => {
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

                      {/* Short Description */}
                      <p className="text-gray-600 text-center mb-2 line-clamp-3 flex-grow">
                        {activity.shortDescription ??
                          activity.description?.slice(0, 100)}
                      </p>

                      {/* Category Display */}
                      {categoryName && (
                        <div className="mb-4 text-center">
                          <span className="inline-block bg-[#020d2b] text-white px-3 py-1 rounded-full text-sm font-medium">
                            {categoryName}
                          </span>
                        </div>
                      )}

                      {/* Read More Button */}
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
          )}
        </div>
      </main>

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

      <Footer />
    </div>
  );
}
