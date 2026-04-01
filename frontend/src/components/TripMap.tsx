import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet default marker icons (broken by Vite bundler) ─
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error — Leaflet internal property
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

// ─── Types ────────────────────────────────────────────────────
export interface TripPlace {
  name: string;
  location?: string;
  district?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  type?: string;
  entryFee?: number;
  transportCost?: number;
}

interface TripMapProps {
  places: TripPlace[];
  tripTitle?: string;
}

// ─── Type → marker colour ─────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  Beach:    "#0ea5e9",   // sky blue
  Hill:     "#22c55e",   // green
  City:     "#a855f7",   // purple
  Forest:   "#14b8a6",   // teal
  Heritage: "#f97316",   // orange
  Other:    "#ef4444",   // red
};

function makeColoredIcon(color: string, label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <path d="M16 0 C7.2 0 0 7.2 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.2 24.8 0 16 0Z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <text x="16" y="20.5" text-anchor="middle" font-size="10"
            font-family="system-ui,sans-serif" font-weight="700" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [32, 42],
    iconAnchor: [16, 42],
    popupAnchor:[0, -44],
  });
}

// ─── Geocode via Nominatim (free OSM geocoder) ────────────────
async function geocodeOSM(place: TripPlace): Promise<[number, number] | null> {
  // Try progressively simpler queries to maximise hit rate
  const queries = [
    [place.name, place.district, place.state, "India"].filter(Boolean).join(", "),
    [place.name, place.location, "India"].filter(Boolean).join(", "),
    [place.name, "India"].filter(Boolean).join(", "),
  ];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`,
        { headers: { "Accept-Language": "en", "User-Agent": "WanderlustApp/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      // Small delay between retries
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // network error — skip
    }
  }
  return null;
}

// ─── Route via OSRM (free routing engine) ────────────────────
async function fetchOSRMRoute(
  coords: [number, number][]
): Promise<[number, number][] | null> {
  if (coords.length < 2) return null;
  const waypoints = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM returns [lng, lat] — swap to [lat, lng] for Leaflet
      return (data.routes[0].geometry.coordinates as [number, number][]).map(
        ([lng, lat]) => [lat, lng]
      );
    }
    return null;
  } catch {
    return null;
  }
}

// ─── TripMap Component ────────────────────────────────────────
export default function TripMap({ places, tripTitle: _tripTitle }: TripMapProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  const [status, setStatus] = useState("Locating places on map…");
  const [located, setLocated] = useState(0);
  const [total]   = useState(places.length);
  const [hasRoute, setHasRoute] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Init map centred on India
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
    leafletRef.current = map;

    // OpenStreetMap tile layer — completely free
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    map.setView([20.5937, 78.9629], 5);

    let isMounted = true;

    (async () => {
      const coords: ([number, number] | null)[] = [];

      // ── Geocode each place ──────────────────────────────────
      for (let i = 0; i < places.length; i++) {
        if (!isMounted) return;
        const p = places[i];
        let coord: [number, number] | null = null;

        // Use stored lat/lng first (no API call needed)
        if (p.latitude != null && p.longitude != null) {
          coord = [p.latitude, p.longitude];
        } else {
          coord = await geocodeOSM(p);
          // Rate-limit Nominatim to 1 req/sec as required by their ToS
          await new Promise((r) => setTimeout(r, 1100));
        }

        coords.push(coord);
        if (isMounted && coord) setLocated((n) => n + 1);
      }

      if (!isMounted) return;

      const validCoords = coords.filter(Boolean) as [number, number][];

      // ── Add markers ─────────────────────────────────────────
      validCoords.forEach((pos, idx) => {
        const place = places[coords.indexOf(coords.filter(Boolean)[idx])];
        const color = TYPE_COLOR[place?.type || "Other"] || TYPE_COLOR.Other;
        const icon = makeColoredIcon(color, String(idx + 1));

        const marker = L.marker(pos, { icon }).addTo(map);
        const popupContent = `
          <div style="min-width:160px;font-family:system-ui,sans-serif">
            <b style="font-size:14px;color:#1e1b4b">${place?.name || "Place"}</b><br/>
            ${place?.location ? `<span style="font-size:12px;color:#6b7280">📍 ${place.location}</span><br/>` : ""}
            ${place?.type ? `<span style="font-size:11px;background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:999px">${place.type}</span><br/>` : ""}
            ${(place?.entryFee != null) ? `<span style="font-size:12px;color:#374151">🎟 Entry: ₹${place.entryFee}</span><br/>` : ""}
            ${(place?.transportCost != null) ? `<span style="font-size:12px;color:#374151">🚌 Transport: ₹${place.transportCost}</span>` : ""}
          </div>`;
        marker.bindPopup(popupContent, { maxWidth: 220 });
      });

      // ── Fit bounds ──────────────────────────────────────────
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 12);
      } else if (validCoords.length > 1) {
        map.fitBounds(L.latLngBounds(validCoords), { padding: [40, 40] });
      }

      // ── Draw route via OSRM ─────────────────────────────────
      if (validCoords.length >= 2) {
        setStatus("Drawing route…");
        const routeCoords = await fetchOSRMRoute(validCoords);
        if (isMounted && routeCoords) {
          L.polyline(routeCoords, {
            color: "#6366f1",
            weight: 4,
            opacity: 0.85,
            smoothFactor: 2,
          }).addTo(map);
          setHasRoute(true);
        }
      }

      if (isMounted) {
        setStatus(
          validCoords.length === 0
            ? "No places could be located."
            : `${validCoords.length} of ${places.length} places located.`
        );
      }
    })();

    return () => {
      isMounted = false;
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []); // run once on mount

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          🗺️ Trip Route Map
          <span className="text-xs text-gray-400 font-normal">(OpenStreetMap · 100% Free)</span>
        </h3>
        <button
          onClick={() => setShowInfo((s) => !s)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showInfo ? "Hide info ▲" : "Show info ▼"}
        </button>
      </div>

      {/* Status + legend */}
      {showInfo && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {located < total ? (
              <><span className="animate-spin">⟳</span>{status}</>
            ) : (
              <><span className="text-green-500">✓</span>{status}</>
            )}
            {hasRoute && <span className="text-indigo-500 ml-2">🛣 Route drawn</span>}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TYPE_COLOR).map(([type, color]) => (
              <span
                key={type}
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ background: color }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        style={{ height: "420px", borderRadius: "16px" }}
        className="w-full shadow-lg border border-gray-200 overflow-hidden z-0"
      />

      <p className="text-xs text-gray-400 text-right">
        Map data © <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors · Routing by <a href="http://project-osrm.org/" target="_blank" rel="noreferrer" className="underline">OSRM</a>
      </p>
    </div>
  );
}
