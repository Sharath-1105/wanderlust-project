// ─── distanceApi.ts ──────────────────────────────────────────────────────────
// Thin wrapper around GET /api/distance for the frontend.
// The backend handles all geocoding + OSRM calls with caching.

import API from "./api";

export interface DistanceLeg {
  from: string;
  to: string;
  km: number;
  fallback?: string;
  error?: string;
}

export interface DistanceResult {
  fromLocation: string;
  places: string[];
  totalDistanceKm: number;
  legs: DistanceLeg[];
  fallback?: boolean;
  msg?: string;
}

/**
 * Fetch the full route distance from the backend.
 * @param fromLocation  Origin city/place name
 * @param placeNames    Array of destination place names
 */
export async function fetchRouteDistance(
  fromLocation: string,
  placeNames: string[]
): Promise<DistanceResult> {
  if (!fromLocation.trim() || placeNames.length === 0) {
    throw new Error("fromLocation and at least one place are required");
  }

  // Send as comma-separated query param — server accepts both comma-sep and array
  const params = new URLSearchParams();
  params.set("fromLocation", fromLocation.trim());
  params.set("places", placeNames.join(","));

  const res = await API.get<DistanceResult>(`/distance?${params.toString()}`);
  return res.data;
}
