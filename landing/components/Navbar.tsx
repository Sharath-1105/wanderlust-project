"use client";

import { motion, useSpring } from "framer-motion";

const stats = [
  { value: "2M+", label: "Travelers" },
  { value: "190+", label: "Countries" },
  { value: "4.9★", label: "Rating" },
  { value: "50K+", label: "Trips Planned" },
];

interface NavbarProps {
  scrollProgress: number;
}

export default function Navbar({ scrollProgress }: NavbarProps) {
  const isScrolled = scrollProgress > 0.01;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: isScrolled
          ? "rgba(2, 6, 23, 0.85)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        borderBottom: isScrolled
          ? "1px solid rgba(14, 165, 233, 0.15)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-sm">
            🌍
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Wander<span className="text-gradient">lust</span>
          </span>
        </motion.div>

        {/* Links */}
        <motion.div
          className="hidden md:flex items-center gap-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {["Features", "Map", "AI Planner", "Pricing"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          href="#cta"
          className="relative px-5 py-2 rounded-full text-sm font-semibold text-white overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="relative z-10">Start Free</span>
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.a>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-transparent">
        <motion.div
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #0ea5e9, #22c55e)",
            width: `${scrollProgress * 100}%`,
          }}
        />
      </div>
    </motion.nav>
  );
}
