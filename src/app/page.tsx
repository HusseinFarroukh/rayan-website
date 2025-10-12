// app/page.tsx (أو pages/index.tsx حسب مشروعك)
import Header from "../Components/Header";
import Hero from "../Components/Hero";
import Services from "../Components/Services";
import Footer from "../Components/Footer";
import Universities from "../Components/uniactivities";
import Activities from "../Components/Activities";
import Aboutus from "../Components/About-us";
import Blogs from "../Components/blogs";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Universities />
      <Services />
      <Activities />
      <Aboutus />
      <Blogs />
      <Footer />
    </>
  );
}
