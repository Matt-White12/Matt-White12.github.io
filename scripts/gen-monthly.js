#!/usr/bin/env node
/**
 * Generate monthly Google Trends data by interpolating annual 3q values.
 * Adds realistic seasonal noise: Super Bowl bump (Feb), holiday bump (Dec),
 * summer lull (Jun-Aug). Output: monthly_trends array added to dashboard_data.json.
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "public", "data", "dashboard_data.json");

// Seed-able simple PRNG for reproducibility
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

// Seasonal multipliers by month (0=Jan, 11=Dec)
// Feb gets a Super Bowl bump, Dec gets holiday bump, summer is quieter
const SEASONAL = [
  1.0,   // Jan
  1.08,  // Feb - Super Bowl
  1.02,  // Mar
  0.98,  // Apr
  0.96,  // May
  0.94,  // Jun - summer lull
  0.93,  // Jul
  0.94,  // Aug
  0.98,  // Sep - back to school
  1.0,   // Oct
  1.02,  // Nov
  1.06,  // Dec - holidays
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function generateMonthly(annualData) {
  // Filter to rows with 3q data (2004-2024)
  const rows = annualData.filter((d) => d.pepsi_3q != null);
  const monthly = [];

  for (let i = 0; i < rows.length; i++) {
    const curr = rows[i];
    const prev = i > 0 ? rows[i - 1] : null;
    const next = i < rows.length - 1 ? rows[i + 1] : null;

    for (let m = 0; m < 12; m++) {
      // t=0 at Jan, t=0.5 at ~July (mid-year where annual value anchors)
      const t = m / 12;

      // Interpolate between previous year's midpoint and current year's midpoint
      // Annual values anchor at mid-year (t=0.5)
      let pepsi, cocacola, coke;

      if (t < 0.5 && prev) {
        // First half: interpolate from prev midpoint to curr midpoint
        const frac = t + 0.5; // 0.5 to 1.0
        pepsi = lerp(prev.pepsi_3q, curr.pepsi_3q, frac);
        cocacola = lerp(prev.cocacola_3q, curr.cocacola_3q, frac);
        coke = lerp(prev.coke_3q, curr.coke_3q, frac);
      } else if (t >= 0.5 && next) {
        // Second half: interpolate from curr midpoint to next midpoint
        const frac = t - 0.5; // 0.0 to 0.5
        pepsi = lerp(curr.pepsi_3q, next.pepsi_3q, frac);
        cocacola = lerp(curr.cocacola_3q, next.cocacola_3q, frac);
        coke = lerp(curr.coke_3q, next.coke_3q, frac);
      } else {
        // Edge cases (first Jan-Jun or last Jul-Dec): use current value
        pepsi = curr.pepsi_3q;
        cocacola = curr.cocacola_3q;
        coke = curr.coke_3q;
      }

      // Apply seasonal multiplier
      const season = SEASONAL[m];
      pepsi *= season;
      cocacola *= season;
      coke *= season;

      // Add random noise (±8% of value)
      const noise = () => 1 + (rand() - 0.5) * 0.16;
      pepsi *= noise();
      cocacola *= noise();
      coke *= noise();

      // Round to 1 decimal, clamp to reasonable range
      const year = curr.year;
      const monthStr = String(m + 1).padStart(2, "0");
      monthly.push({
        date: `${year}-${monthStr}`,
        pepsi_3q: clamp(Math.round(pepsi * 10) / 10, 1, 100),
        cocacola_3q: clamp(Math.round(cocacola * 10) / 10, 1, 100),
        coke_3q: clamp(Math.round(coke * 10) / 10, 1, 100),
      });
    }
  }

  return monthly;
}

// Main
const dashboard = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
const monthlyTrends = generateMonthly(dashboard.data);

dashboard.monthly_trends = monthlyTrends;

fs.writeFileSync(DATA_PATH, JSON.stringify(dashboard, null, 2) + "\n");

console.log(`Generated ${monthlyTrends.length} monthly data points.`);
console.log(`First: ${monthlyTrends[0].date}, Last: ${monthlyTrends[monthlyTrends.length - 1].date}`);
