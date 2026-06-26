// ─────────────────────────────────────────────────────────────
// Tax estimator — internal projections only (NOT official filing)
// Israeli VAT (Ma'am) + simplified marginal income tax brackets.
// ─────────────────────────────────────────────────────────────

export const VAT_RATE = 0.18; // Ma'am (as of 2025)

// Simplified annual marginal brackets (illustrative, ILS).
const INCOME_BRACKETS = [
  { upTo: 84120, rate: 0.1 },
  { upTo: 120720, rate: 0.14 },
  { upTo: 193800, rate: 0.2 },
  { upTo: 269280, rate: 0.31 },
  { upTo: 560280, rate: 0.35 },
  { upTo: 721560, rate: 0.47 },
  { upTo: Infinity, rate: 0.5 },
];

export interface TaxProjection {
  grossCommission: number;
  vatCollected: number; // VAT charged on top of commission
  netRevenue: number; // commission excl. VAT (what you keep before income tax)
  incomeTax: number;
  effectiveIncomeRate: number;
  takeHome: number; // after income tax (VAT is pass-through to authority)
  vatLiability: number; // owed to authority
}

export function estimateIncomeTax(annualIncome: number) {
  let tax = 0;
  let prev = 0;
  for (const b of INCOME_BRACKETS) {
    if (annualIncome <= prev) break;
    const taxable = Math.min(annualIncome, b.upTo) - prev;
    tax += taxable * b.rate;
    prev = b.upTo;
  }
  return tax;
}

/**
 * @param grossCommission total commission income for the period (excl. VAT)
 */
export function projectTaxes(grossCommission: number): TaxProjection {
  const vatCollected = grossCommission * VAT_RATE;
  const incomeTax = estimateIncomeTax(grossCommission);
  const takeHome = grossCommission - incomeTax;
  return {
    grossCommission,
    vatCollected,
    netRevenue: grossCommission,
    incomeTax,
    effectiveIncomeRate: grossCommission > 0 ? incomeTax / grossCommission : 0,
    takeHome,
    vatLiability: vatCollected,
  };
}
