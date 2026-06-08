"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Navbar from "@/components/Navbar";
import MapPreview from "@/components/MapPreview";
import FeatureGrid from "@/components/FeatureGrid";
import AIPlannerHighlight from "@/components/AIPlannerHighlight";

// ─── Hook: subscribe MotionValue → React state ────────────────────────────────
function useMotionValueState(mv: MotionValue<number>): number {
  const [value, setValue] = useState<number>(mv.get());
  useEffect(() => {
    const unsub = mv.on("change", setValue);
    return unsub;
  }, [mv]);
  return value;
}

// ─── Particle field ───────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.45 + 0.1,
  color: i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#22c55e" : "#ffffff",
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, opacity: p.opacity }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Orbital ring ─────────────────────────────────────────────────────────────
function OrbitalRing({ size, duration, delay }: { size: number; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-sky-500/10 pointer-events-none"
      style={{ width: size, height: size, left: `calc(50% - ${size / 2}px)`, top: `calc(50% - ${size / 2}px)` }}
      animate={{ rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="absolute w-3 h-3 rounded-full bg-sky-400/80"
        style={{ top: -6, left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 12px #0ea5e9" }}
      />
    </motion.div>
  );
}

// ─── Section scroll helper ────────────────────────────────────────────────────
function useSectionProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return useSpring(scrollYProgress, { damping: 20, stiffness: 80 });
}

// ─── Wrappers that convert MotionValue → plain number for children ─────────────
function FeaturesSection({ progress }: { progress: MotionValue<number> }) {
  const p = useMotionValueState(progress);
  return <FeatureGrid progress={p} />;
}
function AISection({ progress }: { progress: MotionValue<number> }) {
  const p = useMotionValueState(progress);
  return <AIPlannerHighlight progress={p} />;
}
function MapSection({ progress }: { progress: MotionValue<number> }) {
  const p = useMotionValueState(progress);
  return <MapPreview progress={p} />;
}
function NavbarSection({ progress }: { progress: MotionValue<number> }) {
  const p = useMotionValueState(progress);
  return <Navbar scrollProgress={p} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  // Section refs
  const heroRef    = useRef<HTMLDivElement>(null);
  const featsRef   = useRef<HTMLDivElement>(null);
  const aiRef      = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  // Global scroll for navbar
  const { scrollYProgress: globalRaw } = useScroll();
  const globalProgress = useSpring(globalRaw, { damping: 20, stiffness: 80 });

  // Per-section scroll
  const heroP  = useSectionProgress(heroRef);
  const featsP = useSectionProgress(featsRef);
  const aiP    = useSectionProgress(aiRef);
  const mapP   = useSectionProgress(mapRef);
  const ctaP   = useSectionProgress(ctaRef);

  // Hero transforms
  const heroOpacity = useTransform(heroP, [0, 0.25, 0.85], [0, 1, 0]);
  const heroY       = useTransform(heroP, [0, 0.25, 0.85], [80, 0, -60]);
  const heroScale   = useTransform(heroP, [0, 0.2, 0.85], [0.85, 1, 0.95]);
  const globeScale  = useTransform(heroP, [0, 0.35], [0.2, 1]);
  const globeRotate = useTransform(heroP, [0, 1], [0, 200]);

  // Features
  const featsOpacity = useTransform(featsP, [0, 0.15, 0.88], [0, 1, 0]);
  const featsY       = useTransform(featsP, [0, 0.2], [60, 0]);

  // AI
  const aiOpacity = useTransform(aiP, [0, 0.15, 0.88], [0, 1, 0]);
  const aiY       = useTransform(aiP, [0, 0.2], [60, 0]);

  // Map
  const mapOpacity = useTransform(mapP, [0, 0.15, 0.88], [0, 1, 0]);

  // CTA
  const ctaOpacity = useTransform(ctaP, [0, 0.2, 0.95], [0, 1, 0]);
  const ctaScale   = useTransform(ctaP, [0, 0.22], [0.85, 1]);

  return (
    <main className="bg-[#020617] relative">
      {/* Navbar */}
      <NavbarSection progress={globalProgress} />

      {/* ══ SECTION 1 ── HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} id="hero" className="relative" style={{ height: "360vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center dots-bg">
          <ParticleField />

          {/* Orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <OrbitalRing size={320} duration={28} delay={0} />
            <OrbitalRing size={500} duration={40} delay={-7} />
            <OrbitalRing size={680} duration={55} delay={-14} />
          </div>

          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(14,165,233,0.13) 0%, transparent 70%)" }} />

          <motion.div
            className="relative z-10 text-center px-6 max-w-5xl mx-auto"
            style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          >
            {/* Pill badge */}
            <motion.div
              className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">
                AI-Powered Travel Planning
              </span>
            </motion.div>

            {/* Globe */}
            <motion.div
              className="text-7xl md:text-9xl mb-4 select-none"
              style={{ scale: globeScale, rotate: globeRotate }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              🌍
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-6 tracking-tight"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            >
              <span className="text-gradient-hero">Explore</span>
              <br />
              <span className="text-white">the World</span>
              <br />
              <span className="text-gradient">Differently</span>
            </motion.h1>

            <motion.p
              className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Let AI craft your perfect itinerary, discover hidden gems, and book everything in one seamless experience.
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.a
                href="#cta"
                className="relative px-8 py-4 rounded-2xl font-bold text-white text-base overflow-hidden group inline-flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #22c55e)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10">Start Planning Free</span>
                <span className="relative z-10 text-lg">→</span>
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
              <motion.a
                href="#features"
                className="px-8 py-4 rounded-2xl font-semibold text-white/80 text-base glass border border-white/10 inline-flex items-center justify-center gap-2 hover:border-sky-500/40 transition-colors"
                whileHover={{ scale: 1.03 }}
              >
                <span>See Features</span>
                <span>↓</span>
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 mt-14"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              {[{ v: "2M+", l: "Travelers" }, { v: "190+", l: "Countries" }, { v: "4.9★", l: "Rating" }, { v: "50K+", l: "AI Trips" }].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-2xl font-black text-gradient">{s.v}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-slate-500 text-xs uppercase tracking-widest">Scroll to explore</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-sky-400 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 2 ── FEATURES ══════════════════════════════════════════ */}
      <section ref={featsRef} id="features" className="relative" style={{ height: "400vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />

          <motion.div className="w-full relative z-10" style={{ opacity: featsOpacity, y: featsY }}>
            <div className="text-center mb-10 px-6">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
                <span className="text-sky-400 text-xs font-semibold uppercase tracking-wider">⚡ Everything you need</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
                Built for <span className="text-gradient">Modern Travelers</span>
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                From AI planning to live maps, every tool crafted to make travel effortless.
              </p>
            </div>
            <FeaturesSection progress={featsP} />
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 3 ── AI PLANNER ════════════════════════════════════════ */}
      <section ref={aiRef} id="ai-planner" className="relative" style={{ height: "400vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 70% 50%, rgba(14,165,233,0.08) 0%, transparent 60%)" }} />
          <motion.div className="w-full relative z-10" style={{ opacity: aiOpacity, y: aiY }}>
            <AISection progress={aiP} />
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 4 ── MAP ═══════════════════════════════════════════════ */}
      <section ref={mapRef} id="map" className="relative" style={{ height: "350vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none dots-bg opacity-50" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(14,165,233,0.08) 0%, transparent 70%)" }} />
          <motion.div className="w-full max-w-5xl mx-auto px-6 relative z-10" style={{ opacity: mapOpacity }}>
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
                Your Journey, <span className="text-gradient">Mapped</span>
              </h2>
              <p className="text-slate-400 text-lg">Watch your route come alive as you plan.</p>
            </div>
            <MapSection progress={mapP} />
          </motion.div>
        </div>
      </section>

      {/* ══ SECTION 5 ── CTA ═══════════════════════════════════════════════ */}
      <section ref={ctaRef} id="cta" className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          {/* Ambient orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #0ea5e9, transparent)", top: "8%", left: "8%" }}
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #22c55e, transparent)", bottom: "8%", right: "8%" }}
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <motion.div
            className="relative z-10 text-center px-6 max-w-3xl mx-auto"
            style={{ opacity: ctaOpacity, scale: ctaScale }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ✈️
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-none">
              Your Next
              <br />
              <span className="text-gradient">Adventure</span>
              <br />
              Awaits
            </h2>

            <p className="text-slate-400 text-xl mb-10 max-w-xl mx-auto">
              Join 2 million travelers who plan smarter with Wanderlust AI. Your first itinerary is completely free.
            </p>

            <motion.a
              href="/"
              className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-lg overflow-hidden group"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #22c55e)" }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10">Start Your Journey</span>
              <span className="relative z-10 text-2xl">🚀</span>
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>

            <p className="text-slate-600 text-sm mt-6 flex flex-wrap items-center justify-center gap-4">
              <span>✓ No credit card needed</span>
              <span>✓ Free forever plan</span>
              <span>✓ 2 min setup</span>
            </p>

            <div className="flex justify-center mt-10 gap-3">
              {["🇺🇸", "🇬🇧", "🇯🇵", "🇦🇺", "🇮🇳", "🇧🇷"].map((flag) => (
                <span key={flag} className="text-2xl">{flag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="relative bg-[#020617] border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span className="font-bold text-white">Wander<span className="text-gradient">lust</span></span>
          </div>
          <p className="text-slate-600 text-sm">© 2026 Wanderlust. Built with ❤️ for travelers worldwide.</p>
          <div className="flex gap-6 text-slate-500 text-sm">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
