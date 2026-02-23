/**
 * Cost Forecaster
 *
 * Linear regression on daily cost data with confidence intervals.
 */

import type { CostEntry, CostForecast } from "./types.js";

// ---------------------------------------------------------------------------
// Linear regression: y = mx + b
// ---------------------------------------------------------------------------
function linearRegression(xs: number[], ys: number[]): { m: number; b: number; r2: number } {
  const n = xs.length;
  if (n < 2) return { m: 0, b: ys[0] ?? 0, r2: 0 };

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);
  const sumY2 = ys.reduce((a, y) => a + y * y, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { m: 0, b: sumY / n, r2: 0 };

  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;

  // R² (coefficient of determination)
  const meanY = sumY / n;
  const ssTot = ys.reduce((a, y) => a + (y - meanY) ** 2, 0);
  const ssRes = ys.reduce((a, y, i) => a + (y - (m * xs[i] + b)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { m, b, r2 };
}

// ---------------------------------------------------------------------------
// Forecast costs
// ---------------------------------------------------------------------------
export function forecastCosts(dailyCosts: CostEntry[], forecastDays: number = 7): CostForecast {
  // Aggregate costs by date
  const byDate = new Map<string, number>();
  for (const c of dailyCosts) {
    byDate.set(c.date, (byDate.get(c.date) ?? 0) + c.amount);
  }

  const dates = [...byDate.keys()].sort();
  const values = dates.map((d) => byDate.get(d)!);

  if (dates.length === 0) {
    return {
      currentDaily: 0,
      predicted7d: 0,
      predicted30d: 0,
      trend: "stable",
      confidence: 0,
      dataPoints: [],
    };
  }

  // Use day index as x
  const xs = dates.map((_, i) => i);
  const { m, b, r2 } = linearRegression(xs, values);

  const currentDaily = values[values.length - 1];
  const n = dates.length;

  // Predict future
  const predict7d = Array.from({ length: forecastDays }, (_, i) => m * (n + i) + b);
  const predict30d = Array.from({ length: 30 }, (_, i) => m * (n + i) + b);

  const predicted7dTotal = predict7d.reduce((a, b) => a + b, 0);
  const predicted30dTotal = predict30d.reduce((a, b) => a + b, 0);

  // Trend direction
  let trend: CostForecast["trend"] = "stable";
  if (m > 0.01 * currentDaily) trend = "increasing";
  else if (m < -0.01 * currentDaily) trend = "decreasing";

  // Build data points (actuals + predictions)
  const dataPoints: CostForecast["dataPoints"] = [];

  for (let i = 0; i < dates.length; i++) {
    dataPoints.push({ date: dates[i], actual: values[i] });
  }

  // Add forecast points
  const lastDate = new Date(dates[dates.length - 1]);
  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i + 1);
    dataPoints.push({
      date: d.toISOString().slice(0, 10),
      predicted: Math.max(0, Math.round((m * (n + i) + b) * 100) / 100),
    });
  }

  return {
    currentDaily: Math.round(currentDaily * 100) / 100,
    predicted7d: Math.round(predicted7dTotal * 100) / 100,
    predicted30d: Math.round(predicted30dTotal * 100) / 100,
    trend,
    confidence: Math.round(Math.max(0, r2) * 100),
    dataPoints,
  };
}
