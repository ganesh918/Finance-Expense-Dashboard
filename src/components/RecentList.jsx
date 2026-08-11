import { CATEGORIES } from "../data/dummyData";
import { formatCurrency, formatDate } from "../utils/helpers";
import { LuPencil, LuTrash2 } from "react-icons/lu";

export default function RecentList({ expenses, onEdit, onDelete, limit = 6 }) {
  const items = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);

  if (items.length === 0) return <p className="empty-note">Nothing recorded yet.</p>;

  return (
    <ul className="recent-list">
      {items.map((item) => {
        const cat = CATEGORIES.find((c) => c.id === item.category);
        return (
          <li className="recent-item" key={item.id}>
            <span className="recent-item__dot" style={{ background: cat?.color || "var(--ink-faint)" }} />
            <div className="recent-item__body">
              <p className="recent-item__note">{item.note}</p>
              <p className="recent-item__meta">{cat?.label || item.category} · {formatDate(item.date)}</p>
            </div>
            <p className={`recent-item__amount figure ${item.type === "income" ? "amount--income" : "amount--expense"}`}>
              {item.type === "income" ? "+" : "−"}{formatCurrency(item.amount)}
            </p>
            <div className="recent-item__actions">
              <button aria-label="Edit entry" onClick={() => onEdit(item)}><LuPencil size={14} /></button>
              <button aria-label="Delete entry" onClick={() => onDelete(item.id)}><LuTrash2 size={14} /></button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}