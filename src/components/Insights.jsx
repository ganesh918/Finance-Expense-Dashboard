import { useMemo } from "react";
import { CATEGORIES } from "../data/dummyData";
import { formatCurrency } from "../utils/helpers";
import CategoryPie from "./CategoryPie";
import TrendChart from "./TrendChart";

export default function Insights({ expenses }) {
  const ranked = useMemo(() => {
    const totals = {};
    let grandTotal = 0;
    expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
        grandTotal += e.amount;
      });
    return CATEGORIES.map((c) => ({ ...c, total: totals[c.id] || 0, share: grandTotal ? Math.round(((totals[c.id] || 0) / grandTotal) * 100) : 0 }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <div className="overview">
      <section className="overview-grid">
        <div className="card chart-card">
          <h3 className="card__title">Category breakdown</h3>
          <CategoryPie expenses={expenses} />
        </div>
        <div className="card chart-card">
          <h3 className="card__title">Spending trend</h3>
          <TrendChart expenses={expenses} />
        </div>
      </section>

      <section className="card">
        <h3 className="card__title">Top spending categories</h3>
        <ul className="rank-list">
          {ranked.map((c, i) => (
            <li className="rank-item" key={c.id}>
              <span className="rank-item__num figure">{String(i + 1).padStart(2, "0")}</span>
              <span className="rank-item__dot" style={{ background: c.color }} />
              <span className="rank-item__name">{c.label}</span>
              <span className="rank-item__share figure">{c.share}%</span>
              <span className="rank-item__total figure">{formatCurrency(c.total)}</span>
            </li>
          ))}
          {ranked.length === 0 && <p className="empty-note">No expenses recorded yet.</p>}
        </ul>
      </section>
    </div>
  );
}