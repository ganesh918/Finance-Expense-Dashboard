import { useEffect, useState } from "react";
import { CATEGORIES, INCOME_SOURCES } from "../data/dummyData";
import { LuX } from "react-icons/lu";

const emptyForm = {
  type: "expense",
  category: "food",
  note: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function ExpenseForm({ open, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? { ...initialData, amount: String(initialData.amount) }
          : { ...emptyForm, category: "food" }
      );
      setErrors({});
    }
  }, [open, initialData]);

  if (!open) return null;

  const categoryOptions = form.type === "income" ? INCOME_SOURCES : CATEGORIES;

  const validate = () => {
    const next = {};
    if (!form.note.trim()) next.note = "Add a short description.";
    else if (form.note.trim().length < 3) next.note = "Description is too short.";

    const amountNum = Number(form.amount);
    if (!form.amount) next.amount = "Enter an amount.";
    else if (Number.isNaN(amountNum) || amountNum <= 0) next.amount = "Amount must be a positive number.";

    if (!form.date) next.date = "Pick a date.";
    else if (new Date(form.date) > new Date()) next.date = "Date can't be in the future.";

    if (!form.category) next.category = "Choose a category.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" ? { category: value === "income" ? "salary" : "food" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      amount: Number(form.amount),
      id: initialData?.id,
    });
  };

  return (
    <div className="modal-scrim" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal__header">
          <h3 id="form-title">{initialData ? "Edit entry" : "Add entry"}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close form"><LuX size={18} /></button>
        </div>

        <form className="entry-form" onSubmit={handleSubmit} noValidate>
          <div className="segmented segmented--full">
            <button
              type="button"
              className={`segmented__btn ${form.type === "expense" ? "segmented__btn--active segmented__btn--coral" : ""}`}
              onClick={() => setForm((p) => ({ ...p, type: "expense", category: "food" }))}
            >
              Expense
            </button>
            <button
              type="button"
              className={`segmented__btn ${form.type === "income" ? "segmented__btn--active segmented__btn--mint" : ""}`}
              onClick={() => setForm((p) => ({ ...p, type: "income", category: "salary" }))}
            >
              Income
            </button>
          </div>

          <label className="field">
            <span className="field__label">Description</span>
            <input
              type="text"
              value={form.note}
              onChange={handleChange("note")}
              placeholder="e.g. Grocery run"
              className={errors.note ? "input input--error" : "input"}
            />
            {errors.note && <span className="field__error">{errors.note}</span>}
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field__label">Amount (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange("amount")}
                placeholder="0.00"
                className={errors.amount ? "input input--error" : "input"}
              />
              {errors.amount && <span className="field__error">{errors.amount}</span>}
            </label>

            <label className="field">
              <span className="field__label">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                max={new Date().toISOString().slice(0, 10)}
                className={errors.date ? "input input--error" : "input"}
              />
              {errors.date && <span className="field__error">{errors.date}</span>}
            </label>
          </div>

          <label className="field">
            <span className="field__label">Category</span>
            <select value={form.category} onChange={handleChange("category")} className="input">
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <div className="entry-form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">{initialData ? "Save changes" : "Add entry"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}