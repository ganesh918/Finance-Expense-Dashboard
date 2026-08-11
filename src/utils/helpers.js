export const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

export const formatDate = (isoDate) => {
  const dt = new Date(isoDate);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const monthKey = (isoDate) => isoDate.slice(0, 7); // YYYY-MM

export const weekKey = (isoDate) => {
  const dt = new Date(isoDate);
  const firstJan = new Date(dt.getFullYear(), 0, 1);
  const week = Math.ceil(((dt - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
  return `${dt.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;