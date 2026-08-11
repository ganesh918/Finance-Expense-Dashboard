import { useMemo, useState } from "react";
import {
  LuSearch, LuArrowUpDown, LuPencil, LuTrash2, LuArrowUpRight,
  LuWallet, LuLayers, LuCrown, LuCalendarDays, LuTrendingUp, LuTrendingDown,
} from "react-icons/lu";
import { INCOME_SOURCES } from "../data/dummyData";
import { formatCurrency, formatDate, monthKey } from "../utils/helpers";
import CategoryPie from "./CategoryPie";
import TrendChart from "./TrendChart";
import "./IncomePage.css";

export default function IncomePage({ expenses, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const income = useMemo(() => expenses.filter((e) => e.type === "income"), [expenses]);

  const today = new Date();
  const thisMonth = monthKey(today.toISOString());
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate.toISOString());

  const stats = useMemo(() => {
    const total = income.reduce((s, e) => s + e.amount, 0);
    const monthTotal = income.filter((e) => monthKey(e.date) === thisMonth).reduce((s, e) => s + e.amount, 0);
    const priorMonthTotal = income.filter((e) => monthKey(e.date) === lastMonth).reduce((s, e) => s + e.amount, 0);
    const monthDelta = priorMonthTotal > 0 ? Math.round(((monthTotal - priorMonthTotal) / priorMonthTotal) * 100) : null;
    const avg = income.length ? Math.round(total / income.length) : 0;

    const bySource = {};
    income.forEach((e) => { bySource[e.category] = (bySource[e.category] || 0) + e.amount; });
    const sourceEntries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
    const topSourceId = sourceEntries[0]?.[0];
    const topSource = INCOME_SOURCES.find((s) => s.id === topSourceId);
    const topSourceAmount = topSourceId ? bySource[topSourceId] : 0;
    const activeSources = sourceEntries.length;

    const largest = [...income].sort((a, b) => b.amount - a.amount)[0] || null;

    return { total, monthTotal, monthDelta, avg, count: income.length, topSource, topSourceAmount, activeSources, largest };
  }, [income, thisMonth, lastMonth]);

  const sourceBreakdown = useMemo(() => {
    const bySource = {};
    income.forEach((e) => { bySource[e.category] = (bySource[e.category] || 0) + e.amount; });
    const total = Object.values(bySource).reduce((s, v) => s + v, 0);
    return INCOME_SOURCES.map((s) => ({
      ...s,
      amount: bySource[s.id] || 0,
      share: total > 0 ? Math.round(((bySource[s.id] || 0) / total) * 100) : 0,
    }))
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [income]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let rows = income.filter((e) => {
      const matchesQuery = e.note.toLowerCase().includes(query.toLowerCase());
      const matchesSource = sourceFilter === "all" || e.category === sourceFilter;
      return matchesQuery && matchesSource;
    });
    rows.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "amount") {
        av = Number(av);
        bv = Number(bv);
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [income, query, sourceFilter, sortKey, sortDir]);

  const SortHeader = ({ label, sortField }) => (
    <button className="table__sort" onClick={() => toggleSort(sortField)}>
      {label}
      <LuArrowUpDown size={12} className={sortKey === sortField ? "table__sort-icon--active" : ""} />
    </button>
  );

  return (
    <div className="overview">
      {/* Hero */}
      <section className="income-hero">
        <div>
          <p className="income-hero__eyebrow"><LuWallet size={13} /> All-time income</p>
          <h2 className="income-hero__value figure">{formatCurrency(stats.total)}</h2>
          <p className="income-hero__sub">
            {formatCurrency(stats.monthTotal)} earned this month
            {stats.monthDelta !== null && (
              <span className={`income-hero__delta ${stats.monthDelta >= 0 ? "delta--good" : "delta--bad"}`}>
                {stats.monthDelta >= 0 ? <LuTrendingUp size={13} /> : <LuTrendingDown size={13} />}
                {Math.abs(stats.monthDelta)}% vs last month
              </span>
            )}
          </p>
        </div>
        {stats.topSource && (
          <div className="income-hero__spotlight">
            <span className="income-hero__spotlight-icon"><LuCrown size={16} /></span>
            <div>
              <p className="income-hero__spotlight-label">Top source</p>
              <p className="income-hero__spotlight-value">{stats.topSource.label}</p>
              <p className="income-hero__spotlight-amount figure">{formatCurrency(stats.topSourceAmount)}</p>
            </div>
          </div>
        )}
      </section>

      {/* Summary cards */}
      <section className="summary-grid">
        <div className="summary-card summary-card--mint">
          <div className="summary-card__top">
            <span className="summary-card__label">This month</span>
            <span className="summary-card__icon"><LuArrowUpRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{formatCurrency(stats.monthTotal)}</p>
        </div>
        <div className="summary-card summary-card--brass">
          <div className="summary-card__top">
            <span className="summary-card__label">Average entry</span>
            <span className="summary-card__icon"><LuArrowUpRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{formatCurrency(stats.avg)}</p>
        </div>
        <div className="summary-card summary-card--pine">
          <div className="summary-card__top">
            <span className="summary-card__label">Active sources</span>
            <span className="summary-card__icon"><LuLayers size={16} /></span>
          </div>
          <p className="summary-card__value figure">{stats.activeSources}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card__top">
            <span className="summary-card__label">Entries</span>
            <span className="summary-card__icon"><LuArrowUpRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{stats.count}</p>
        </div>
      </section>

      {/* Quick stat: largest single deposit */}
      {stats.largest && (
        <section className="quickstats">
          <div className="quickstat">
            <span className="quickstat__icon quickstat__icon--mint"><LuCalendarDays size={15} /></span>
            <div>
              <p className="quickstat__value figure">{formatCurrency(stats.largest.amount)}</p>
              <p className="quickstat__label">Largest deposit · {stats.largest.note} ({formatDate(stats.largest.date)})</p>
            </div>
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="overview-grid">
        <div className="card chart-card">
          <h3 className="card__title">Income by source</h3>
          <CategoryPie expenses={expenses} type="income" items={INCOME_SOURCES} emptyLabel="No income recorded yet." />
        </div>
        <div className="card chart-card">
          <h3 className="card__title">Income trend</h3>
          <TrendChart expenses={expenses} type="income" color="var(--mint)" emptyLabel="No income recorded yet." />
        </div>
      </section>

      {/* Source breakdown list */}
      {sourceBreakdown.length > 0 && (
        <section className="card">
          <h3 className="card__title">Source breakdown</h3>
          <ul className="source-list">
            {sourceBreakdown.map((s) => (
              <li className="source-item" key={s.id}>
                <span className="source-item__dot" style={{ background: s.color }} />
                <span className="source-item__name">{s.label}</span>
                <div className="source-item__bar">
                  <div className="source-item__bar-fill" style={{ width: `${s.share}%`, background: s.color }} />
                </div>
                <span className="source-item__share figure">{s.share}%</span>
                <span className="source-item__amount figure">{formatCurrency(s.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <LuSearch size={16} />
            <input
              type="text"
              placeholder="Search income…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search income"
            />
          </div>
          <select className="input input--compact" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} aria-label="Filter by source">
            <option value="all">All sources</option>
            {INCOME_SOURCES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap scrollbar-thin">
          <table className="table">
            <thead>
              <tr>
                <th><SortHeader label="Date" sortField="date" /></th>
                <th>Description</th>
                <th>Source</th>
                <th><SortHeader label="Amount" sortField="amount" /></th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const src = INCOME_SOURCES.find((s) => s.id === row.category);
                return (
                  <tr key={row.id}>
                    <td className="figure table__date">{formatDate(row.date)}</td>
                    <td>{row.note}</td>
                    <td>
                      <span className="tag" style={{ background: (src?.color || "var(--mint)") + "22", color: src?.color || "var(--mint)" }}>
                        {src?.label || row.category}
                      </span>
                    </td>
                    <td className="figure amount--income">+{formatCurrency(row.amount)}</td>
                    <td>
                      <div className="row-actions">
                        <button aria-label="Edit entry" onClick={() => onEdit(row)}><LuPencil size={14} /></button>
                        <button aria-label="Delete entry" onClick={() => onDelete(row.id)}><LuTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="empty-note">No income entries match your filters.</p>}
        </div>
      </div>
    </div>
  );
}