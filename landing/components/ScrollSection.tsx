"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollSectionProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
  id?: string;
}

export default function ScrollSection({
  children,
  height = "300vh",
  className = "",
  id,
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 20,
    stiffness: 80,
    mass: 0.5,
  });

  return (
    <section
      ref={ref}
      id={id}
      className={`relative ${className}`}
      style={{ height }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {children}
      </div>
    </section>
  );
}

// Utility hook for section-level scroll progress
export function useSectionScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    damping: 25,
    stiffness: 100,
    mass: 0.5,
  });
  return { ref, scrollYProgress, smooth };
}
