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
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

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
  image?: string;
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
  image?: string;
}

interface Blog {
  id: string;
  title: string;
  description: string;
  excerpt?: string;
  link?: string;
  image?: string;
}

interface University {
  id: string;
  name: string;
  image?: string;
}

// Extended interface for category tree
interface CategoryNode extends Category {
  level: number;
  children: CategoryNode[];
}

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ----------- Admin Credentials (Hardcoded) -----------
const ADMIN_CREDENTIALS = {
  email: "admin@eduguide.com",
  password: "Admin123!", // You can change this password
};

// ----------- Login Component -----------
function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check against hardcoded admin credentials
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Store authentication in localStorage
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminEmail", email);
      onLoginSuccess();
    } else {
      setError("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4eff1] flex items-center justify-center p-4">
      <div className="bg-[#5b8a76] p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Admin Dashboard
        </h2>
        <p className="text-gray-200 text-center mb-6 text-sm">
          Restricted Access - Admin Only
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-500 text-white p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#69959e]"
              placeholder="Enter admin email"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#69959e]"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#69959e] text-white py-3 px-4 rounded hover:bg-[#5a7a6e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------- Main Dashboard Component -----------
export default function Dashboard() {
  // ----- Authentication State -----
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);

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
  const [activityImage, setActivityImage] = useState("");
  const [activityEditId, setActivityEditId] = useState<string | null>(null);
  const [activityImageUpload, setActivityImageUpload] = useState<File | null>(
    null
  );
  const [activityUploadProgress, setActivityUploadProgress] = useState(0);
  const [isActivityUploading, setIsActivityUploading] = useState(false);

  // ----- Aboutus State -----
  const [AboutusData, setAboutusData] = useState<Aboutus | null>(null);
  const [AboutusTitle, setAboutusTitle] = useState("");
  const [AboutusDescription, setAboutusDescription] = useState("");
  const [AboutusImage, setAboutusImage] = useState("");
  const [AboutusImageUpload, setAboutusImageUpload] = useState<File | null>(
    null
  );
  const [AboutusUploadProgress, setAboutusUploadProgress] = useState(0);
  const [isAboutusUploading, setIsAboutusUploading] = useState(false);

  // ----- Blogs State -----
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogEditId, setBlogEditId] = useState<string | null>(null);
  const [blogsTitle, setBlogsTitle] = useState("");
  const [blogsDescription, setBlogsDescription] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogLink, setBlogLink] = useState("");
  const [blogImage, setBlogImage] = useState("");
  const [blogImageUpload, setBlogImageUpload] = useState<File | null>(null);
  const [blogUploadProgress, setBlogUploadProgress] = useState(0);
  const [isBlogUploading, setIsBlogUploading] = useState(false);

  // ----- Universities State -----
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityName, setUniversityName] = useState("");
  const [universityImage, setUniversityImage] = useState("");
  const [universityImageUpload, setUniversityImageUpload] =
    useState<File | null>(null);
  const [universityUploadProgress, setUniversityUploadProgress] = useState(0);
  const [isUniversityUploading, setIsUniversityUploading] = useState(false);
  const [universityEditId, setUniversityEditId] = useState<string | null>(null);

  // ----- Section Titles -----
  const [servicesTitle, setServicesTitle] = useState("");
  const [activitiesTitle, setActivitiesTitle] = useState("");
  const [activitiesDesc, setActivitiesDesc] = useState("");

  // ----- Loading States -----
  const [loading, setLoading] = useState(false);

  // ----- UI States -----
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<
    | "hero"
    | "services"
    | "categories"
    | "activities"
    | "aboutus"
    | "blogs"
    | "universities"
  >("hero");

  // ----- Authentication -----
  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem("adminAuthenticated");
    const email = localStorage.getItem("adminEmail");

    if (authStatus === "true" && email) {
      setIsAuthenticated(true);
      setAdminEmail(email);
    }

    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    const email = localStorage.getItem("adminEmail");
    setIsAuthenticated(true);
    setAdminEmail(email || "Admin");
  };

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminEmail");
    setIsAuthenticated(false);
    setAdminEmail("");
  };

  // ----- Helper function to build category tree -----
  const buildCategoryTree = (
    categories: Category[]
  ): (Category & { level: number })[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Create tree structure
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        level: 0,
        children: [],
      });
    });

    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (!categoryNode) return;

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

    // Flatten tree for display
    const flattenTree = (
      nodes: CategoryNode[],
      result: (Category & { level: number })[] = []
    ): (Category & { level: number })[] => {
      nodes.forEach((node) => {
        // Create a new object without children property
        const { ...nodeWithoutChildren } = node;
        result.push({ ...nodeWithoutChildren, level: node.level });

        if (node.children.length > 0) {
          flattenTree(node.children, result);
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  // Build category tree for display
  const categoryTree = buildCategoryTree(categories);

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
        setAboutusImage(data.image || "");
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
            image?: string;
          }),
        }));
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      alert("Failed to fetch blogs");
    }
  };

  // ----- Fetch Universities -----
  const fetchUniversities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "universities"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<University, "id">),
      }));
      setUniversities(data);
    } catch (error) {
      console.error("Error fetching universities:", error);
      alert("Failed to fetch universities");
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

  // ----- Supabase Image Upload for Activities -----
  const handleActivityImageUpload = async () => {
    if (!activityImageUpload) {
      alert("Please select an image first");
      return;
    }

    setIsActivityUploading(true);
    setActivityUploadProgress(0);

    try {
      const fileExt = activityImageUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `activities/${fileName}`;

      const progressInterval = setInterval(() => {
        setActivityUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, activityImageUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setActivityUploadProgress(100);
      setActivityImage(urlData.publicUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsActivityUploading(false);
      setActivityUploadProgress(0);
      setActivityImageUpload(null);
    }
  };

  // ----- Supabase Image Upload for Blogs -----
  const handleBlogImageUpload = async () => {
    if (!blogImageUpload) {
      alert("Please select an image first");
      return;
    }

    setIsBlogUploading(true);
    setBlogUploadProgress(0);

    try {
      const fileExt = blogImageUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const progressInterval = setInterval(() => {
        setBlogUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, blogImageUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setBlogUploadProgress(100);
      setBlogImage(urlData.publicUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsBlogUploading(false);
      setBlogUploadProgress(0);
      setBlogImageUpload(null);
    }
  };

  // ----- Supabase Image Upload for Aboutus -----
  const handleAboutusImageUpload = async () => {
    if (!AboutusImageUpload) {
      alert("Please select an image first");
      return;
    }

    setIsAboutusUploading(true);
    setAboutusUploadProgress(0);

    try {
      const fileExt = AboutusImageUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `aboutus/${fileName}`;

      const progressInterval = setInterval(() => {
        setAboutusUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, AboutusImageUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setAboutusUploadProgress(100);
      setAboutusImage(urlData.publicUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsAboutusUploading(false);
      setAboutusUploadProgress(0);
      setAboutusImageUpload(null);
    }
  };

  // ----- Supabase Image Upload for Universities -----
  const handleUniversityImageUpload = async () => {
    if (!universityImageUpload) {
      alert("Please select an image first");
      return;
    }

    setIsUniversityUploading(true);
    setUniversityUploadProgress(0);

    try {
      const fileExt = universityImageUpload.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `universities/${fileName}`;

      const progressInterval = setInterval(() => {
        setUniversityUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, universityImageUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setUniversityUploadProgress(100);
      setUniversityImage(urlData.publicUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setIsUniversityUploading(false);
      setUniversityUploadProgress(0);
      setUniversityImageUpload(null);
    }
  };

  // Fetch data only when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHero();
      fetchServices();
      fetchCategories();
      fetchActivities();
      fetchSectionTitles();
      fetchAboutus();
      fetchBlogs();
      fetchUniversities();
    }
  }, [isAuthenticated]);

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
        image: AboutusImage,
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
          image: activityImage,
        });
        setActivityEditId(null);
      } else {
        await addDoc(collection(db, "activities"), {
          title: activityTitle,
          shortDescription: activityshortDescription,
          description: activityDescription,
          link: activityLink,
          category: activityCategory,
          image: activityImage,
        });
      }
      setActivityTitle("");
      setActivityshortDescription("");
      setActivityDescription("");
      setActivityLink("");
      setActivityCategory("");
      setActivityImage("");
      fetchActivities();
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Failed to save activity");
    } finally {
      setLoading(false);
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
    setActivityImage(activity.image || "");
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
            image: blogImage,
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
          image: blogImage,
        });
        alert("Blog added.");
      }
      setBlogTitle("");
      setBlogDescription("");
      setBlogExcerpt("");
      setBlogLink("");
      setBlogImage("");
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
          image?: string;
        };
        setBlogEditId(blog.id);
        setBlogTitle(data.title || "");
        setBlogDescription(data.description || "");
        setBlogExcerpt(data.excerpt || "");
        setBlogLink(data.link || "");
        setBlogImage(data.image || "");
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

  // ----- University Add/Update -----
  const handleUniversitySubmit = async () => {
    if (!universityName.trim()) {
      return alert("Please enter university name");
    }

    try {
      if (universityEditId) {
        const docRef = doc(db, "universities", universityEditId);
        await updateDoc(docRef, {
          name: universityName,
          image: universityImage,
        });
        setUniversityEditId(null);
        alert("University updated!");
      } else {
        await addDoc(collection(db, "universities"), {
          name: universityName,
          image: universityImage,
        });
        alert("University added!");
      }
      setUniversityName("");
      setUniversityImage("");
      fetchUniversities();
    } catch (error) {
      console.error("Error saving university:", error);
      alert("Failed to save university");
    }
  };

  // ----- University Edit/Delete -----
  const handleUniversityEdit = (university: University) => {
    setUniversityEditId(university.id);
    setUniversityName(university.name);
    setUniversityImage(university.image || "");
  };

  const handleUniversityDelete = async (id: string) => {
    const confirmed = confirm("Are you sure to delete this university?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "universities", id));
      fetchUniversities();
      alert("University deleted successfully!");
    } catch (error) {
      console.error("Error deleting university:", error);
      alert("Failed to delete university");
    }
  };

  // ----- Cancel University Edit -----
  const handleUniversityCancel = () => {
    setUniversityEditId(null);
    setUniversityName("");
    setUniversityImage("");
  };

  // Show loading while checking authentication
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#f4eff1] flex items-center justify-center">
        <div className="text-[#5b8a76] text-xl">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ---------- JSX ----------
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f4eff1] text-white">
      {/* Sidebar as Dropdown for Mobile */}
      <div className="md:hidden flex flex-col w-full">
        <div className="bg-[#5b8a76] text-white px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg">Admin Dashboard</span>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:inline">
              Welcome, {adminEmail}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition text-sm"
            >
              Logout
            </button>
            <button
              className="flex items-center"
              onClick={() => setSidebarOpen((open) => !open)}
            >
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
          </div>
        </div>
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
                    About us
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
                  <button
                    onClick={() => {
                      setActiveSection("universities");
                      setSidebarOpen(false);
                      setHomeDropdownOpen(false);
                    }}
                    className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                  >
                    Universities
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-[#5b8a76] flex-col py-8 px-4 min-h-screen fixed left-0 top-0 z-20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">Admin Dashboard</h3>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition text-sm"
          >
            Logout
          </button>
        </div>
        <div className="mb-4 text-sm text-gray-200">Welcome, {adminEmail}</div>
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
                  About us
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
                <button
                  onClick={() => {
                    setActiveSection("universities");
                    setHomeDropdownOpen(false);
                  }}
                  className="hover:bg-[#69959e] rounded px-3 py-2 transition text-left"
                >
                  Universities
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
                <div className="border border-white rounded p-3 bg-[#69959e]">
                  <label className="block text-sm font-medium mb-2">
                    Activity Image
                  </label>
                  {activityImage && (
                    <div className="mb-3">
                      <p className="text-sm mb-1">Current Image:</p>
                      <Image
                        src={activityImage}
                        alt="Preview"
                        width={128}
                        height={80}
                        className="w-32 h-20 object-cover rounded border border-white"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setActivityImageUpload(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                  />
                  {isActivityUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#5b8a76] h-2.5 rounded-full"
                        style={{ width: `${activityUploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-center">
                        {activityUploadProgress}%
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleActivityImageUpload}
                    disabled={!activityImageUpload || isActivityUploading}
                    className="w-full px-4 py-2 bg-[#5b8a76] rounded hover:bg-[#4a7563] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActivityUploading
                      ? "Uploading..."
                      : "Upload Image to Supabase"}
                  </button>
                  <div className="mt-2">
                    <p className="text-sm text-center mb-1">- OR -</p>
                    <input
                      type="text"
                      placeholder="Or enter image URL directly"
                      value={activityImage}
                      onChange={(e) => setActivityImage(e.target.value)}
                      className="w-full p-2 text-gray-800 rounded border border-white"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Link (optional)"
                  value={activityLink}
                  onChange={(e) => setActivityLink(e.target.value)}
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
                        {activity.image && (
                          <div className="mb-3">
                            <Image
                              src={activity.image}
                              alt={activity.title}
                              width={128}
                              height={80}
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
              <div className="border border-white rounded p-3 bg-[#69959e] mb-4">
                <label className="block text-sm font-medium mb-2">
                  About Us Image
                </label>
                {AboutusImage && (
                  <div className="mb-3">
                    <p className="text-sm mb-1">Current Image:</p>
                    <Image
                      src={AboutusImage}
                      alt="Preview"
                      width={128}
                      height={80}
                      className="w-32 h-20 object-cover rounded border border-white"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAboutusImageUpload(e.target.files?.[0] || null)
                  }
                  className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                />
                {isAboutusUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-[#5b8a76] h-2.5 rounded-full"
                      style={{ width: `${AboutusUploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-center">
                      {AboutusUploadProgress}%
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAboutusImageUpload}
                  disabled={!AboutusImageUpload || isAboutusUploading}
                  className="w-full px-4 py-2 bg-[#5b8a76] rounded hover:bg-[#4a7563] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAboutusUploading
                    ? "Uploading..."
                    : "Upload Image to Supabase"}
                </button>
                <div className="mt-2">
                  <p className="text-sm text-center mb-1">- OR -</p>
                  <input
                    type="text"
                    placeholder="Or enter image URL directly"
                    value={AboutusImage}
                    onChange={(e) => setAboutusImage(e.target.value)}
                    className="w-full p-2 text-gray-800 rounded border border-white"
                  />
                </div>
              </div>
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
                <div className="border border-white rounded p-3 bg-[#69959e]">
                  <label className="block text-sm font-medium mb-2">
                    Blog Image
                  </label>
                  {blogImage && (
                    <div className="mb-3">
                      <p className="text-sm mb-1">Current Image:</p>
                      <Image
                        src={blogImage}
                        alt="Preview"
                        width={128}
                        height={80}
                        className="w-32 h-20 object-cover rounded border border-white"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setBlogImageUpload(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                  />
                  {isBlogUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#5b8a76] h-2.5 rounded-full"
                        style={{ width: `${blogUploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-center">
                        {blogUploadProgress}%
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleBlogImageUpload}
                    disabled={!blogImageUpload || isBlogUploading}
                    className="w-full px-4 py-2 bg-[#5b8a76] rounded hover:bg-[#4a7563] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBlogUploading
                      ? "Uploading..."
                      : "Upload Image to Supabase"}
                  </button>
                  <div className="mt-2">
                    <p className="text-sm text-center mb-1">- OR -</p>
                    <input
                      type="text"
                      placeholder="Or enter image URL directly"
                      value={blogImage}
                      onChange={(e) => setBlogImage(e.target.value)}
                      className="w-full p-2 text-gray-800 rounded border border-white"
                    />
                  </div>
                </div>
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
                      {blog.image && (
                        <div className="mt-2">
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            width={128}
                            height={80}
                            className="w-32 h-20 object-cover rounded"
                          />
                        </div>
                      )}
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

          {/* Universities Section */}
          {activeSection === "universities" && (
            <section
              id="universities"
              className="bg-[#5b8a76] p-6 rounded shadow"
            >
              <h2 className="text-2xl font-bold mb-4">Manage Universities</h2>
              <div className="mb-6 space-y-2 bg-[#69959e] p-4 rounded">
                <h3 className="text-lg font-bold mb-2">
                  {universityEditId ? "Edit University" : "Add New University"}
                </h3>
                <input
                  type="text"
                  placeholder="University Name *"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full p-2 text-gray-800 rounded border border-white"
                />
                <div className="border border-white rounded p-3 bg-[#5b8a76] mt-2">
                  <label className="block text-sm font-medium mb-2">
                    University Logo
                  </label>
                  {universityImage && (
                    <div className="mb-3">
                      <p className="text-sm mb-1">Current Logo:</p>
                      <Image
                        src={universityImage}
                        alt="Preview"
                        width={128}
                        height={80}
                        className="w-32 h-20 object-contain rounded border border-white bg-white p-2"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setUniversityImageUpload(e.target.files?.[0] || null)
                    }
                    className="w-full p-2 text-gray-800 rounded border border-white mb-2"
                  />
                  {isUniversityUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#5b8a76] h-2.5 rounded-full"
                        style={{ width: `${universityUploadProgress}%` }}
                      ></div>
                      <p className="text-xs text-center">
                        {universityUploadProgress}%
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUniversityImageUpload}
                    disabled={!universityImageUpload || isUniversityUploading}
                    className="w-full px-4 py-2 bg-[#4a7563] rounded hover:bg-[#3a5f4d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUniversityUploading
                      ? "Uploading..."
                      : "Upload Logo to Supabase"}
                  </button>
                  <div className="mt-2">
                    <p className="text-sm text-center mb-1">- OR -</p>
                    <input
                      type="text"
                      placeholder="Or enter image URL directly"
                      value={universityImage}
                      onChange={(e) => setUniversityImage(e.target.value)}
                      className="w-full p-2 text-gray-800 rounded border border-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUniversitySubmit}
                    disabled={!universityName.trim()}
                    className="px-4 py-2 bg-[#5b8a76] rounded hover:bg-[#4a7563] transition disabled:opacity-50"
                  >
                    {universityEditId ? "Update University" : "Add University"}
                  </button>
                  {universityEditId && (
                    <button
                      onClick={handleUniversityCancel}
                      className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold mb-2">Universities List</h3>
                {universities.length === 0 ? (
                  <p className="text-center py-4">
                    No universities yet. Add your first university above.
                  </p>
                ) : (
                  universities.map((university) => (
                    <div
                      key={university.id}
                      className="p-4 bg-[#69959e] rounded flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        {university.image && (
                          <Image
                            src={university.image}
                            alt={university.name}
                            width={64}
                            height={48}
                            className="w-16 h-12 object-contain bg-white rounded border border-white p-1"
                          />
                        )}
                        <div>
                          <h3 className="font-bold">{university.name}</h3>
                          {university.image && (
                            <span className="text-xs text-gray-200">
                              Has logo
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUniversityEdit(university)}
                          className="px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-400 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUniversityDelete(university.id)}
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
        </div>
      </div>
    </div>
  );
}
