import { LuMenu, LuPlus, LuSun, LuMoon } from "react-icons/lu";
import { useSettings } from "../context/SettingsContext";
import "./Topbar.css";

const TITLES = {
  overview: ["Overview", "Your finances at a glance"],
  income: ["Income", "Every source of money coming in"],
  expenses: ["Expenses", "Every entry, filtered and sorted"],
  transactions: ["Transactions", "Every entry, searchable and sortable"],
  budgets: ["Budgets", "Track spend against your monthly limits"],
  insights: ["Insights", "Where the money actually goes"],
  settings: ["Settings", "Profile, security, and preferences"],
};

export default function Topbar({ view, onMenuClick, onAddExpense }) {
  const [title, subtitle] = TITLES[view] || TITLES.overview;
  const { settings, updateSettings } = useSettings();
  const isDark = settings.theme === "dark";

  const toggleTheme = () => updateSettings({ theme: isDark ? "light" : "dark" });

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu" onClick={onMenuClick} aria-label="Open menu">
          <LuMenu size={20} />
        </button>
        <div>
          <h2 className="topbar__title">{title}</h2>
          <p className="topbar__subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="topbar__right">
        <button
          className="topbar__theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
        </button>
        <button className="btn btn--primary topbar__add" onClick={onAddExpense}>
          <LuPlus size={16} />
          <span>Add entry</span>
        </button>
      </div>
    </header>
  );
}