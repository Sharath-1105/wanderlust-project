// ─── geoUtils.js ─────────────────────────────────────────────────────────────
// Real-world geocoding (Nominatim) + road distance (OSRM) utilities.
// Uses an in-memory coordinate cache to minimise Nominatim API calls and
// comply with OSM polite-usage policy.

// ── In-memory coordinate cache: place name → { lat, lon } ────────────────────
const coordCache = new Map();

// ── Nominatim User-Agent (required by OSM policy) ─────────────────────────────
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT     = "WanderlustApp/1.0 (travel-planner; contact@wanderlust.app)";
const OSRM_BASE      = "https://router.project-osrm.org/route/v1/driving";

// ── Default fallback distance (km) used when APIs fail ────────────────────────
export const DEFAULT_DISTANCE_KM = 200;

// ── Rate-limit: at least 1 second between Nominatim requests ─────────────────
let lastNominatimCall = 0;
async function nominatimDelay() {
  const now    = Date.now();
  const gap    = now - lastNominatimCall;
  const MIN_MS = 1100; // OSM policy: max 1 req/second
  if (gap < MIN_MS) await sleep(MIN_MS - gap);
  lastNominatimCall = Date.now();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * getCoordinates(place)
 * Returns { lat, lon } for a place name string.
 * Results are cached in `coordCache` to avoid duplicate API calls.
 * @throws {Error} if location is not found or API is unreachable
 */
export async function getCoordinates(place) {
  if (!place || typeof place !== "string" || !place.trim()) {
    throw new Error(`Invalid place name: "${place}"`);
  }
  const key = place.trim().toLowerCase();

  // ── Cache hit ────────────────────────────────────────────────────────────
  if (coordCache.has(key)) {
    console.log(`[GEO] Cache hit: "${place}"`);
    return coordCache.get(key);
  }

  // ── Nominatim API call ───────────────────────────────────────────────────
  await nominatimDelay();
  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(place.trim())}&format=json&limit=1&countrycodes=in`;

  console.log(`[GEO] Nominatim → "${place}"`);
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
  });

  if (!response.ok) {
    throw new Error(`Nominatim HTTP ${response.status} for "${place}"`);
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error(`Location not found: "${place}"`);
  }

  const { lat, lon } = data[0];
  const coords = { lat: parseFloat(lat), lon: parseFloat(lon) };
  coordCache.set(key, coords);
  console.log(`[GEO] Cached: "${place}" → lat=${coords.lat}, lon=${coords.lon}`);
  return coords;
}

/**
 * getDistance(from, to)
 * Returns road distance in km between two place name strings via OSRM.
 * Falls back to straight-line Haversine estimate if OSRM fails.
 */
export async function getDistance(fromPlace, toPlace) {
  const [c1, c2] = await Promise.all([
    getCoordinates(fromPlace),
    getCoordinates(toPlace),
  ]);

  const url = `${OSRM_BASE}/${c1.lon},${c1.lat};${c2.lon},${c2.lat}?overview=false`;
  console.log(`[GEO] OSRM → "${fromPlace}" → "${toPlace}"`);

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    console.warn(`[GEO] OSRM HTTP ${response.status} — using Haversine fallback`);
    return haversineKm(c1, c2);
  }

  const data = await response.json();
  if (data?.code !== "Ok" || !data.routes?.[0]?.distance) {
    console.warn("[GEO] OSRM returned no route — using Haversine fallback");
    return haversineKm(c1, c2);
  }

  const km = data.routes[0].distance / 1000; // metres → km
  console.log(`[GEO] Distance: ${km.toFixed(1)} km`);
  return Math.round(km * 10) / 10; // round to 1 dp
}

/**
 * getRouteDistance(fromLocation, placeNames[])
 * Calculates the total one-way road distance for the full route:
 *   fromLocation → place1 → place2 → place3 → ...
 * Returns { totalKm, legs[] } where each leg has { from, to, km }.
 * Falls back gracefully — failed legs use haversine or DEFAULT_DISTANCE_KM.
 */
export async function getRouteDistance(fromLocation, placeNames = []) {
  if (!fromLocation || !placeNames.length) {
    return { totalKm: DEFAULT_DISTANCE_KM, legs: [] };
  }

  // Build waypoint list: fromLocation + all places
  const waypoints = [fromLocation, ...placeNames];
  const legs      = [];
  let   totalKm   = 0;

  // Resolve coordinates for all waypoints up-front (sequential to stay polite)
  const coords = [];
  for (const wp of waypoints) {
    try {
      coords.push({ name: wp, ...(await getCoordinates(wp)) });
    } catch (err) {
      console.warn(`[GEO] Could not resolve "${wp}": ${err.message}`);
      coords.push(null); // placeholder — leg will fall back
    }
  }

  // Calculate each leg
  for (let i = 0; i < coords.length - 1; i++) {
    const fromCoord = coords[i];
    const toCoord   = coords[i + 1];
    const legFrom   = waypoints[i];
    const legTo     = waypoints[i + 1];

    if (!fromCoord || !toCoord) {
      // Skip unresolvable legs, use minimal fallback
      legs.push({ from: legFrom, to: legTo, km: 0, error: "Location not found" });
      continue;
    }

    try {
      const url = `${OSRM_BASE}/${fromCoord.lon},${fromCoord.lat};${toCoord.lon},${toCoord.lat}?overview=false`;
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const data     = await response.json();

      if (data?.code === "Ok" && data.routes?.[0]?.distance) {
        const km = Math.round((data.routes[0].distance / 1000) * 10) / 10;
        legs.push({ from: legFrom, to: legTo, km });
        totalKm += km;
      } else {
        const km = haversineKm(fromCoord, toCoord);
        legs.push({ from: legFrom, to: legTo, km, fallback: "haversine" });
        totalKm += km;
      }
    } catch {
      const km = haversineKm(fromCoord, toCoord);
      legs.push({ from: legFrom, to: legTo, km, fallback: "haversine" });
      totalKm += km;
    }
  }

  // Safety: if every leg failed at coordinate resolution, use default
  if (totalKm === 0 && legs.every((l) => l.km === 0)) {
    totalKm = DEFAULT_DISTANCE_KM;
  }

  return { totalKm: Math.round(totalKm * 10) / 10, legs };
}

// ── Haversine straight-line fallback ──────────────────────────────────────────
function haversineKm({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) {
  const R  = 6371;
  const dL = toRad(lat2 - lat1);
  const dG = toRad(lon2 - lon1);
  const a  = Math.sin(dL / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dG / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
const toRad = (d) => (d * Math.PI) / 180;
