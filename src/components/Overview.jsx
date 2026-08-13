import { useMemo } from "react";
import {
  LuArrowUpRight, LuArrowDownRight, LuWallet, LuPercent, LuFlame,
  LuReceipt, LuCrown, LuCalendarDays, LuChevronRight, LuSparkles, LuTarget,
} from "react-icons/lu";
import { CATEGORIES } from "../data/dummyData";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency, formatDate, monthKey } from "../utils/helpers";
import CategoryPie from "./CategoryPie";
import TrendChart from "./TrendChart";
import IncomeVsExpenseChart from "./IncomeVsExpenseChart";
import RecentList from "./RecentList";
import "./Overview.css";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function Overview({ expenses, onEdit, onDelete, onNavigate }) {
  const { user } = useAuth();
  const { settings } = useSettings();

  const today = new Date();
  const thisMonth = monthKey(today.toISOString());
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate.toISOString());

  const stats = useMemo(() => {
    const monthly = expenses.filter((e) => monthKey(e.date) === thisMonth);
    const priorMonthly = expenses.filter((e) => monthKey(e.date) === lastMonth);

    const income = monthly.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const spent = monthly.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const priorIncome = priorMonthly.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const priorSpent = priorMonthly.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);

    const balance = income - spent;
    const priorBalance = priorIncome - priorSpent;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    const priorSavingsRate = priorIncome > 0 ? Math.round((priorBalance / priorIncome) * 100) : 0;

    const delta = (curr, prior) => (prior > 0 ? Math.round(((curr - prior) / prior) * 100) : null);

    const monthExpenses = monthly.filter((e) => e.type === "expense");
    const txnCount = monthExpenses.length;
    const dayOfMonth = today.getDate();
    const avgDaily = dayOfMonth > 0 ? Math.round(spent / dayOfMonth) : 0;

    const biggest = [...monthExpenses].sort((a, b) => b.amount - a.amount)[0] || null;

    const byCategory = {};
    monthExpenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const topCategoryId = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCategory = CATEGORIES.find((c) => c.id === topCategoryId);
    const topCategoryAmount = topCategoryId ? byCategory[topCategoryId] : 0;

    return {
      income, spent, balance, savingsRate,
      incomeDelta: delta(income, priorIncome),
      spentDelta: delta(spent, priorSpent),
      balanceDelta: delta(balance, priorBalance),
      savingsDelta: savingsRate - priorSavingsRate,
      txnCount, avgDaily, biggest, topCategory, topCategoryAmount,
    };
  }, [expenses, thisMonth, lastMonth]);

  const budgetSnapshot = useMemo(() => {
    const monthExpenses = expenses.filter((e) => e.type === "expense" && monthKey(e.date) === thisMonth);
    const totals = {};
    monthExpenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    const rows = CATEGORIES.map((c) => {
      const limit = settings.budgets?.[c.id] || 0;
      const spent = totals[c.id] || 0;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return { ...c, limit, spent, pct };
    }).filter((c) => c.limit > 0);

    const overallLimit = rows.reduce((s, c) => s + c.limit, 0);
    const overallSpent = rows.reduce((s, c) => s + c.spent, 0);
    const overallPct = overallLimit > 0 ? Math.min(100, Math.round((overallSpent / overallLimit) * 100)) : 0;
    const overCount = rows.filter((c) => c.pct >= 100).length;

    const top = [...rows].sort((a, b) => b.pct - a.pct).slice(0, 4);

    return { top, overallLimit, overallSpent, overallPct, overCount, totalCategories: rows.length };
  }, [expenses, settings.budgets, thisMonth]);

  const monthLabel = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstName = user?.name?.split(" ")[0] || "there";

  const cards = [
    { label: "Income this month", value: stats.income, delta: stats.incomeDelta, icon: LuArrowUpRight, tone: "mint", goodUp: true },
    { label: "Spent this month", value: stats.spent, delta: stats.spentDelta, icon: LuArrowDownRight, tone: "coral", goodUp: false },
    { label: "Net balance", value: stats.balance, delta: stats.balanceDelta, icon: LuWallet, tone: "pine", goodUp: true },
  ];

  return (
    <div className="overview">
      {/* Greeting header */}
      <section className="overview-hero">
        <div>
          <p className="overview-hero__eyebrow">
            <LuCalendarDays size={13} /> {monthLabel}
          </p>
          <h2 className="overview-hero__greeting">{greeting()}, {firstName}</h2>
          <p className="overview-hero__sub">
            {stats.balance >= 0
              ? `You're up ${formatCurrency(stats.balance)} this month — keep it going.`
              : `You've spent ${formatCurrency(Math.abs(stats.balance))} more than you've earned this month.`}
          </p>
        </div>
        {stats.topCategory && (
          <div className="overview-hero__spotlight">
            <span className="overview-hero__spotlight-icon" style={{ background: stats.topCategory.color + "22", color: stats.topCategory.color }}>
              <LuCrown size={16} />
            </span>
            <div>
              <p className="overview-hero__spotlight-label">Top category</p>
              <p className="overview-hero__spotlight-value">{stats.topCategory.label}</p>
              <p className="overview-hero__spotlight-amount figure">{formatCurrency(stats.topCategoryAmount)}</p>
            </div>
          </div>
        )}
      </section>

      {/* Summary cards with trend deltas */}
      <section className="summary-grid">
        {cards.map(({ label, value, delta, icon: Icon, tone, goodUp }) => (
          <div className={`summary-card summary-card--${tone}`} key={label}>
            <div className="summary-card__top">
              <span className="summary-card__label">{label}</span>
              <span className="summary-card__icon"><Icon size={16} /></span>
            </div>
            <p className="summary-card__value figure">{formatCurrency(value)}</p>
            {delta !== null && (
              <span className={`summary-card__delta ${(delta >= 0) === goodUp ? "delta--good" : "delta--bad"}`}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last month
              </span>
            )}
          </div>
        ))}
        <div className="summary-card summary-card--brass">
          <div className="summary-card__top">
            <span className="summary-card__label">Savings rate</span>
            <span className="summary-card__icon"><LuPercent size={16} /></span>
          </div>
          <p className="summary-card__value figure">{stats.savingsRate}%</p>
          <span className={`summary-card__delta ${stats.savingsDelta >= 0 ? "delta--good" : "delta--bad"}`}>
            {stats.savingsDelta >= 0 ? "▲" : "▼"} {Math.abs(stats.savingsDelta)} pts vs last month
          </span>
        </div>
      </section>

      {/* Quick stat chips */}
      <section className="quickstats">
        <div className="quickstat">
          <span className="quickstat__icon"><LuReceipt size={15} /></span>
          <div>
            <p className="quickstat__value figure">{stats.txnCount}</p>
            <p className="quickstat__label">Transactions this month</p>
          </div>
        </div>
        <div className="quickstat">
          <span className="quickstat__icon"><LuFlame size={15} /></span>
          <div>
            <p className="quickstat__value figure">{formatCurrency(stats.avgDaily)}</p>
            <p className="quickstat__label">Average daily spend</p>
          </div>
        </div>
        <div className="quickstat">
          <span className="quickstat__icon"><LuSparkles size={15} /></span>
          <div>
            <p className="quickstat__value figure">{stats.biggest ? formatCurrency(stats.biggest.amount) : "—"}</p>
            <p className="quickstat__label">
              {stats.biggest ? `Biggest expense · ${stats.biggest.note}` : "No expenses yet"}
            </p>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="overview-grid">
        <div className="card chart-card">
          <h3 className="card__title">Category breakdown</h3>
          <CategoryPie expenses={expenses} />
        </div>
        <div className="card chart-card">
          <h3 className="card__title">Monthly trend</h3>
          <TrendChart expenses={expenses} mode="month" />
        </div>
      </section>

      {/* Income vs Expenses */}
      <section className="card">
        <h3 className="card__title">Income vs Expenses</h3>
        <IncomeVsExpenseChart expenses={expenses} />
      </section>

      {/* Budget overview */}
      {budgetSnapshot.top.length > 0 && (
        <section className="card">
          <div className="card__title-row">
            <h3 className="card__title">Budget overview</h3>
            <button className="card__link" onClick={() => onNavigate?.("budgets")}>
              View budgets <LuChevronRight size={14} />
            </button>
          </div>

          <div className="budget-overview-strip">
            <div className="budget-overview-strip__gauge">
              <span className="budget-overview-strip__pct figure">{budgetSnapshot.overallPct}%</span>
              <span className="budget-overview-strip__label">used overall</span>
            </div>
            <div className="budget-overview-strip__figures">
              <div>
                <p className="budget-overview-strip__figure-label">Budgeted</p>
                <p className="figure">{formatCurrency(budgetSnapshot.overallLimit)}</p>
              </div>
              <div>
                <p className="budget-overview-strip__figure-label">Spent</p>
                <p className="figure">{formatCurrency(budgetSnapshot.overallSpent)}</p>
              </div>
              <div>
                <p className="budget-overview-strip__figure-label">Categories tracked</p>
                <p className="figure">{budgetSnapshot.totalCategories}</p>
              </div>
              {budgetSnapshot.overCount > 0 && (
                <span className="chip chip--coral">
                  <LuTarget size={13} /> {budgetSnapshot.overCount} over budget
                </span>
              )}
            </div>
          </div>

          <div className="budget-snapshot">
            {budgetSnapshot.top.map((c) => (
              <div className="budget-snapshot__item" key={c.id}>
                <div className="budget-snapshot__head">
                  <span className="budget-snapshot__name">{c.label}</span>
                  <span className={`budget-snapshot__pct figure ${c.pct >= 100 ? "amount--expense" : ""}`}>{c.pct}%</span>
                </div>
                <div className="budget-bar">
                  <div
                    className="budget-bar__fill"
                    style={{ width: `${Math.min(c.pct, 100)}%`, background: c.pct >= 100 ? "var(--coral)" : c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent transactions */}
      <section className="card">
        <div className="card__title-row">
          <h3 className="card__title">Recent transactions</h3>
          <button className="card__link" onClick={() => onNavigate?.("transactions")}>
            View all <LuChevronRight size={14} />
          </button>
        </div>
        <RecentList expenses={expenses} onEdit={onEdit} onDelete={onDelete} />
      </section>
    </div>
  );
}