import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CATEGORIES } from "../data/dummyData";
import { formatCurrency } from "../utils/helpers";

export default function CategoryPie({ expenses, type = "expense", items = CATEGORIES, emptyLabel = "No expenses recorded yet." }) {
  const data = useMemo(() => {
    const totals = {};
    expenses
      .filter((e) => e.type === type)
      .forEach((e) => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
      });
    return items.map((c) => ({ name: c.label, value: totals[c.id] || 0, color: c.color })).filter(
      (d) => d.value > 0
    );
  }, [expenses, type, items]);

  if (data.length === 0) {
    return <p className="empty-note">{emptyLabel}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} stroke="var(--paper-raised)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontFamily: "var(--font-body)", borderRadius: 8, border: "1px solid var(--line)" }} />
        <Legend wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}