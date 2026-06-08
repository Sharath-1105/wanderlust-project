"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// City coordinates mapped to SVG viewport (800x450)
const cities = [
  { name: "New York",   x: 195, y: 155, emoji: "🗽" },
  { name: "London",     x: 390, y: 115, emoji: "🎡" },
  { name: "Dubai",      x: 560, y: 195, emoji: "🏙️" },
  { name: "Tokyo",      x: 698, y: 158, emoji: "⛩️" },
  { name: "Bali",       x: 670, y: 270, emoji: "🌴" },
  { name: "Sydney",     x: 718, y: 345, emoji: "🦘" },
];

// SVG path connecting the cities
const pathD = cities.reduce((acc, city, i) => {
  if (i === 0) return `M ${city.x} ${city.y}`;
  const prev = cities[i - 1];
  const cpx = (prev.x + city.x) / 2;
  return acc + ` C ${cpx} ${prev.y}, ${cpx} ${city.y}, ${city.x} ${city.y}`;
}, "");

interface MapPreviewProps {
  progress: number;
}

export default function MapPreview({ progress }: MapPreviewProps) {
  const dashOffset = Math.max(0, 1000 - progress * 1000);
  const visibleCities = Math.floor(progress * (cities.length + 1));

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Map container */}
      <div className="glass rounded-3xl p-2 glow-sky">
        <div className="relative bg-[#030d1f] rounded-2xl overflow-hidden">
          {/* Grid lines */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0ea5e9" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#grid)" />
          </svg>

          {/* World map SVG */}
          <svg
            viewBox="0 0 800 450"
            className="w-full h-auto"
            style={{ minHeight: 220 }}
          >
            {/* Continents (simplified shapes) */}
            <g opacity="0.25" fill="#0ea5e9">
              {/* North America */}
              <path d="M80 100 L220 90 L230 200 L180 240 L100 220 Z" />
              {/* South America */}
              <path d="M160 250 L210 245 L215 360 L165 375 Z" />
              {/* Europe */}
              <path d="M360 90 L440 85 L445 165 L365 170 Z" />
              {/* Africa */}
              <path d="M365 175 L440 170 L445 310 L385 330 Z" />
              {/* Asia */}
              <path d="M450 80 L730 75 L735 270 L455 275 Z" />
              {/* Australia */}
              <path d="M655 295 L750 290 L755 380 L660 385 Z" />
            </g>

            {/* Route path */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#routeGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={dashOffset}
              initial={false}
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* City markers */}
            {cities.map((city, i) => {
              const visible = i < visibleCities;
              return (
                <g key={city.name} opacity={visible ? 1 : 0} style={{ transition: "opacity 0.5s" }}>
                  {/* Pulse ring */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="14"
                    fill="url(#cityGlow)"
                    className="animate-pulse-slow"
                  />
                  {/* Dot */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="5"
                    fill="#0EA5E9"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  {/* Label */}
                  <text
                    x={city.x}
                    y={city.y - 16}
                    fill="white"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {city.emoji} {city.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* City chips below map */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {cities.map((city, i) => (
          <motion.div
            key={city.name}
            className="glass rounded-full px-3 py-1 text-xs font-medium text-sky-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: i < visibleCities ? 1 : 0,
              y: i < visibleCities ? 0 : 10,
            }}
            transition={{ duration: 0.4 }}
          >
            {city.emoji} {city.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
