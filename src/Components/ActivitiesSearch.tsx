"use client";
import React from "react";

interface Category {
  id: string;
  name: string;
  level: number;
}

interface Props {
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const ActivitiesSearch: React.FC<Props> = ({
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  resetFilters,
  filteredCount,
  totalCount,
}) => {
  return (
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
              className="w-full p-2 text-[#020d2b] sm:p-3 pl-9 sm:pl-10 pr-8 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#020d2b] focus:border-transparent text-sm sm:text-base"
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
            className="w-full p-3 sm:p-3 border border-gray-300 text-[#020d2b] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#020d2b] focus:border-transparent bg-white text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
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
          Showing {filteredCount} of {totalCount} activities
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
  );
};

export default ActivitiesSearch;
