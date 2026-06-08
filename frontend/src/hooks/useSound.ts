/**
 * useSound — lightweight Web Audio API sound effects
 * No external library needed. Stores mute preference in localStorage.
 */

const CTX_KEY = "__wl_audio_ctx__";

function getCtx(): AudioContext | null {
  try {
    if (!(window as any)[CTX_KEY]) {
      (window as any)[CTX_KEY] = new AudioContext();
    }
    return (window as any)[CTX_KEY] as AudioContext;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  return localStorage.getItem("wl_sound") === "off";
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  fadeDuration?: number
) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  const vol = Math.min(volume, 0.3);
  gain.gain.setValueAtTime(vol, ctx.currentTime);

  const fade = fadeDuration ?? duration * 0.4;
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + fade);
}

export const SFX = {
  /** Soft click for button interactions */
  click: () => playTone(880, "sine", 0.06, 0.12),

  /** Success chime — two-tone ascending */
  success: () => {
    playTone(523, "sine", 0.18, 0.14);
    setTimeout(() => playTone(659, "sine", 0.22, 0.16), 120);
  },

  /** Navigation soft click */
  nav: () => playTone(440, "sine", 0.05, 0.08),

  /** Error tone — descending */
  error: () => {
    playTone(440, "sawtooth", 0.1, 0.1);
    setTimeout(() => playTone(330, "sawtooth", 0.15, 0.08), 80);
  },

  /** Subtle toggle pop */
  toggle: () => playTone(660, "triangle", 0.07, 0.1),
};

export function toggleSound(): boolean {
  const next = isMuted() ? "on" : "off";
  localStorage.setItem("wl_sound", next);
  return next === "on";
}

export function isSoundEnabled(): boolean {
  return !isMuted();
}
