"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Service {
  title: string;
  description: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesTitle, setServicesTitle] = useState(
    "Here is What You Gain from Our Services"
  );

  useEffect(() => {
    // Fetch Services
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs.map(
        (doc) => doc.data() as Service
      );
      setServices(servicesData);
    };

    // Fetch Services Title using snapshot
    const fetchServicesTitle = async () => {
      const querySnapshot = await getDocs(collection(db, "home"));
      querySnapshot.forEach((doc) => {
        if (doc.id === "ServicesTitle") {
          const data = doc.data();
          setServicesTitle(data.title); // استخدام الحقل title
        }
      });
    };

    fetchServices();
    fetchServicesTitle();
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-30 text-[#020d2b] text-center">
      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 lg:mb-12 px-2 sm:px-0">
        {servicesTitle}
      </h2>

      {/* Services Grid */}
      <div
        className={`grid grid-cols-1 ${
          services.length >= 2 ? "sm:grid-cols-2" : ""
        } ${
          services.length >= 3 ? "lg:grid-cols-3" : ""
        } gap-6 sm:gap-8 max-w-7xl mx-auto ${
          services.length === 1 ? "justify-center max-w-md" : ""
        }`}
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="w-full p-5 sm:p-6 lg:p-8 shadow-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white flex flex-col"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed flex-1">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
