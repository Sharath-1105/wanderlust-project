import { useState } from "react";
import { toggleSound, isSoundEnabled, SFX } from "../hooks/useSound";

interface SoundToggleProps {
  /** Render as an icon-only square button (default) or with label */
  showLabel?: boolean;
  /** For placement on dark backgrounds */
  dark?: boolean;
}

export default function SoundToggle({ showLabel, dark }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(isSoundEnabled);

  const handleToggle = () => {
    const next = toggleSound();
    setEnabled(next);
    if (next) SFX.toggle(); // Play a sound only when turning ON
  };

  const baseClass = dark
    ? "flex items-center gap-1.5 text-white/60 hover:text-white/90 text-sm transition-colors"
    : "flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 text-sm transition-colors";

  return (
    <button
      id="sound-toggle"
      onClick={handleToggle}
      className={baseClass}
      title={enabled ? "Mute sounds" : "Enable sounds"}
      aria-label={enabled ? "Mute sounds" : "Enable sounds"}
    >
      <span className="text-base">{enabled ? "🔊" : "🔇"}</span>
      {showLabel && (
        <span className="text-xs font-medium">{enabled ? "Sound On" : "Muted"}</span>
      )}
    </button>
  );
}
