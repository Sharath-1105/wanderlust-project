// ─── costUtils.js ────────────────────────────────────────────
// Shared cost calculation logic — same formula for user & admin booking.
// Transport rate (₹/km/person), Food: ₹150/meal × 3 meals × days × persons

export const TRANSPORT_RATES = {
  Car:   10,   // ₹ per km per person
  Bus:    5,
  Train:  7,
};

export const FOOD_RATE = 150;       // ₹ per meal
export const MEALS_PER_DAY = 3;

/**
 * Calculate full trip cost breakdown.
 * @param {object} opts
 * @param {Array}  opts.places       – array of place objects with entryFee field
 * @param {number} opts.days         – trip duration in days
 * @param {number} opts.persons      – number of travellers
 * @param {string} opts.transport    – "Car" | "Bus" | "Train" | ""
 * @param {number} opts.distance     – estimated distance in km (one-way)
 * @returns {{ placeCost, transportCost, foodCost, totalCost }}
 */
export function calcCosts({ places = [], days = 1, persons = 1, transport = "", distance = 0 }) {
  const d = Math.max(1, Number(days));
  const p = Math.max(1, Number(persons));
  const km = Math.max(0, Number(distance));

  // Sum of entry fees for all selected places × persons
  const placeCost = places.reduce((sum, pl) => sum + (Number(pl.entryFee) || 0), 0) * p;

  // Transport: rate per km × distance × persons (round-trip = ×2)
  const rate = TRANSPORT_RATES[transport] || 0;
  const transportCost = rate * km * p * 2;   // ×2 for return journey

  // Food: 3 meals/day × ₹150 × days × persons
  const foodCost = MEALS_PER_DAY * FOOD_RATE * d * p;

  const totalCost = placeCost + transportCost + foodCost;

  return { placeCost, transportCost, foodCost, totalCost };
}
