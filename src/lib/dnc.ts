// ─────────────────────────────────────────────────────────────
// "Do Not Call" registry simulator
// Mimics the regulator check every incoming/scraped number must pass.
// ─────────────────────────────────────────────────────────────

// Mock registry — numbers ending in these suffixes are "registered".
const DNC_SUFFIXES = ["000", "111", "404", "007"];

export interface DncResult {
  phone: string;
  registered: boolean;
  checkedAt: string;
  source: "Israel Do-Not-Call Registry (simulated)";
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function checkDnc(phone: string): DncResult {
  const normalized = normalizePhone(phone);
  const registered = DNC_SUFFIXES.some((s) => normalized.endsWith(s));
  return {
    phone,
    registered,
    checkedAt: new Date().toISOString(),
    source: "Israel Do-Not-Call Registry (simulated)",
  };
}

export function checkDncBatch(phones: string[]): DncResult[] {
  return phones.map(checkDnc);
}
