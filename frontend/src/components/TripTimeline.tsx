// ─── TripTimeline.tsx ─────────────────────────────────────────
// Day-wise timeline view for a booked trip.
// Places are distributed across days (max 3/day) using the trip's
// startDate. No backend changes required — transforms client-side.

interface TripPlace {
  name: string;
  type?: string;
  location?: string;
  district?: string;
  state?: string;
  entryFee?: number;
  transportCost?: number;
  price?: number;
  description?: string;
}

interface DayGroup {
  day: number;                 // 1-indexed
  date: Date | null;
  label: string;               // "Day 1 — Tue, 1 Apr"
  places: TripPlace[];
  dayCost: number;
}

interface TripTimelineProps {
  places: TripPlace[];
  days: number;
  startDate?: string | null;
  persons?: number;
}

// ─── Type config ──────────────────────────────────────────────
const TYPE_META: Record<string, { emoji: string; bg: string; ring: string; text: string }> = {
  Beach:    { emoji: "🏖️", bg: "bg-cyan-50",   ring: "ring-cyan-300",    text: "text-cyan-700"    },
  Hill:     { emoji: "⛰️", bg: "bg-emerald-50", ring: "ring-emerald-300", text: "text-emerald-700" },
  City:     { emoji: "🌆", bg: "bg-violet-50",  ring: "ring-violet-300",  text: "text-violet-700"  },
  Forest:   { emoji: "🌿", bg: "bg-green-50",   ring: "ring-green-300",   text: "text-green-700"   },
  Heritage: { emoji: "🏛️", bg: "bg-amber-50",   ring: "ring-amber-300",   text: "text-amber-700"   },
  Other:    { emoji: "📍", bg: "bg-gray-50",    ring: "ring-gray-200",    text: "text-gray-600"    },
};

const DAY_GRADIENT = [
  "from-indigo-500 to-violet-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-purple-500 to-indigo-500",
  "from-lime-500 to-green-500",
];

// ─── Format date ──────────────────────────────────────────────
function fmtDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Day-group builder ────────────────────────────────────────
function buildDayGroups(
  places: TripPlace[],
  days: number,
  startDate?: string | null,
  persons = 1
): DayGroup[] {
  if (!places || places.length === 0 || days < 1) return [];

  const maxPerDay = 3;
  const groups: DayGroup[] = [];

  for (let d = 0; d < days; d++) {
    // Distribute places round-robin by day index
    const dayPlaces = places.filter((_, i) => i % days === d);
    // Respect 3-per-day cap
    const capped = dayPlaces.slice(0, maxPerDay);

    const date = startDate ? new Date(startDate) : null;
    if (date) date.setDate(date.getDate() + d);

    const dayCost = capped.reduce(
      (sum, p) => sum + (Number(p.entryFee) || 0) + (Number(p.transportCost) || 0),
      0
    ) * persons;

    groups.push({
      day: d + 1,
      date,
      label: date ? `Day ${d + 1} — ${fmtDate(date)}` : `Day ${d + 1}`,
      places: capped,
      dayCost,
    });
  }

  return groups;
}

// ─── Place Card ───────────────────────────────────────────────
function PlaceCard({ place, index }: { place: TripPlace; index: number }) {
  const meta = TYPE_META[place.type || "Other"] || TYPE_META.Other;
  return (
    <div className={`flex gap-3 ${meta.bg} ring-1 ${meta.ring} rounded-xl p-3 transition hover:shadow-sm`}>
      {/* Step number bubble */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white ring-1 ring-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm mt-0.5">
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-base flex-shrink-0">{meta.emoji}</span>
            <p className="font-bold text-gray-800 text-sm leading-tight truncate">{place.name}</p>
          </div>
          {place.type && (
            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${meta.text} bg-white ring-1 ${meta.ring}`}>
              {place.type}
            </span>
          )}
        </div>

        {/* Location */}
        {(place.district || place.state || place.location) && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            📍 {[place.district, place.state].filter(Boolean).join(", ") || place.location}
          </p>
        )}

        {/* Costs */}
        <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
          <span>🎟 Entry: <b className="text-gray-700">₹{place.entryFee || 0}</b></span>
          <span>🚌 Transport: <b className="text-gray-700">₹{place.transportCost || 0}</b></span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TripTimeline({ places, days, startDate, persons = 1 }: TripTimelineProps) {
  const groups = buildDayGroups(places, days, startDate, persons);

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No places to display in timeline.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          📅 Trip Timeline
        </h3>
        <span className="text-xs text-gray-400">{days} day{days > 1 ? "s" : ""} · {places.length} place{places.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-pink-200 rounded-full" />

        <div className="space-y-6">
          {groups.map((group, gi) => {
            const gradient = DAY_GRADIENT[gi % DAY_GRADIENT.length];
            const hasPlaces = group.places.length > 0;

            return (
              <div key={group.day} className="relative flex gap-4">
                {/* Day dot */}
                <div className="relative flex-shrink-0 w-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center z-10`}>
                    <span className="text-white font-extrabold text-xs">{group.day}</span>
                  </div>
                </div>

                {/* Day content */}
                <div className="flex-1 pb-2">
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{group.label}</p>
                      {hasPlaces && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {group.places.length} stop{group.places.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    {group.dayCost > 0 && (
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-bold shadow-sm`}>
                        ₹{group.dayCost.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Place cards */}
                  {hasPlaces ? (
                    <div className="space-y-2.5">
                      {group.places.map((place, pi) => (
                        <PlaceCard key={pi} place={place} index={pi} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 ring-1 ring-gray-100 rounded-xl p-4 text-center text-gray-400 text-xs">
                      🛌 Rest day — no places scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total cost footer */}
      <div className="mt-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 flex items-center justify-between text-white">
        <div>
          <p className="text-xs opacity-75">Estimated trip cost ({persons} person{persons > 1 ? "s" : ""})</p>
          <p className="font-bold text-sm mt-0.5">
            {places.length} places across {days} day{days > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-75">Total</p>
          <p className="text-2xl font-extrabold">
            ₹{groups.reduce((s, g) => s + g.dayCost, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
