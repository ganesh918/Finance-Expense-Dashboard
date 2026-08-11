import { useMemo, useState } from "react";
import { LuSearch, LuArrowUpDown, LuPencil, LuTrash2 } from "react-icons/lu";
import { CATEGORIES, INCOME_SOURCES } from "../data/dummyData";
import { formatCurrency, formatDate } from "../utils/helpers";

const ALL_CATS = [...CATEGORIES, ...INCOME_SOURCES.filter((s) => !CATEGORIES.find((c) => c.id === s.id))];

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let rows = expenses.filter((e) => {
      const matchesQuery = e.note.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchesQuery && matchesType && matchesCategory;
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
  }, [expenses, query, typeFilter, categoryFilter, sortKey, sortDir]);

  const SortHeader = ({ label, sortField }) => (
    <button className="table__sort" onClick={() => toggleSort(sortField)}>
      {label}
      <LuArrowUpDown size={12} className={sortKey === sortField ? "table__sort-icon--active" : ""} />
    </button>
  );

  return (
    <div className="card">
      <div className="table-toolbar">
        <div className="search-box">
          <LuSearch size={16} />
          <input
            type="text"
            placeholder="Search transactions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search transactions"
          />
        </div>
        <select className="input input--compact" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="all">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select className="input input--compact" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          {ALL_CATS.map((c) => (
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
              const cat = ALL_CATS.find((c) => c.id === row.category);
              return (
                <tr key={row.id}>
                  <td className="figure table__date">{formatDate(row.date)}</td>
                  <td>{row.note}</td>
                  <td>
                    <span className="tag" style={{ background: (CATEGORIES.find(c=>c.id===row.category)?.color || 'var(--brass)') + '22', color: CATEGORIES.find(c=>c.id===row.category)?.color || 'var(--brass)' }}>
                      {cat?.label || row.category}
                    </span>
                  </td>
                  <td className={`figure ${row.type === "income" ? "amount--income" : "amount--expense"}`}>
                    {row.type === "income" ? "+" : "−"}{formatCurrency(row.amount)}
                  </td>
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
        {filtered.length === 0 && <p className="empty-note">No transactions match your filters.</p>}
      </div>
    </div>
  );
}