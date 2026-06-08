"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    icon: "💬",
    title: "Tell the AI",
    desc: "Describe your dream trip — destination, budget, travel style, and duration.",
    color: "#0ea5e9",
  },
  {
    step: "02",
    icon: "🧠",
    title: "AI Crafts Your Plan",
    desc: "Gemini AI generates a complete day-by-day itinerary with costs and places.",
    color: "#8b5cf6",
  },
  {
    step: "03",
    icon: "✈️",
    title: "Book & Go",
    desc: "Book your trip directly from the plan. One click to your next adventure.",
    color: "#22c55e",
  },
];

interface AIPlannerHighlightProps {
  progress: number;
}

export default function AIPlannerHighlight({ progress }: AIPlannerHighlightProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        style={{
          opacity: Math.min(1, progress * 3),
          transform: `translateY(${Math.max(0, (1 - progress * 2) * 40)}px)`,
        }}
      >
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Powered by Gemini AI
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Plan Smart.{" "}
          <span className="text-gradient">Travel Better.</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Let our AI do the heavy lifting — from itinerary to costs to booking,
          all in seconds.
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {steps.map((s, i) => {
          const stepP = Math.max(0, Math.min(1, (progress - i * 0.15) * 4));
          return (
            <motion.div
              key={s.step}
              className="glass rounded-2xl p-6 relative overflow-hidden group"
              style={{
                opacity: stepP,
                transform: `translateY(${(1 - stepP) * 40}px)`,
                transition: "opacity 0.5s, transform 0.5s",
                border: `1px solid ${s.color}30`,
                boxShadow: `0 8px 32px ${s.color}15`,
              }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Background number */}
              <span
                className="absolute -top-4 -right-2 text-8xl font-black opacity-5 select-none"
                style={{ color: s.color }}
              >
                {s.step}
              </span>
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{s.icon}</span>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>

              {/* Step badge */}
              <div
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: s.color }}
              >
                {s.step}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mock AI chat */}
      <motion.div
        className="glass-strong rounded-2xl p-5 max-w-lg mx-auto"
        style={{
          opacity: Math.min(1, Math.max(0, (progress - 0.5) * 3)),
          transform: `scale(${Math.min(1, Math.max(0.9, 0.9 + (progress - 0.5) * 0.2))})`,
        }}
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Wanderlust AI</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">Online</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-end">
            <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-tr-sm px-4 py-2 text-sm text-white max-w-[80%]">
              Plan a 5-day trip to Bali under $1500 🌴
            </div>
          </div>
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200 max-w-[85%]">
              <p className="font-semibold text-white mb-1">✨ Here's your Bali itinerary!</p>
              <p className="text-slate-400 text-xs">Day 1: Seminyak Beach → Tanah Lot Sunset</p>
              <p className="text-slate-400 text-xs">Day 2: Ubud Monkey Forest → Rice Terraces</p>
              <p className="text-slate-400 text-xs">...</p>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-emerald-400 text-xs font-semibold">Total: $1,248</span>
                <span className="text-sky-400 text-xs">5 days · 12 places</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
