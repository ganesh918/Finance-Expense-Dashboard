import { useState } from "react";
import { ToastProvider, useToast } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import Overview from "./components/Overview";
import IncomePage from "./components/IncomePage";
import ExpensesPage from "./components/ExpensesPage";
import ExpenseTable from "./components/ExpenseTable";
import BudgetTracker from "./components/BudgetTracker";
import Insights from "./components/Insights";
import SettingsPage from "./components/SettingsPage";
import ExpenseForm from "./components/ExpenseForm";
import { initialExpenses } from "./data/dummyData";
import { uid } from "./utils/helpers";
import "./App.css";

function DashboardShell() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [view, setView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { notify } = useToast();
  const { settings } = useSettings();

  const openAddForm = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const openEditForm = (entry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = (entry) => {
    if (entry.id) {
      setExpenses((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
      notify("Entry updated.", "success");
    } else {
      setExpenses((prev) => [{ ...entry, id: uid() }, ...prev]);
      notify(entry.type === "income" ? "Income added." : "Expense added.", "success");
    }
    setFormOpen(false);
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    notify("Entry deleted.", "error");
  };

  const handleResetData = () => setExpenses(initialExpenses);

  return (
    <div className="app-shell">
      <Sidebar activeView={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar view={view} onMenuClick={() => setSidebarOpen(true)} onAddExpense={openAddForm} />
        <main className="app-content">
          {view === "overview" && <Overview expenses={expenses} onEdit={openEditForm} onDelete={handleDelete} onNavigate={setView} />}
          {view === "income" && <IncomePage expenses={expenses} onEdit={openEditForm} onDelete={handleDelete} />}
          {view === "expenses" && <ExpensesPage expenses={expenses} onEdit={openEditForm} onDelete={handleDelete} />}
          {view === "transactions" && <ExpenseTable expenses={expenses} onEdit={openEditForm} onDelete={handleDelete} />}
          {view === "budgets" && <BudgetTracker expenses={expenses} budgets={settings.budgets} />}
          {view === "insights" && <Insights expenses={expenses} />}
          {view === "settings" && <SettingsPage expenses={expenses} onResetData={handleResetData} />}
        </main>
      </div>

      <BottomNav activeView={view} onNavigate={setView} />
      <ExpenseForm open={formOpen} initialData={editingEntry} onClose={closeForm} onSubmit={handleSubmit} />
    </div>
  );
}

function AuthGate() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="app-loading">Loading…</div>;
  }

  if (!user) return <AuthPage />;

  return (
    <SettingsProvider email={user.email}>
      <DashboardShell />
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ToastProvider>
  );
}