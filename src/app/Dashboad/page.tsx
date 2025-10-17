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
  shortDescription: string;
  description: string;
  link?: string;
  category?: string;
  image?: string; // Added image field
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
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
  excerpt?: string;
  link?: string;
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

  // ----- Categories State -----
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryParentId, setCategoryParentId] = useState("");
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);

  // ----- Activities State -----
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityshortDescription, setActivityshortDescription] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityLink, setActivityLink] = useState("");
  const [activityCategory, setActivityCategory] = useState("");
  const [activityImage, setActivityImage] = useState(""); // Added image state
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
  const [blogsDescription, setBlogsDescription] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogLink, setBlogLink] = useState("");

  // ----- Section Titles -----
  const [servicesTitle, setServicesTitle] = useState("");
  const [activitiesTitle, setActivitiesTitle] = useState("");
  const [activitiesDesc, setActivitiesDesc] = useState("");

  // ----- Loading States -----
  const [loading, setLoading] = useState(false);

  // ----- Helper function to build category tree -----
  const buildCategoryTree = (
    categories: Category[]
  ): (Category & { level: number; children: Category[] })[] => {
    const categoryMap = new Map();
    const rootCategories: (Category & {
      level: number;
      children: Category[];
    })[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        level: 0,
        children: [],
      });
    });

    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          categoryNode.level = parent.level + 1;
          parent.children.push(categoryNode);
        } else {
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    const flattenTree = (
      nodes: (Category & { level: number; children: Category[] })[],
      result: (Category & { level: number })[] = []
    ) => {
      nodes.forEach((node) => {
        result.push({ ...node, children: [] });
        if (node.children.length > 0) {
          flattenTree(node.children, result);
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  // ----- Fetch Categories -----
  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to fetch categories");
    }
  };

  // ----- Fetch Hero -----
  const fetchHero = async () => {
    try {
      const snapshot = await getDocs(collection(db, "home"));
      const heroDoc = snapshot.docs.find((doc) => doc.id === "hero");
      if (heroDoc) {
        const data = heroDoc.data() as Omit<Hero, "id">;
        setHeroData({ id: heroDoc.id, ...data });
        setHeroTitle(data.title);
        setHeroSubtitle(data.subtitle);
        setHeroDescription(data.description);
      }
    } catch (error) {
      console.error("Error fetching hero:", error);
      alert("Failed to fetch hero data");
    }
  };

  // ----- Fetch Services -----
  const fetchServices = async () => {
    try {
      const snapshot = await getDocs(collection(db, "services"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Service, "id">),
      }));
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to fetch services");
    }
  };

  // ----- Fetch Activities -----
  const fetchActivities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "activities"));
      const data = snapshot.docs
        .filter((doc) => doc.id !== "activitiesTitle")
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Activity, "id">),
        }));
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
      alert("Failed to fetch activities");
    }
  };

  // ----- Fetch Aboutus -----
  const fetchAboutus = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Aboutus"));
      const AboutusDoc = snapshot.docs.find((doc) => doc.id === "Content");
      if (AboutusDoc) {
        const data = AboutusDoc.data() as Omit<Aboutus, "id">;
        setAboutusData({ id: AboutusDoc.id, ...data });
        setAboutusTitle(data.Title);
        setAboutusDescription(data.Description);
      }
    } catch (error) {
      console.error("Error fetching aboutus:", error);
      alert("Failed to fetch aboutus data");
    }
  };

  // ----- Fetch Blogs -----
  const fetchBlogs = async () => {
    try {
      const snapshot = await getDocs(collection(db, "blogs"));
      const data = snapshot.docs
        .filter((d) => d.id !== "blogsTitle" && d.id !== "BlogsTitle")
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Blog, "id"> & {
            excerpt?: string;
            link?: string;
          }),
        }));
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      alert("Failed to fetch blogs");
    }
  };

  // ----- Fetch Section Titles -----
  const fetchSectionTitles = async () => {
    try {
      const homeSnapshot = await getDocs(collection(db, "home"));
      const servicesDoc = homeSnapshot.docs.find(
        (doc) => doc.id === "ServicesTitle"
      );

      const activitiesDocRef = doc(db, "activities", "activitiesTitle");
      const activitiesDocSnap = await getDoc(activitiesDocRef);

      const blogsDocRef = doc(db, "blogs", "blogsTitle");
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
        setActivitiesDesc(data.description);
      }

      if (blogsDocSnap.exists()) {
        const data = blogsDocSnap.data() as {
          title: string;
          description?: string;
        };
        setBlogsTitle(data.title);
        setBlogsDescription(data.description || "");
      }
    } catch (error) {
      console.error("Error fetching section titles:", error);
      alert("Failed to fetch section titles");
    }
  };

  useEffect(() => {
    fetchHero();
    fetchServices();
    fetchCategories();
    fetchActivities();
    fetchSectionTitles();
    fetchAboutus();
    fetchBlogs();
  }, []);

  // ----- Category Add/Update -----
  const handleCategorySubmit = async () => {
    if (!categoryName.trim()) {
      return alert("Please enter category name");
    }
    if (loading) return;

    setLoading(true);
    try {
      if (categoryEditId) {
        const docRef = doc(db, "categories", categoryEditId);
        await updateDoc(docRef, {
          name: categoryName,
          description: categoryDescription,
          parentId: categoryParentId || null,
        });
        setCategoryEditId(null);
      } else {
        await addDoc(collection(db, "categories"), {
          name: categoryName,
          description: categoryDescription,
          parentId: categoryParentId || null,
        });
      }
      setCategoryName("");
      setCategoryDescription("");
      setCategoryParentId("");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // ----- Category Edit/Delete -----
  const handleCategoryEdit = (category: Category) => {
    setCategoryEditId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryParentId(category.parentId || "");
  };

  const handleCategoryDelete = async (id: string) => {
    const hasSubcategories = categories.some((cat) => cat.parentId === id);
    const isUsedInActivities = activities.some(
      (activity) => activity.category === id
    );

    let message = "Are you sure to delete this category?";
    if (hasSubcategories) {
      message +=
        "\n\nThis category has subcategories. Deleting it will also delete all subcategories.";
    }
    if (isUsedInActivities) {
      message +=
        "\n\nThis category is used in activities. Those activities will lose their category assignment.";
    }

    const confirmed = confirm(message);
    if (!confirmed) return;

    try {
      const deleteCategoryRecursive = async (categoryId: string) => {
        const subcategories = categories.filter(
          (cat) => cat.parentId === categoryId
        );

        for (const subcategory of subcategories) {
          await deleteCategoryRecursive(subcategory.id);
        }

        await deleteDoc(doc(db, "categories", categoryId));
      };

      await deleteCategoryRecursive(id);
      fetchCategories();
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  // ----- Cancel Category Edit -----
  const handleCategoryCancel = () => {
    setCategoryEditId(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryParentId("");
  };

  // ----- Hero Update -----
  const handleHeroUpdate = async () => {
    if (!heroData || loading) return;
    setLoading(true);
    try {
      const docRef = doc(db, "home", heroData.id);
      await updateDoc(docRef, {
        title: heroTitle,
        subtitle: heroSubtitle,
        description: heroDescription,
      });
      alert("Hero Section updated!");
      fetchHero();
    } catch (error) {
      console.error("Error updating hero:", error);
      alert("Failed to update hero section");
    } finally {
      setLoading(false);
    }
  };

  // ----- Aboutus Update -----
  const handleAboutusUpdate = async () => {
    if (!AboutusData || loading) return;
    setLoading(true);
    try {
      const docRef = doc(db, "Aboutus", AboutusData.id);
      await updateDoc(docRef, {
        Title: AboutusTitle,
        Description: AboutusDescription,
      });
      alert("Aboutus Section updated!");
      fetchAboutus();
    } catch (error) {
      console.error("Error updating aboutus:", error);
      alert("Failed to update aboutus section");
    } finally {
      setLoading(false);
    }
  };

  // ----- Services Title Update -----
  const handleServicesTitleUpdate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const docRef = doc(db, "home", "ServicesTitle");
      await updateDoc(docRef, { title: servicesTitle });
      alert("Services Section Title updated!");
      fetchSectionTitles();
    } catch (error) {
      console.error("Error updating services title:", error);
      alert("Failed to update services title");
    } finally {
      setLoading(false);
    }
  };

  // ----- Activities Title Update -----
  const handleActivitiesTitleUpdate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const docRef = doc(db, "activities", "activitiesTitle");
      await updateDoc(docRef, {
        title: activitiesTitle,
        description: activitiesDesc,
      });
      alert("Activities Section Title & Description updated!");
      fetchSectionTitles();
    } catch (error) {
      console.error("Error updating activities title:", error);
      alert("Failed to update activities title");
    } finally {
      setLoading(false);
    }
  };

  // ----- Service Add/Update -----
  const handleServiceSubmit = async () => {
    if (!serviceTitle.trim() || !serviceDescription.trim()) {
      return alert("Please fill all fields");
    }
    if (loading) return;

    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  // ----- Activity Add/Update -----
  const handleActivitySubmit = async () => {
    if (
      !activityTitle.trim() ||
      !activityshortDescription.trim() ||
      !activityDescription.trim()
    ) {
      return alert("Please fill all required fields");
    }
    if (loading) return;

    setLoading(true);
    try {
      if (activityEditId) {
        const docRef = doc(db, "activities", activityEditId);
        await updateDoc(docRef, {
          title: activityTitle,
          shortDescription: activityshortDescription,
          description: activityDescription,
          link: activityLink,
          category: activityCategory,
          image: activityImage, // Added image field
        });
        setActivityEditId(null);
      } else {
        await addDoc(collection(db, "activities"), {
          title: activityTitle,
          shortDescription: activityshortDescription,
          description: activityDescription,
          link: activityLink,
          category: activityCategory,
          image: activityImage, // Added image field
        });
      }
      setActivityTitle("");
      setActivityshortDescription("");
      setActivityDescription("");
      setActivityLink("");
      setActivityCategory("");
      setActivityImage(""); // Reset image field
      fetchActivities();
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity");
    } finally {
      setLoading(false);
    }
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

    try {
      await deleteDoc(doc(db, "services", id));
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  // ----- Activity Edit/Delete -----
  const handleActivityEdit = (activity: Activity) => {
    setActivityEditId(activity.id);
    setActivityTitle(activity.title);
    setActivityshortDescription(activity.shortDescription);
    setActivityDescription(activity.description);
    setActivityLink(activity.link || "");
    setActivityCategory(activity.category || "");
    setActivityImage(activity.image || ""); // Set image when editing
  };

  const handleActivityDelete = async (id: string) => {
    const confirmed = confirm("Are you sure to delete this activity?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "activities", id));
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity");
    }
  };

  // ----- Blog Add/Update -----
  const handleBlogSubmit = async () => {
    if (!blogTitle.trim() || !blogDescription.trim()) {
      return alert("Please fill all required fields");
    }

    try {
      if (blogEditId) {
        const docRef = doc(db, "blogs", blogEditId);
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

    try {
      await deleteDoc(doc(db, "blogs", id));
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    }
  };

  const handleBlogsTitleUpdate = async () => {
    try {
      const docRef = doc(db, "blogs", "blogsTitle");
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
  const [activeSection, setActiveSection] = useState<
    "hero" | "services" | "categories" | "activities" | "aboutus" | "blogs"
  >("hero");

  // Build category tree for display
  const categoryTree = buildCategoryTree(categories);

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
                      setActiveSection("categories");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Categories
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
                    setActiveSection("categories");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Categories
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
                className="w-full p-2 mb-2 text-gray-800 rounded border border-white"
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full p-2 mb-2 text-gray-800 rounded border border-white"
              />
              <textarea
                placeholder="Description"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={4}
                className="w-full p-2 mb-2 text-gray-800 rounded border border-white"
              />
              <button
                onClick={handleHeroUpdate}
                disabled={loading}
                className="px-4 py-2 bg-[#020d2b] rounded hover:bg-[#69959e] transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Hero"}
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
                  className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                />
                <button
                  onClick={handleServicesTitleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Section Title"}
                </button>
              </div>
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  placeholder="Service Title"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <textarea
                  placeholder="Service Description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <button
                  onClick={handleServiceSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : serviceEditId
                    ? "Update Service"
                    : "Add Service"}
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

          {/* Categories Section */}
          {activeSection === "categories" && (
            <section
              id="categories"
              className="bg-[#5b8a76] p-6 rounded shadow"
            >
              <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

              {/* Category Form */}
              <div className="mb-6 space-y-2 bg-[#69959e] p-4 rounded">
                <h3 className="text-lg font-bold mb-2">
                  {categoryEditId ? "Edit Category" : "Add New Category"}
                </h3>
                <input
                  type="text"
                  placeholder="Category Name *"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <textarea
                  placeholder="Category Description (optional)"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <select
                  value={categoryParentId}
                  onChange={(e) => setCategoryParentId(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                >
                  <option value="">Select Parent Category (optional)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCategorySubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-[#5b8a76] rounded hover:bg-[#4a7563] transition disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : categoryEditId
                      ? "Update Category"
                      : "Add Category"}
                  </button>
                  {categoryEditId && (
                    <button
                      onClick={handleCategoryCancel}
                      className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold mb-2">Categories List</h3>
                {categoryTree.length === 0 ? (
                  <p className="text-center py-4">
                    No categories yet. Add your first category above.
                  </p>
                ) : (
                  categoryTree.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                      style={{ marginLeft: `${category.level * 20}px` }}
                    >
                      <div>
                        <h3 className="font-bold">
                          {category.name}
                          {category.level > 0 && (
                            <span className="text-sm text-gray-200 ml-2">
                              (Subcategory)
                            </span>
                          )}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-200 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCategoryEdit(category)}
                          className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category.id)}
                          className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                  className="w-full p-2 text-gray-800 rounded mb-2 border border-white"
                />
                <textarea
                  placeholder="Activities Section Description"
                  value={activitiesDesc}
                  onChange={(e) => setActivitiesDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-gray-800 rounded mb-2 border border-white"
                />
                <button
                  onClick={handleActivitiesTitleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition disabled:opacity-50"
                >
                  {loading
                    ? "Updating..."
                    : "Update Section Title & Description"}
                </button>
              </div>
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  placeholder="Activity Title"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Activity Short Description"
                  value={activityshortDescription}
                  onChange={(e) => setActivityshortDescription(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <textarea
                  placeholder="Activity Description"
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Link (optional)"
                  value={activityLink}
                  onChange={(e) => setActivityLink(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={activityImage}
                  onChange={(e) => setActivityImage(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                >
                  <option value="">Select Category (optional)</option>
                  {categoryTree.map((category) => (
                    <option key={category.id} value={category.id}>
                      {"-".repeat(category.level)} {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleActivitySubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : activityEditId
                    ? "Update Activity"
                    : "Add Activity"}
                </button>
              </div>

              <div className="grid gap-4">
                {activities.map((activity) => {
                  const category = categories.find(
                    (cat) => cat.id === activity.category
                  );
                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                    >
                      <div className="flex-1">
                        {/* Activity Image Preview */}
                        {activity.image && (
                          <div className="mb-3">
                            <img
                              src={activity.image}
                              alt={activity.title}
                              className="w-32 h-20 object-cover rounded"
                            />
                          </div>
                        )}
                        <h3 className="font-bold">{activity.title}</h3>
                        <p className="text-sm text-gray-200">
                          {activity.shortDescription}
                        </p>
                        <p className="text-sm mt-1">{activity.description}</p>
                        {category && (
                          <span className="inline-block bg-[#5b8a76] text-white px-2 py-1 rounded text-sm mt-2">
                            {category.name}
                          </span>
                        )}
                        {activity.link && (
                          <a
                            href={activity.link}
                            className="text-blue-200 underline text-sm block mt-1"
                          >
                            Learn more
                          </a>
                        )}
                        {activity.image && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-300">
                              Has image
                            </span>
                          </div>
                        )}
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
                  );
                })}
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
                className="w-full p-2 mb-2 text-gray-800 rounded border border-white"
              />
              <textarea
                placeholder="Description"
                value={AboutusDescription}
                onChange={(e) => setAboutusDescription(e.target.value)}
                rows={4}
                className="w-full p-2 mb-2 text-gray-800 rounded border border-white"
              />
              <button
                onClick={handleAboutusUpdate}
                disabled={loading}
                className="px-4 py-2 bg-[#69959e] rounded hover:bg-[#69959e] transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Aboutus"}
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
                  className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                />
                <textarea
                  placeholder="Blogs Section Description"
                  value={blogsDescription}
                  onChange={(e) => setBlogsDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-gray-800 rounded border border-white mb-2"
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
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <textarea
                  placeholder="Blog Description"
                  value={blogDescription}
                  onChange={(e) => setBlogDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Excerpt (short preview)"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <input
                  type="text"
                  placeholder="Link (optional)"
                  value={blogLink}
                  onChange={(e) => setBlogLink(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
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
