"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  link?: string;
  image?: string; // Add image field
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Listen for blogs (real-time)
    const unsubscribeBlogs = onSnapshot(collection(db, "blogs"), (snapshot) => {
      const data = snapshot.docs
        .filter((d) => d.id !== "blogsTitle")
        .map((d) => ({
          ...(d.data() as Blog),
          id: d.id,
          image: d.data().image || "", // Ensure image field is included
        }));
      setBlogs(data);
    });

    // Listen for title & description
    const unsubscribeTitle = onSnapshot(
      doc(db, "blogs", "blogsTitle"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as {
            title?: string;
            description?: string;
          };
          setSectionTitle(data.title || "");
          setSectionDesc(data.description || "");
        }
      }
    );

    return () => {
      unsubscribeBlogs();
      unsubscribeTitle();
    };
  }, []);

  // Duplicate items to create a seamless loop
  const loopItems = [...blogs, ...blogs];

  // compute duration based on number of items
  const baseDuration = 12;
  const duration = Math.max(baseDuration, Math.round(blogs.length * 4));

  // Static local images (fallback)
  const staticImages = [
    "/blog1.jpg",
    "/blog2.jpg",
    "/blog3.jpg",
    "/blog4.jpg",
    "/blog5.jpg",
    "/blog6.jpg",
  ];

  // Get image source - use uploaded image if available, otherwise fallback to static image
  const getImageSrc = (blog: Blog, index: number) => {
    if (blog.image) {
      return blog.image; // Use the uploaded image from Supabase
    }
    return staticImages[index % staticImages.length]; // Fallback to static image
  };

  // Handle read more click
  const handleReadMore = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    document.body.style.overflow = "unset"; // Re-enable scrolling
  };

  // Close modal when clicking outside content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-3 sm:mb-4 text-[#020d2b]">
            {sectionTitle || "Latest Blog Posts"}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 text-center max-w-2xl px-2 sm:px-0">
            {sectionDesc ||
              "Stay updated with our latest insights and stories."}
          </p>
        </div>

        {/* Continuous looping marquee when more than 3 blogs */}
        {blogs.length > 3 ? (
          <div className="relative overflow-hidden py-4">
            <div
              ref={sliderRef}
              className="flex gap-4 sm:gap-6 marquee"
              style={{ animationDuration: `${duration}s` }}
              aria-hidden={false}
            >
              {loopItems.map((post, idx) => (
                <article
                  key={post.id + "-" + idx}
                  className="inline-flex flex-col items-center justify-start bg-gray-50 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 min-w-[260px] sm:min-w-[280px] lg:min-w-[300px] flex-shrink-0"
                >
                  <Image
                    src={getImageSrc(post, idx)}
                    alt={post.title}
                    width={320}
                    height={180}
                    className="rounded-lg sm:rounded-xl object-cover mb-3 sm:mb-4 w-full h-32 sm:h-36 lg:h-44"
                    onError={(e) => {
                      // If uploaded image fails to load, fallback to static image
                      const target = e.target as HTMLImageElement;
                      target.src = staticImages[idx % staticImages.length];
                    }}
                  />
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-center text-[#020d2b] line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">
                    {post.excerpt}
                  </p>
                  <button
                    onClick={() => handleReadMore(post)}
                    className="bg-gradient-to-br from-[#020d2b] to-[#1b7a49] hover:from-[#1b7a49] hover:to-[#020d2b] text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow hover:bg-blue-300 transition text-sm sm:text-base w-full sm:w-auto"
                  >
                    Read More →
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${
              blogs.length >= 2 ? "sm:grid-cols-2" : "sm:grid-cols-1"
            } ${
              blogs.length >= 3 ? "lg:grid-cols-3" : ""
            } gap-4 sm:gap-6 lg:gap-8 justify-center`}
          >
            {blogs.map((post, idx) => (
              <article
                key={post.id}
                className="bg-gray-50 rounded-xl sm:rounded-2xl shadow hover:shadow-lg transition p-4 sm:p-6 flex flex-col items-center"
              >
                <Image
                  src={getImageSrc(post, idx)}
                  alt={post.title}
                  width={320}
                  height={180}
                  className="rounded-lg sm:rounded-xl object-cover mb-3 sm:mb-4 w-full h-32 sm:h-36 lg:h-44"
                  onError={(e) => {
                    // If uploaded image fails to load, fallback to static image
                    const target = e.target as HTMLImageElement;
                    target.src = staticImages[idx % staticImages.length];
                  }}
                />
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-center text-[#020d2b] line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-center mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
                <button
                  onClick={() => handleReadMore(post)}
                  className="bg-gradient-to-br from-[#020d2b] to-[#1b7a49] hover:from-[#1b7a49] hover:to-[#020d2b] text-white font-semibold px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl shadow hover:bg-blue-300 transition text-sm sm:text-base w-full sm:w-auto"
                >
                  Read More →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Blog Detail Modal */}
      {isModalOpen && selectedBlog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mx-auto">
            <div className="relative p-4 sm:p-6">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-1 sm:p-2 shadow-lg hover:bg-gray-100 transition"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
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

              {/* Blog Content */}
              <div className="pt-6 sm:pt-8">
                {/* Show blog image in modal if available */}
                {selectedBlog.image && (
                  <div className="mb-6">
                    <Image
                      src={selectedBlog.image}
                      alt={selectedBlog.title}
                      width={600}
                      height={300}
                      className="rounded-lg sm:rounded-xl object-cover w-full h-48 sm:h-56 lg:h-64"
                      onError={(e) => {
                        // Hide the image if it fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#020d2b] mb-4 sm:mb-6 text-center">
                  {selectedBlog.title}
                </h2>

                <div className="prose max-w-none">
                  <p className="text-gray-600 text-base sm:text-lg leading-relaxed sm:leading-loose">
                    {selectedBlog.description || selectedBlog.excerpt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .marquee {
          display: flex;
          align-items: center;
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .marquee::-webkit-scrollbar {
          display: none;
        }
        .marquee {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Line clamp utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
