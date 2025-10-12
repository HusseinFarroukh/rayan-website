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
    <section className="py-20 px-30 text-[#020d2b] text-center">
      <h2 className="text-3xl font-bold mb-12">{servicesTitle}</h2>
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-8 px-4 ${
          services.length === 1 ? "justify-items-center" : ""
        }`}
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="w-full p-6 shadow-lg rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white max-w-md"
          >
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
