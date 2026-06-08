"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🤖",
    title: "AI Trip Planner",
    desc: "Generate day-by-day itineraries with cost breakdowns powered by Gemini AI.",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    glow: "rgba(14,165,233,0.15)",
  },
  {
    icon: "🗺️",
    title: "Smart Booking",
    desc: "Book hotels, flights, and activities in one seamless flow with real pricing.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    glow: "rgba(34,197,94,0.15)",
  },
  {
    icon: "📍",
    title: "Live Maps",
    desc: "Explore destinations interactively with route planning and place discovery.",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: "❤️",
    title: "Wishlist",
    desc: "Save dream destinations and share curated travel lists with friends.",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
    glow: "rgba(244,63,94,0.15)",
  },
  {
    icon: "⚡",
    title: "Instant Costs",
    desc: "Real-time fare estimates from source to destination using live distance APIs.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: "🌙",
    title: "Dark Mode",
    desc: "Beautiful light and dark themes that adapt to your preference automatically.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/30",
    glow: "rgba(99,102,241,0.15)",
  },
];

interface FeatureGridProps {
  progress: number;
}

export default function FeatureGrid({ progress }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mx-auto px-6">
      {features.map((f, i) => {
        const delay = i * 0.15;
        const itemProgress = Math.max(0, Math.min(1, (progress - delay * 0.5) * 3));

        return (
          <motion.div
            key={f.title}
            className={`relative rounded-2xl p-5 bg-gradient-to-br ${f.color} border ${f.border} cursor-default group overflow-hidden`}
            style={{
              opacity: itemProgress,
              transform: `translateY(${(1 - itemProgress) * 30}px)`,
              transition: "opacity 0.5s, transform 0.5s",
              boxShadow: `0 8px 32px ${f.glow}`,
            }}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            <div className="relative z-10">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
