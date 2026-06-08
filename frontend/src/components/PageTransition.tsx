import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** Top progress bar that plays on every route change */
export function RouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start bar
    setProgress(0);
    setVisible(true);

    const ramp = (target: number, delay: number) => {
      timerRef.current = setTimeout(() => {
        setProgress(target);
      }, delay);
    };

    ramp(30, 50);
    ramp(60, 200);
    ramp(85, 500);
    ramp(100, 700);

    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(hide);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all ease-out"
      style={{
        width: `${progress}%`,
        background: "linear-gradient(90deg, #0ea5e9, #22c55e, #f97316)",
        boxShadow: "0 0 8px rgba(14,165,233,0.6)",
        transitionDuration: progress === 100 ? "200ms" : "400ms",
      }}
    />
  );
}

/** Full-screen onboarding overlay shown once right after login */
export function OnboardingOverlay({
  show,
  onDone,
}: {
  show: boolean;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #0c4a6e 60%, #0F172A 100%)",
        animation: "fadeInOverlay 0.3s ease-out, fadeOutOverlay 0.5s ease-in 1.3s forwards",
      }}
    >
      <style>{`
        @keyframes fadeInOverlay  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOutOverlay { from { opacity: 1 } to { opacity: 0; pointer-events: none; } }
        @keyframes orbitSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulseRing {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Animated orbs */}
      <div className="absolute top-20 left-20 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-nature-500/15 blur-3xl" />

      {/* Pulse ring */}
      <div
        className="absolute w-28 h-28 rounded-full border-2 border-brand-400/40"
        style={{ animation: "pulseRing 1.2s ease-out infinite" }}
      />

      {/* Globe icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 relative z-10"
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          boxShadow: "0 0 40px rgba(14,165,233,0.5)",
        }}
      >
        🌍
      </div>

      <h2 className="text-white text-2xl font-extrabold tracking-tight mb-2 relative z-10">
        Preparing your journey...
      </h2>
      <p className="text-white/50 text-sm relative z-10">Wanderlust AI Travel Planner</p>

      {/* Animated dots */}
      <div className="flex gap-2 mt-6 relative z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-400"
            style={{
              animation: `pulseSoft 1s ease-in-out ${i * 250}ms infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
