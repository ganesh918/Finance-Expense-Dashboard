// Static dummy data only — no API integration, per spec.

export const CATEGORIES = [
  { id: "food", label: "Food & Dining", color: "#B8860B" },
  { id: "transport", label: "Transport", color: "#2D6A4F" },
  { id: "housing", label: "Housing", color: "#1B4332" },
  { id: "utilities", label: "Utilities", color: "#6B8F71" },
  { id: "entertainment", label: "Entertainment", color: "#B3423B" },
  { id: "health", label: "Health", color: "#8E6C88" },
  { id: "shopping", label: "Shopping", color: "#C08A2E" },
  { id: "other", label: "Other", color: "#8B9690" },
];

export const INCOME_SOURCES = [
  { id: "salary", label: "Salary", color: "#1B4332" },
  { id: "freelance", label: "Freelance", color: "#B8860B" },
  { id: "investment", label: "Investment", color: "#2D8659" },
  { id: "other", label: "Other", color: "#8B9690" },
];
// Helper to build ISO dates relative to "today" inside the demo dataset.
const d = (offsetDays) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - offsetDays);
  return dt.toISOString().slice(0, 10);
};

export const initialExpenses = [
  { id: "e1", type: "expense", category: "food", note: "Grocery run — Reliance Fresh", amount: 2450, date: d(1) },
  { id: "e2", type: "expense", category: "transport", note: "Fuel top-up", amount: 1800, date: d(2) },
  { id: "e3", type: "income", category: "salary", note: "Monthly salary", amount: 68000, date: d(3) },
  { id: "e4", type: "expense", category: "housing", note: "Rent — August", amount: 18000, date: d(3) },
  { id: "e5", type: "expense", category: "utilities", note: "Electricity bill", amount: 1450, date: d(4) },
  { id: "e6", type: "expense", category: "entertainment", note: "Movie night", amount: 900, date: d(5) },
  { id: "e7", type: "expense", category: "food", note: "Dinner with friends", amount: 1650, date: d(6) },
  { id: "e8", type: "expense", category: "shopping", note: "New running shoes", amount: 3200, date: d(8) },
  { id: "e9", type: "expense", category: "health", note: "Pharmacy", amount: 620, date: d(9) },
  { id: "e10", type: "income", category: "freelance", note: "Logo design project", amount: 12000, date: d(10) },
  { id: "e11", type: "expense", category: "transport", note: "Cab rides", amount: 740, date: d(11) },
  { id: "e12", type: "expense", category: "utilities", note: "Internet bill", amount: 999, date: d(12) },
  { id: "e13", type: "expense", category: "food", note: "Weekly groceries", amount: 2890, date: d(14) },
  { id: "e14", type: "expense", category: "entertainment", note: "Spotify + Netflix", amount: 549, date: d(15) },
  { id: "e15", type: "expense", category: "shopping", note: "Office supplies", amount: 1120, date: d(17) },
  { id: "e16", type: "income", category: "investment", note: "Dividend payout", amount: 3400, date: d(18) },
  { id: "e17", type: "expense", category: "food", note: "Coffee & snacks", amount: 480, date: d(19) },
  { id: "e18", type: "expense", category: "health", note: "Gym membership", amount: 1800, date: d(21) },
  { id: "e19", type: "expense", category: "transport", note: "Metro card recharge", amount: 500, date: d(24) },
  { id: "e20", type: "expense", category: "housing", note: "Maintenance charges", amount: 2200, date: d(26) },
  { id: "e21", type: "expense", category: "other", note: "Gift for a friend", amount: 1500, date: d(28) },
  { id: "e22", type: "expense", category: "food", note: "Grocery run", amount: 2650, date: d(32) },
  { id: "e23", type: "income", category: "salary", note: "Monthly salary", amount: 68000, date: d(33) },
  { id: "e24", type: "expense", category: "housing", note: "Rent — July", amount: 18000, date: d(33) },
  { id: "e25", type: "expense", category: "shopping", note: "Festive shopping", amount: 4300, date: d(40) },
  { id: "e26", type: "expense", category: "entertainment", note: "Concert tickets", amount: 2600, date: d(45) },
  { id: "e27", type: "expense", category: "food", note: "Grocery run", amount: 2380, date: d(52) },
  { id: "e28", type: "income", category: "salary", note: "Monthly salary", amount: 68000, date: d(63) },
];

// Monthly budget ceilings per category — drives the budget tracker.
export const initialBudgets = {
  food: 9000,
  transport: 3500,
  housing: 20000,
  utilities: 3000,
  entertainment: 3000,
  health: 2500,
  shopping: 5000,
  other: 2000,
};