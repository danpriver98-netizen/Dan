import type { Contact, Property, MatchResult } from "./types";

// ─────────────────────────────────────────────────────────────
// Internal Matching Engine
// Cross-references buyer preference tags (budget, city, #tags, rooms)
// against the property database (internal + PropTech feed).
// ─────────────────────────────────────────────────────────────

interface ScoreConfig {
  budgetWeight: number;
  cityWeight: number;
  tagWeight: number;
  roomsWeight: number;
}

const DEFAULT_CONFIG: ScoreConfig = {
  budgetWeight: 35,
  cityWeight: 25,
  tagWeight: 30,
  roomsWeight: 10,
};

export function scoreMatch(
  buyer: Contact,
  property: Property,
  cfg: ScoreConfig = DEFAULT_CONFIG
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Budget fit
  const max = buyer.budgetMax ?? Infinity;
  const min = buyer.budgetMin ?? 0;
  if (property.askingPrice <= max && property.askingPrice >= min * 0.85) {
    score += cfg.budgetWeight;
    reasons.push("Within budget");
  } else if (property.askingPrice <= max * 1.08) {
    score += cfg.budgetWeight * 0.5;
    reasons.push("Slightly over budget (negotiable)");
  }

  // City fit
  const cities = buyer.preferredCities ?? [buyer.city];
  if (cities.map((c) => c.toLowerCase()).includes(property.city.toLowerCase())) {
    score += cfg.cityWeight;
    reasons.push(`Located in ${property.city}`);
  }

  // Tag overlap
  const desired = buyer.desiredTags ?? [];
  if (desired.length > 0) {
    const overlap = desired.filter((t) => property.tags.includes(t));
    const ratio = overlap.length / desired.length;
    score += cfg.tagWeight * ratio;
    if (overlap.length > 0) {
      reasons.push(`${overlap.length}/${desired.length} desired features`);
    }
  } else {
    score += cfg.tagWeight * 0.5; // no specific tags = neutral
  }

  // Rooms fit
  if (buyer.rooms && property.rooms >= buyer.rooms) {
    score += cfg.roomsWeight;
    reasons.push(`${property.rooms} rooms`);
  } else if (buyer.rooms && property.rooms === buyer.rooms - 1) {
    score += cfg.roomsWeight * 0.4;
  }

  return { score: Math.round(Math.min(score, 100)), reasons };
}

/**
 * Find all property matches for a given buyer, sorted by score.
 */
export function findMatchesForBuyer(
  buyer: Contact,
  properties: Property[],
  threshold = 50
): MatchResult[] {
  return properties
    .filter((p) => p.status === "active" || p.status === "under_offer")
    .map((property) => {
      const { score, reasons } = scoreMatch(buyer, property);
      return { buyer, property, score, reasons };
    })
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * Find all buyers that match a given property (reverse matching),
 * used for the "One-Click Broadcast" feature.
 */
export function findBuyersForProperty(
  property: Property,
  buyers: Contact[],
  threshold = 50
): MatchResult[] {
  return buyers
    .filter((b) => b.type === "buyer" || b.type === "renter")
    .map((buyer) => {
      const { score, reasons } = scoreMatch(buyer, property);
      return { buyer, property, score, reasons };
    })
    .filter((m) => m.score >= threshold && !m.buyer.dncFlagged)
    .sort((a, b) => b.score - a.score);
}
