"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Packages", href: "#packages" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = () => setMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md shadow-md shadow-brown/5 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className={`font-heading text-2xl transition-colors duration-300 ${
            scrolled
              ? "text-brown hover:text-terracotta"
              : "text-cream hover:text-marigold"
          }`}
        >
          México Lindo Y Que Rico
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-sm transition-colors duration-300 tracking-wide uppercase ${
                  scrolled
                    ? "text-brown/60 hover:text-terracotta"
                    : "text-cream/80 hover:text-marigold"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/booking"
              className="text-sm px-6 py-2.5 bg-marigold text-brown font-semibold rounded-full hover:bg-marigold-light transition-all duration-300 hover:shadow-lg hover:shadow-marigold/20"
            >
              Book Now
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 transition-all duration-300 ${
              scrolled ? "bg-brown" : "bg-cream"
            } ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-all duration-300 ${
              scrolled ? "bg-brown" : "bg-cream"
            } ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-all duration-300 ${
              scrolled ? "bg-brown" : "bg-cream"
            } ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-cream/98 backdrop-blur-lg border-t border-brown/10 px-6 py-8">
          <ul className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={handleLinkClick}
                  className="text-lg text-brown/70 hover:text-terracotta transition-colors duration-300 tracking-wide"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                onClick={handleLinkClick}
                className="inline-block text-lg px-8 py-3 bg-marigold text-brown font-semibold rounded-full hover:bg-marigold-light transition-all duration-300"
              >
                Book Now
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
