import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { monthKey, formatCurrency } from "../utils/helpers";

export default function IncomeVsExpenseChart({ expenses }) {
  const data = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      const key = monthKey(e.date);
      if (!totals[key]) totals[key] = { key, label: key.slice(5), income: 0, expense: 0 };
      totals[key][e.type === "income" ? "income" : "expense"] += e.amount;
    });
    return Object.values(totals)
      .sort((a, b) => (a.key > b.key ? 1 : -1))
      .slice(-6)
      .map(({ label, income, expense }) => ({ label, income, expense }));
  }, [expenses]);

  if (data.length === 0) {
    return <p className="empty-note">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} width={64} />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{ fontFamily: "var(--font-body)", borderRadius: 8, border: "1px solid var(--line)" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }} />
        <Bar dataKey="income" name="Income" fill="var(--mint)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill="var(--coral)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}