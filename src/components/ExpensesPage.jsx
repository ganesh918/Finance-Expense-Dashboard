import { useMemo, useState } from "react";
import { LuSearch, LuArrowUpDown, LuPencil, LuTrash2, LuArrowDownRight } from "react-icons/lu";
import { CATEGORIES } from "../data/dummyData";
import { formatCurrency, formatDate, monthKey } from "../utils/helpers";

export default function ExpensesPage({ expenses, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const spend = useMemo(() => expenses.filter((e) => e.type === "expense"), [expenses]);

  const stats = useMemo(() => {
    const thisMonth = monthKey(new Date().toISOString());
    const total = spend.reduce((s, e) => s + e.amount, 0);
    const monthTotal = spend.filter((e) => monthKey(e.date) === thisMonth).reduce((s, e) => s + e.amount, 0);
    const avg = spend.length ? Math.round(total / spend.length) : 0;
    return { total, monthTotal, avg, count: spend.length };
  }, [spend]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let rows = spend.filter((e) => {
      const matchesQuery = e.note.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchesQuery && matchesCategory;
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
  }, [spend, query, categoryFilter, sortKey, sortDir]);

  const SortHeader = ({ label, sortField }) => (
    <button className="table__sort" onClick={() => toggleSort(sortField)}>
      {label}
      <LuArrowUpDown size={12} className={sortKey === sortField ? "table__sort-icon--active" : ""} />
    </button>
  );

  return (
    <div className="overview">
      <section className="summary-grid">
        <div className="summary-card summary-card--coral">
          <div className="summary-card__top">
            <span className="summary-card__label">Total spent</span>
            <span className="summary-card__icon"><LuArrowDownRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{formatCurrency(stats.total)}</p>
        </div>
        <div className="summary-card summary-card--brass">
          <div className="summary-card__top">
            <span className="summary-card__label">This month</span>
            <span className="summary-card__icon"><LuArrowDownRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{formatCurrency(stats.monthTotal)}</p>
        </div>
        <div className="summary-card summary-card--pine">
          <div className="summary-card__top">
            <span className="summary-card__label">Average entry</span>
            <span className="summary-card__icon"><LuArrowDownRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{formatCurrency(stats.avg)}</p>
        </div>
        <div className="summary-card">
          <div className="summary-card__top">
            <span className="summary-card__label">Entries</span>
            <span className="summary-card__icon"><LuArrowDownRight size={16} /></span>
          </div>
          <p className="summary-card__value figure">{stats.count}</p>
        </div>
      </section>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <LuSearch size={16} />
            <input
              type="text"
              placeholder="Search expenses…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search expenses"
            />
          </div>
          <select className="input input--compact" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap scrollbar-thin">
          <table className="table">
            <thead>
              <tr>
                <th><SortHeader label="Date" sortField="date" /></th>
                <th>Description</th>
                <th>Category</th>
                <th><SortHeader label="Amount" sortField="amount" /></th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const cat = CATEGORIES.find((c) => c.id === row.category);
                return (
                  <tr key={row.id}>
                    <td className="figure table__date">{formatDate(row.date)}</td>
                    <td>{row.note}</td>
                    <td><span className="tag" style={{ background: (cat?.color || "var(--brass)") + "22", color: cat?.color || "var(--brass)" }}>{cat?.label || row.category}</span></td>
                    <td className="figure amount--expense">−{formatCurrency(row.amount)}</td>
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
          {filtered.length === 0 && <p className="empty-note">No expenses match your filters.</p>}
        </div>
      </div>
    </div>
  );
}