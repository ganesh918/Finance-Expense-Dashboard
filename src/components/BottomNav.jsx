import { LuLayoutDashboard, LuArrowUpRight, LuArrowDownRight, LuReceipt, LuPiggyBank } from "react-icons/lu";
import "./BottomNav.css";

const TABS = [
  { id: "overview", label: "Home", icon: LuLayoutDashboard },
  { id: "income", label: "Income", icon: LuArrowUpRight },
  { id: "expenses", label: "Expenses", icon: LuArrowDownRight },
  { id: "transactions", label: "History", icon: LuReceipt },
  { id: "budgets", label: "Budgets", icon: LuPiggyBank },
];

export default function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`bottom-nav__item ${activeView === id ? "bottom-nav__item--active" : ""}`}
          onClick={() => onNavigate(id)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}