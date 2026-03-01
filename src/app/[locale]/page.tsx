"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Menu from "@/components/Menu";
import Packages from "@/components/Packages";
import Extras from "@/components/Extras";
import PaymentMethods from "@/components/PaymentMethods";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        <PaymentMethods />
        <Packages />
        <Extras />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
