import { createContext, useContext, useEffect, useState } from "react";
import { initialBudgets, CATEGORIES } from "../data/dummyData";

/*
 * App-wide preferences. Persisted in localStorage per logged-in user so
 * settings survive a refresh — still no backend, per the project's
 * dummy-data-only spec.
 */

const SettingsContext = createContext(null);

const CURRENCIES = [
  { code: "INR", label: "₹ Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "$ US Dollar", locale: "en-US" },
  { code: "EUR", label: "€ Euro", locale: "de-DE" },
  { code: "GBP", label: "£ British Pound", locale: "en-GB" },
];

const defaultSettings = {
  currency: "INR",
  theme: "light",
  dateFormat: "dd-mm-yyyy",
  budgetAlerts: true,
  emailSummary: false,
  compactTable: false,
  budgets: initialBudgets,
};

const keyFor = (email) => `ledger_settings_${email}`;

export function SettingsProvider({ email, children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!email) return;
    try {
      const raw = localStorage.getItem(keyFor(email));
      setSettings(raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoaded(true);
    }
  }, [email]);

  useEffect(() => {
    if (!email || !loaded) return;
    localStorage.setItem(keyFor(email), JSON.stringify(settings));
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings, email, loaded]);

  const updateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  const updateBudget = (categoryId, amount) =>
    setSettings((prev) => ({ ...prev, budgets: { ...prev.budgets, [categoryId]: amount } }));

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, updateBudget, resetSettings, CURRENCIES, CATEGORIES }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};