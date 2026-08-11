import { useMemo } from "react";
import { LuTrendingUp, LuTrendingDown, LuCircleAlert, LuCalendarClock, LuTarget } from "react-icons/lu";
import { CATEGORIES } from "../data/dummyData";
import { formatCurrency, monthKey } from "../utils/helpers";
import "./BudgetTracker.css";

const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export default function BudgetTracker({ expenses, budgets }) {
  const now = new Date();
  const thisMonth = monthKey(now.toISOString());
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate.toISOString());

  const totalDays = daysInMonth(now);
  const dayOfMonth = now.getDate();
  const monthProgressPct = Math.round((dayOfMonth / totalDays) * 100);
  const daysLeft = totalDays - dayOfMonth;

  const { rows, totals } = useMemo(() => {
    const currentTotals = {};
    const priorTotals = {};

    expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        const key = monthKey(e.date);
        if (key === thisMonth) currentTotals[e.category] = (currentTotals[e.category] || 0) + e.amount;
        if (key === lastMonth) priorTotals[e.category] = (priorTotals[e.category] || 0) + e.amount;
      });

    const rows = CATEGORIES.map((cat) => {
      const limit = budgets[cat.id] || 0;
      const spent = currentTotals[cat.id] || 0;
      const priorSpent = priorTotals[cat.id] || 0;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const remaining = limit - spent;
      const over = spent > limit;
      const projected = dayOfMonth > 0 ? Math.round((spent / dayOfMonth) * totalDays) : spent;
      const projectedOver = limit > 0 && projected > limit;
      const trendDelta = priorSpent > 0 ? Math.round(((spent - priorSpent) / priorSpent) * 100) : null;

      let status = "on-track";
      if (over) status = "over";
      else if (projectedOver) status = "at-risk";
      else if (pct < monthProgressPct - 15) status = "under";

      return { ...cat, limit, spent, remaining, pct, over, projected, projectedOver, trendDelta, status };
    });

    const totals = rows.reduce(
      (acc, r) => ({ limit: acc.limit + r.limit, spent: acc.spent + r.spent }),
      { limit: 0, spent: 0 }
    );

    return { rows, totals };
  }, [expenses, budgets, thisMonth, lastMonth, dayOfMonth, totalDays, monthProgressPct]);

  const overallPct = totals.limit > 0 ? Math.min(100, Math.round((totals.spent / totals.limit) * 100)) : 0;
  const overallRemaining = totals.limit - totals.spent;
  const overCount = rows.filter((r) => r.status === "over").length;
  const atRiskCount = rows.filter((r) => r.status === "at-risk").length;
  const onTrackCount = rows.length - overCount - atRiskCount;

  const watchlist = [...rows]
    .filter((r) => r.limit > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const gaugeColor = overallPct >= 100 ? "var(--coral)" : overallPct >= 80 ? "var(--brass)" : "var(--mint)";
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (Math.min(overallPct, 100) / 100) * circumference;

  return (
    <div className="budgets-page">
      {/* Hero summary */}
      <section className="budget-hero">
        <div className="budget-hero__gauge">
          <svg viewBox="0 0 120 120" className="budget-gauge">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={gaugeColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="budget-gauge__label">
            <span className="budget-gauge__pct figure">{overallPct}%</span>
            <span className="budget-gauge__caption">of budget used</span>
          </div>
        </div>

        <div className="budget-hero__stats">
          <div className="budget-hero__row">
            <div>
              <p className="budget-hero__label">Total budgeted</p>
              <p className="budget-hero__value figure">{formatCurrency(totals.limit)}</p>
            </div>
            <div>
              <p className="budget-hero__label">Spent so far</p>
              <p className="budget-hero__value figure">{formatCurrency(totals.spent)}</p>
            </div>
            <div>
              <p className="budget-hero__label">{overallRemaining >= 0 ? "Remaining" : "Over by"}</p>
              <p className={`budget-hero__value figure ${overallRemaining < 0 ? "amount--expense" : "amount--income"}`}>
                {formatCurrency(Math.abs(overallRemaining))}
              </p>
            </div>
          </div>

          <div className="budget-hero__pacing">
            <LuCalendarClock size={15} />
            <span>
              Day {dayOfMonth} of {totalDays} · <strong>{daysLeft}</strong> days left in this budget cycle
            </span>
          </div>

          <div className="budget-hero__chips">
            <span className="chip chip--mint"><LuTarget size={13} /> {onTrackCount} on track</span>
            {atRiskCount > 0 && <span className="chip chip--brass"><LuTrendingUp size={13} /> {atRiskCount} at risk</span>}
            {overCount > 0 && <span className="chip chip--coral"><LuCircleAlert size={13} /> {overCount} over budget</span>}
          </div>
        </div>
      </section>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section className="card watchlist-card">
          <h3 className="card__title">Closest to their limit</h3>
          <div className="watchlist">
            {watchlist.map((r) => (
              <div className="watchlist-item" key={r.id}>
                <span className="watchlist-item__dot" style={{ background: r.color }} />
                <div className="watchlist-item__body">
                  <p className="watchlist-item__name">{r.label}</p>
                  <p className="watchlist-item__sub figure">
                    {formatCurrency(r.spent)} of {formatCurrency(r.limit)}
                  </p>
                </div>
                <span className={`watchlist-item__pct figure ${r.pct >= 100 ? "amount--expense" : ""}`}>
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category cards */}
      <section className="card">
        <h3 className="card__title">Category budgets</h3>
        <div className="budget-grid budget-grid--rich">
          {rows.map((r) => (
            <div className={`budget-item budget-item--rich status-${r.status}`} key={r.id}>
              <div className="budget-item__head">
                <div className="budget-item__title">
                  <span className="budget-item__swatch" style={{ background: r.color }} />
                  <span className="budget-item__name">{r.label}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <p className="budget-item__amounts figure">
                {formatCurrency(r.spent)}
                <span className="budget-item__of"> / {formatCurrency(r.limit)}</span>
              </p>

              <div className="budget-bar budget-bar--rich">
                <div
                  className="budget-bar__pace-marker"
                  style={{ left: `${Math.min(monthProgressPct, 100)}%` }}
                  title="Today's pace"
                />
                <div
                  className={`budget-bar__fill ${r.over ? "budget-bar__fill--over" : ""}`}
                  style={{ width: `${Math.min(r.pct, 100)}%`, background: r.over ? "var(--coral)" : r.color }}
                />
              </div>

              <div className="budget-item__footer">
                <span className={`budget-item__pct ${r.over ? "amount--expense" : ""}`}>
                  {r.over ? "Over budget" : `${r.pct}% used`}
                </span>
                {r.trendDelta !== null && (
                  <span className={`budget-item__trend ${r.trendDelta > 0 ? "trend--up" : "trend--down"}`}>
                    {r.trendDelta > 0 ? <LuTrendingUp size={12} /> : <LuTrendingDown size={12} />}
                    {Math.abs(r.trendDelta)}% vs last month
                  </span>
                )}
              </div>

              <p className="budget-item__forecast">
                {r.limit > 0
                  ? r.projectedOver
                    ? `Trending to ${formatCurrency(r.projected)} — over by month end`
                    : `On pace to finish near ${formatCurrency(r.projected)}`
                  : "No limit set for this category"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    over: { label: "Over", cls: "badge--coral" },
    "at-risk": { label: "At risk", cls: "badge--brass" },
    "on-track": { label: "On track", cls: "badge--mint" },
    under: { label: "Under pace", cls: "badge--pine" },
  };
  const { label, cls } = map[status] || map["on-track"];
  return <span className={`badge ${cls}`}>{label}</span>;
}