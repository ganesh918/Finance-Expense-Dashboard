import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { monthKey, weekKey, formatCurrency } from "../utils/helpers";

export default function TrendChart({ expenses, type = "expense", color = "var(--pine)", emptyLabel = "No expenses recorded yet." }) {
  const [granularity, setGranularity] = useState("monthly");

  const data = useMemo(() => {
    const keyFn = granularity === "monthly" ? monthKey : weekKey;
    const totals = {};
    expenses
      .filter((e) => e.type === type)
      .forEach((e) => {
        const key = keyFn(e.date);
        totals[key] = (totals[key] || 0) + e.amount;
      });
    return Object.entries(totals)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-8)
      .map(([key, value]) => ({ label: granularity === "monthly" ? key.slice(5) : key.split("-")[1], value }));
  }, [expenses, granularity, type]);

  return (
    <div>
      <div className="segmented">
        <button
          className={`segmented__btn ${granularity === "weekly" ? "segmented__btn--active" : ""}`}
          onClick={() => setGranularity("weekly")}
        >
          Weekly
        </button>
        <button
          className={`segmented__btn ${granularity === "monthly" ? "segmented__btn--active" : ""}`}
          onClick={() => setGranularity("monthly")}
        >
          Monthly
        </button>
      </div>
      {data.length === 0 ? (
        <p className="empty-note">{emptyLabel}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={64} />
            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontFamily: "var(--font-body)", borderRadius: 8, border: "1px solid var(--line)" }} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}