"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ----------- Interfaces -----------
interface Hero {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
}
interface Aboutus {
  id: string;
  Title: string;
  Description: string;
}
interface Blog {
  id: string;
  title: string;
  description: string;
  excerpt?: string; // added
  link?: string; // added
}

// ----------- Component -----------
export default function Dashboard() {
  // ----- Hero State -----
  const [heroData, setHeroData] = useState<Hero | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");

  // ----- Services State -----
  const [services, setServices] = useState<Service[]>([]);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);

  // ----- Activities State -----
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityEditId, setActivityEditId] = useState<string | null>(null);

  // ----- Aboutus State -----
  const [AboutusData, setAboutusData] = useState<Aboutus | null>(null);
  const [AboutusTitle, setAboutusTitle] = useState("");
  const [AboutusDescription, setAboutusDescription] = useState("");

  // ----- Blogs State -----
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogEditId, setBlogEditId] = useState<string | null>(null);
  const [blogsTitle, setBlogsTitle] = useState("");
  const [blogsDescription, setBlogsDescription] = useState(""); // <-- new state for section description
  const [blogExcerpt, setBlogExcerpt] = useState(""); // excerpt for individual blogs
  const [blogLink, setBlogLink] = useState(""); // optional external link for blogs

  // ----- Section Titles -----
  const [servicesTitle, setServicesTitle] = useState("");
  const [activitiesTitle, setActivitiesTitle] = useState("");
  const [activitiesDesc, setActivitiesDesc] = useState("");
  const [activitiesDescription, setActivitiesDescription] = useState("");

  // ----- Fetch Hero -----
  const fetchHero = async () => {
    const snapshot = await getDocs(collection(db, "home"));
    const heroDoc = snapshot.docs.find((doc) => doc.id === "hero");
    if (heroDoc) {
      const data = heroDoc.data() as Omit<Hero, "id">;
      setHeroData({ id: heroDoc.id, ...data });
      setHeroTitle(data.title);
      setHeroSubtitle(data.subtitle);
      setHeroDescription(data.description);
    }
  };

  // ----- Fetch Services -----
  const fetchServices = async () => {
    const snapshot = await getDocs(collection(db, "services"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, "id">),
    }));
    setServices(data);
  };

  // ----- Fetch Activities -----
  const fetchActivities = async () => {
    const snapshot = await getDocs(collection(db, "activities"));
    const data = snapshot.docs
      .filter((doc) => doc.id !== "activitiesTitle") // exclude title doc
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Activity, "id">),
      }));
    setActivities(data);
  };
  // ----- Fetch Aboutus -----
  const fetchAboutus = async () => {
    const snapshot = await getDocs(collection(db, "Aboutus"));
    const AboutusDoc = snapshot.docs.find((doc) => doc.id === "Content");
    if (AboutusDoc) {
      const data = AboutusDoc.data() as Omit<Aboutus, "id">;
      setAboutusData({ id: AboutusDoc.id, ...data });
      setAboutusTitle(data.Title);
      setAboutusDescription(data.Description);
    }
  };
  // ----- Fetch Blogs (exclude BlogsTitle document) -----
  const fetchBlogs = async () => {
    const snapshot = await getDocs(collection(db, "blogs"));
    const data = snapshot.docs
      .filter((d) => d.id !== "blogsTitle" && d.id !== "BlogsTitle")
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Blog, "id"> & { excerpt?: string; link?: string }),
      }));
    setBlogs(data);
  };

  // ----- Fetch Section Titles -----
  const fetchSectionTitles = async () => {
    // Services title still from "home"
    const homeSnapshot = await getDocs(collection(db, "home"));
    const servicesDoc = homeSnapshot.docs.find(
      (doc) => doc.id === "ServicesTitle"
    );

    // Activities title now from "activities" (use doc, not collection)
    const activitiesDocRef = doc(db, "activities", "activitiesTitle");
    const activitiesDocSnap = await getDoc(activitiesDocRef);
    const blogsDocRef = doc(db, "blogs", "blogsTitle"); // <-- use existing doc id (blogsTitle)
    const blogsDocSnap = await getDoc(blogsDocRef);

    if (servicesDoc) {
      const data = servicesDoc.data() as { title: string };
      setServicesTitle(data.title);
    }
    if (activitiesDocSnap.exists()) {
      const data = activitiesDocSnap.data() as {
        title: string;
        description: string;
      };
      setActivitiesTitle(data.title);
      setActivitiesDescription(data.description);
      setActivitiesDesc(data.description); // keep both in sync if needed
    }
    if (blogsDocSnap.exists()) {
      const data = blogsDocSnap.data() as {
        title: string;
        description?: string;
      };
      setBlogsTitle(data.title);
      setBlogsDescription(data.description || ""); // <-- load description
    }
  };

  useEffect(() => {
    fetchHero();
    fetchServices();
    fetchActivities();
    fetchSectionTitles();
    fetchAboutus();
    fetchBlogs();
  }, []);

  // ----- Hero Update -----
  const handleHeroUpdate = async () => {
    if (!heroData) return;
    const docRef = doc(db, "home", heroData.id);
    await updateDoc(docRef, {
      title: heroTitle,
      subtitle: heroSubtitle,
      description: heroDescription,
    });
    alert("Hero Section updated!");
    fetchHero();
  };
  // ----- Aboutus Update -----
  const handleAboutusUpdate = async () => {
    if (!AboutusData) return;
    const docRef = doc(db, "Aboutus", AboutusData.id);
    await updateDoc(docRef, {
      Title: AboutusTitle,
      Description: AboutusDescription,
    });
    alert("Aboutus Section updated!");
    fetchAboutus();
  };

  // ----- Services Title Update -----
  const handleServicesTitleUpdate = async () => {
    const docRef = doc(db, "home", "ServicesTitle");
    await updateDoc(docRef, { title: servicesTitle });
    alert("Services Section Title updated!");
    fetchSectionTitles();
  };

  // ----- Activities Title Update -----
  const handleActivitiesTitleUpdate = async () => {
    const docRef = doc(db, "activities", "activitiesTitle");
    await updateDoc(docRef, {
      title: activitiesTitle,
      description: activitiesDesc, // <-- Add this line
    });
    alert("Activities Section Title & Description updated!");
    fetchSectionTitles();
  };

  // ----- Service Add/Update -----
  const handleServiceSubmit = async () => {
    if (!serviceTitle || !serviceDescription) return alert("Fill all fields");

    if (serviceEditId) {
      const docRef = doc(db, "services", serviceEditId);
      await updateDoc(docRef, {
        title: serviceTitle,
        description: serviceDescription,
      });
      setServiceEditId(null);
    } else {
      await addDoc(collection(db, "services"), {
        title: serviceTitle,
        description: serviceDescription,
      });
    }
    setServiceTitle("");
    setServiceDescription("");
    fetchServices();
  };

  // ----- Activity Add/Update -----
  const handleActivitySubmit = async () => {
    if (!activityTitle || !activityDescription) return alert("Fill all fields");

    if (activityEditId) {
      const docRef = doc(db, "activities", activityEditId);
      await updateDoc(docRef, {
        title: activityTitle,
        description: activityDescription,
      });
      setActivityEditId(null);
    } else {
      await addDoc(collection(db, "activities"), {
        title: activityTitle,
        description: activityDescription,
      });
    }
    setActivityTitle("");
    setActivityDescription("");
    fetchActivities();
  };

  // ----- Service Edit/Delete -----
  const handleServiceEdit = (service: Service) => {
    setServiceEditId(service.id);
    setServiceTitle(service.title);
    setServiceDescription(service.description);
  };
  const handleServiceDelete = async (id: string) => {
    const confirmed = confirm("Are you sure to delete this service?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "services", id));
    fetchServices();
  };

  // ----- Activity Edit/Delete -----
  const handleActivityEdit = (activity: Activity) => {
    setActivityEditId(activity.id);
    setActivityTitle(activity.title);
    setActivityDescription(activity.description);
  };
  const handleActivityDelete = async (id: string) => {
    const confirmed = confirm("Are you sure to delete this activity?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "activities", id));
    fetchActivities();
  };
  // ----- Blog Add/Update/Delete (each blog is its own document) -----
  const handleBlogSubmit = async () => {
    if (!blogTitle || !blogDescription) return alert("Fill all fields");
    try {
      if (blogEditId) {
        const docRef = doc(db, "blogs", blogEditId);
        // Use setDoc with merge to ensure update (and create if missing)
        await setDoc(
          docRef,
          {
            title: blogTitle,
            description: blogDescription,
            excerpt: blogExcerpt,
            link: blogLink,
          },
          { merge: true }
        );
        setBlogEditId(null);
        alert("Blog updated.");
      } else {
        await addDoc(collection(db, "blogs"), {
          title: blogTitle,
          description: blogDescription,
          excerpt: blogExcerpt,
          link: blogLink,
        });
        alert("Blog added.");
      }
      setBlogTitle("");
      setBlogDescription("");
      setBlogExcerpt("");
      setBlogLink("");
      fetchBlogs();
    } catch (err) {
      console.error("Blog save failed:", err);
      alert("Failed to save blog — see console.");
    }
  };

  // Ensure we read the latest blog data from Firestore before populating the edit form
  const handleBlogEdit = async (blog: Blog) => {
    try {
      const docRef = doc(db, "blogs", blog.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as {
          title?: string;
          description?: string;
          excerpt?: string;
          link?: string;
        };
        setBlogEditId(blog.id);
        setBlogTitle(data.title || "");
        setBlogDescription(data.description || "");
        setBlogExcerpt(data.excerpt || "");
        setBlogLink(data.link || "");
        // Show the blogs section and bring the form into view so the user can submit the update
        setActiveSection("blogs");
        document
          .getElementById("blogs")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Blog document not found.");
      }
    } catch (err) {
      console.error("Failed to load blog for edit:", err);
      alert("Failed to load blog for edit. See console.");
    }
  };
  const handleBlogDelete = async (id: string) => {
    const confirmed = confirm("Are you sure to delete this blog?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "blogs", id));
    fetchBlogs();
  };

  const handleBlogsTitleUpdate = async () => {
    try {
      const docRef = doc(db, "blogs", "blogsTitle"); // <-- update same existing doc
      await setDoc(
        docRef,
        { title: blogsTitle, description: blogsDescription },
        { merge: true }
      );
      alert("Blogs Section Title updated!");
      fetchSectionTitles();
    } catch (err) {
      console.error("Failed to update blogsTitle:", err);
      alert("Failed to update Blogs Section Title. See console.");
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);

  // Track which section is active
  const [activeSection, setActiveSection] = useState<
    "hero" | "services" | "activities" | "aboutus" | "blogs"
  >("hero");

  // ---------- JSX ----------
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f4eff1] text-white">
      {/* Sidebar as Dropdown for Mobile */}
      <div className="md:hidden flex flex-col w-full">
        <button
          className="bg-[#5b8a76] text-white px-4 py-3 flex items-center justify-between"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span className="font-bold text-lg">Dashboard Menu</span>
          <svg
            className={`w-6 h-6 ml-2 transition-transform ${
              sidebarOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {sidebarOpen && (
          <nav className="flex flex-col gap-2 bg-[#5b8a76] px-4 py-4">
            <div className="relative">
              <button
                className="w-full text-left hover:bg-[#5b8a76] rounded px-3 py-2 transition flex items-center justify-between"
                onClick={() => setHomeDropdownOpen((open) => !open)}
              >
                Home
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${
                    homeDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {homeDropdownOpen && (
                <div className="flex flex-col gap-2 bg-[#5b8a76] rounded mt-2 ml-2">
                  <button
                    onClick={() => {
                      setActiveSection("hero");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Hero Section
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("services");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Services
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("activities");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Activities
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("aboutus");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Aboutus
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("blogs");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Blogs
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-[#5b8a76] flex-col py-8 px-4 min-h-screen fixed left-0 top-0 z-20">
        <h3 className="text-xl font-bold mb-8">Dashboard</h3>
        <nav className="flex flex-col gap-4">
          <div className="relative group">
            <button
              className="w-full text-left hover:bg-[#69959e] rounded px-3 py-2 transition flex items-center justify-between"
              onClick={() => setHomeDropdownOpen((open) => !open)}
              type="button"
            >
              Home
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  homeDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {homeDropdownOpen && (
              <div className="flex flex-col gap-2 bg-[#5b8a76] rounded mt-2 ml-2 absolute left-0 z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    setActiveSection("hero");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Hero Section
                </button>
                <button
                  onClick={() => {
                    setActiveSection("services");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Services
                </button>
                <button
                  onClick={() => {
                    setActiveSection("activities");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Activities
                </button>
                <button
                  onClick={() => {
                    setActiveSection("aboutus");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Aboutus
                </button>
                <button
                  onClick={() => {
                    setActiveSection("blogs");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Blogs
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 space-y-12 md:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          {activeSection === "hero" && (
            <section id="hero" className="bg-[#5b8a76] p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Edit Hero Section</h2>
              <input
                type="text"
                placeholder="Title"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full p-2 mb-2 text-white rounded border border-white"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full p-2 mb-2 text-white rounded border border-white"
              />
              <textarea
                placeholder="Description"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={4}
                className="w-full p-2 mb-2 text-white rounded border border-white"
              />
              <button
                onClick={handleHeroUpdate}
                className="px-4 py-2 bg-[#020d2b] rounded hover:bg-[#69959e] transition"
              >
                Update Hero
              </button>
            </section>
          )}

          {/* Services Section */}
          {activeSection === "services" && (
            <section id="services" className="bg-[#5b8a76] p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Manage Services</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Services Section Title"
                  value={servicesTitle}
                  onChange={(e) => setServicesTitle(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white mb-2"
                />
                <button
                  onClick={handleServicesTitleUpdate}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  Update Section Title
                </button>
              </div>
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  placeholder="Service Title"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <textarea
                  placeholder="Service Description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <button
                  onClick={handleServiceSubmit}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  {serviceEditId ? "Update Service" : "Add Service"}
                </button>
              </div>
              <div className="grid gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold">{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleServiceEdit(service)}
                        className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleServiceDelete(service.id)}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activities Section */}
          {activeSection === "activities" && (
            <section
              id="activities"
              className="bg-[#5b8a76] p-6 rounded shadow"
            >
              <h2 className="text-2xl font-bold mb-4">Manage Activities</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Activities Section Title"
                  value={activitiesTitle}
                  onChange={(e) => setActivitiesTitle(e.target.value)}
                  className="w-full p-2 text-white rounded mb-2 border border-white"
                />
                <textarea
                  placeholder="Activities Section Description"
                  value={activitiesDesc}
                  onChange={(e) => setActivitiesDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-white rounded mb-2 border border-white"
                />
                <button
                  onClick={handleActivitiesTitleUpdate}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  Update Section Title & Description
                </button>
              </div>
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  placeholder="Activity Title"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <textarea
                  placeholder="Activity Description"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <button
                  onClick={handleActivitySubmit}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  {activityEditId ? "Update Activity" : "Add Activity"}
                </button>
              </div>
              <div className="grid gap-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold">{activity.title}</h3>
                      <p>{activity.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActivityEdit(activity)}
                        className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleActivityDelete(activity.id)}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aboutus Section */}
          {activeSection === "aboutus" && (
            <section id="Aboutus" className="bg-[#5b8a76] p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Edit Aboutus Section</h2>
              <input
                type="text"
                placeholder="Title"
                value={AboutusTitle}
                onChange={(e) => setAboutusTitle(e.target.value)}
                className="w-full p-2 mb-2 text-white rounded border border-white"
              />
              <textarea
                placeholder="Description"
                value={AboutusDescription}
                onChange={(e) => setAboutusDescription(e.target.value)}
                rows={4}
                className="w-full p-2 mb-2 text-white rounded border border-white"
              />
              <button
                onClick={handleAboutusUpdate}
                className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
              >
                Update Aboutus
              </button>
            </section>
          )}
          {/* Blogs Section */}
          {activeSection === "blogs" && (
            <section id="blogs" className="bg-[#5b8a76] p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Manage Blogs</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Blogs Section Title"
                  value={blogsTitle}
                  onChange={(e) => setBlogsTitle(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white mb-2"
                />
                <textarea
                  placeholder="Blogs Section Description"
                  value={blogsDescription}
                  onChange={(e) => setBlogsDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-white rounded border border-white mb-2"
                />
                <button
                  onClick={handleBlogsTitleUpdate}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  Update Section Title
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  placeholder="Blog Title"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <textarea
                  placeholder="Blog Description"
                  value={blogDescription}
                  onChange={(e) => setBlogDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Excerpt (short preview)"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Link (optional)"
                  value={blogLink}
                  onChange={(e) => setBlogLink(e.target.value)}
                  className="w-full p-2 text-white rounded border border-white"
                />
                <button
                  onClick={handleBlogSubmit}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition"
                >
                  {blogEditId ? "Update Blog" : "Add Blog"}
                </button>
              </div>

              <div className="grid gap-4">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold">{blog.title}</h3>
                      <p className="text-sm">
                        {blog.excerpt ?? blog.description}
                      </p>
                      {blog.link && (
                        <a
                          href={blog.link}
                          className="text-blue-200 underline text-sm"
                        >
                          Read more
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBlogEdit(blog)}
                        className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleBlogDelete(blog.id)}
                        className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
