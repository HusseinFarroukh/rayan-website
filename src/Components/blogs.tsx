"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description?: string; // Add full description field
  link?: string;
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
        .map((d) => ({ ...(d.data() as Blog), id: d.id }));
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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl text-[#020d2b] font-extrabold text-center mb-4">
            {sectionTitle || "Latest Blog Posts"}
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl">
            {sectionDesc ||
              "Stay updated with our latest insights and stories."}
          </p>
        </div>

        {/* Continuous looping marquee when more than 3 blogs */}
        {blogs.length > 3 ? (
          <div className="relative overflow-hidden">
            <div
              ref={sliderRef}
              className="flex gap-6 whitespace-nowrap marquee"
              style={{ animationDuration: `${duration}s` }}
              aria-hidden={false}
            >
              {loopItems.map((post, idx) => (
                <article
                  key={post.id + "-" + idx}
                  className="inline-flex flex-col items-center justify-start bg-gray-50 rounded-2xl shadow p-6 min-w-[280px] flex-shrink-0"
                >
                  <Image
                    src={staticImages[idx % staticImages.length]}
                    alt={post.title}
                    width={320}
                    height={180}
                    className="rounded-xl object-cover mb-4 w-full h-44"
                  />
                  <h3 className="text-xl font-bold mb-2 text-center text-[#020d2b]">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {post.excerpt}
                  </p>
                  <button
                    onClick={() => handleReadMore(post)}
                    className="bg-[#020d2b] text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-blue-300 transition"
                  >
                    Read More →
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((post, idx) => (
              <article
                key={post.id}
                className="bg-gray-50 rounded-2xl shadow hover:shadow-2xl transition p-6 flex flex-col items-center"
              >
                <Image
                  src={staticImages[idx % staticImages.length]}
                  alt={post.title}
                  width={320}
                  height={180}
                  className="rounded-xl object-cover mb-4"
                />
                <h3 className="text-xl font-bold mb-2 text-center text-[#020d2b]">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-center mb-4">{post.excerpt}</p>
                <button
                  onClick={() => handleReadMore(post)}
                  className="bg-[#020d2b] text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-blue-300 transition"
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
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative p-6">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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
              <div className="pt-8">
                <h2 className="text-2xl font-bold text-[#020d2b] mb-6 text-center">
                  {selectedBlog.title}
                </h2>

                <div className="prose max-w-none">
                  <p className="text-gray-600 text-lg leading-relaxed">
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
      `}</style>
    </section>
  );
}
