import { LuLayoutDashboard, LuArrowUpRight, LuArrowDownRight, LuReceipt, LuPiggyBank, LuChartPie, LuSettings, LuX, LuLogOut } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV = [
  { id: "overview", label: "Overview", icon: LuLayoutDashboard },
  { id: "income", label: "Income", icon: LuArrowUpRight },
  { id: "expenses", label: "Expenses", icon: LuArrowDownRight },
  { id: "transactions", label: "Transactions", icon: LuReceipt },
  { id: "budgets", label: "Budgets", icon: LuPiggyBank },
  { id: "insights", label: "Insights", icon: LuChartPie },
  { id: "settings", label: "Settings", icon: LuSettings },
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

export default function Sidebar({ activeView, onNavigate, open, onClose }) {
  const { user, logout } = useAuth();
  const goToSettings = () => {
    onNavigate("settings");
    onClose();
  };
  return (
    <>
      {open && <div className="sidebar__scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__mark">₹</span>
          <div>
            <h1 className="sidebar__title">Ledger</h1>
            <p className="sidebar__subtitle">Finance & Expense</p>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
            <LuX size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar__link ${activeView === id ? "sidebar__link--active" : ""}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          {user && (
            <div className="sidebar__user">
              <button className="sidebar__user-main" onClick={goToSettings} aria-label="Open settings">
                <span className="sidebar__avatar">{initials(user.name)}</span>
                <div className="sidebar__user-info">
                  <p className="sidebar__user-name">{user.name}</p>
                  <p className="sidebar__user-email">{user.email}</p>
                </div>
              </button>
              <button className="sidebar__logout" onClick={logout} aria-label="Log out">
                <LuLogOut size={16} />
              </button>
            </div>
          )}
          <p className="sidebar__ledgerline">Book I · FY 2026</p>
          <p className="sidebar__hint">All figures are demo data</p>
        </div>
      </aside>
    </>
  );
}