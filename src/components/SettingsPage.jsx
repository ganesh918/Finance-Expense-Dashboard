import { useEffect, useState } from "react";
import {
  LuUser, LuLock, LuPalette, LuBell, LuDatabase, LuTriangleAlert,
  LuDownload, LuTrash2, LuEye, LuEyeOff, LuSave, LuShieldCheck,
  LuCalendarDays, LuMail,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import "./SettingsPage.css";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: LuUser },
  { id: "security", label: "Security", icon: LuLock },
  { id: "preferences", label: "Preferences", icon: LuPalette },
  { id: "notifications", label: "Notifications", icon: LuBell },
  { id: "budgets", label: "Budget limits", icon: LuDatabase },
  { id: "data", label: "Data", icon: LuDownload },
  { id: "danger", label: "Danger zone", icon: LuTriangleAlert },
];

const scrollTo = (id) => document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function SettingsPage({ expenses, onResetData }) {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const { settings, updateSettings, updateBudget, resetSettings, CURRENCIES, CATEGORIES } = useSettings();
  const { notify } = useToast();

  return (
    <div className="settings-page">
      {/* Profile hero */}
      <section className="settings-hero">
        <span className="settings-hero__avatar">{initials(user?.name)}</span>
        <div className="settings-hero__body">
          <h2 className="settings-hero__name">{user?.name}</h2>
          <div className="settings-hero__meta">
            <span><LuMail size={13} /> {user?.email}</span>
            <span><LuShieldCheck size={13} /> Account secured</span>
            <span><LuCalendarDays size={13} /> Member since demo start</span>
          </div>
        </div>
        <div className="settings-hero__badge">
          <LuShieldCheck size={14} /> Verified
        </div>
      </section>

      {/* Section jump rail */}
      <nav className="settings-jumprail">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} className="settings-jumprail__item" onClick={() => scrollTo(id)}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>

      <div className="settings-body" id="settings-profile">
        <ProfileSection user={user} updateProfile={updateProfile} notify={notify} />
        <div id="settings-security"><SecuritySection changePassword={changePassword} notify={notify} /></div>
        <div id="settings-preferences"><PreferencesSection settings={settings} updateSettings={updateSettings} CURRENCIES={CURRENCIES} notify={notify} /></div>
        <div id="settings-notifications"><NotificationsSection settings={settings} updateSettings={updateSettings} notify={notify} /></div>
        <div id="settings-budgets"><BudgetsSection settings={settings} updateBudget={updateBudget} CATEGORIES={CATEGORIES} notify={notify} /></div>
        <div id="settings-data"><DataSection expenses={expenses} settings={settings} onResetData={onResetData} resetSettings={resetSettings} notify={notify} /></div>
        <div id="settings-danger"><DangerZone deleteAccount={deleteAccount} logout={logout} notify={notify} /></div>
      </div>
    </div>
  );
}

/* ---------- Profile ---------- */
function ProfileSection({ user, updateProfile, notify }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const result = updateProfile(form);
    setSaving(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      notify(result.error, "error");
      return;
    }
    notify("Profile updated.", "success");
  };

  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuUser size={16} /></span>
        <div>
          <h3 className="card__title">Profile</h3>
          <p className="settings-section__desc">Your name and email address</p>
        </div>
      </div>
      <form className="entry-form" onSubmit={handleSubmit} noValidate>
        <div className="field-row">
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={errors.name ? "input input--error" : "input"}
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={errors.email ? "input input--error" : "input"}
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </label>
        </div>
        {errors.form && <p className="auth-card__form-error">{errors.form}</p>}
        <div className="entry-form__actions entry-form__actions--start">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <LuSave size={15} /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Security ---------- */
function SecuritySection({ changePassword, notify }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();
  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["var(--coral)", "var(--coral)", "var(--brass)", "var(--mint)", "var(--pine)"][strength];

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = "Enter your current password.";
    if (!form.newPassword) next.newPassword = "Enter a new password.";
    else if (form.newPassword.length < 8) next.newPassword = "Must be at least 8 characters.";
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const result = changePassword(form);
    setSaving(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      notify(result.error, "error");
      return;
    }
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    notify("Password updated.", "success");
  };

  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuLock size={16} /></span>
        <div>
          <h3 className="card__title">Security</h3>
          <p className="settings-section__desc">Change your password</p>
        </div>
      </div>
      <form className="entry-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field__label">Current password</span>
          <div className="password-input">
            <input
              type={show ? "text" : "password"}
              value={form.currentPassword}
              onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className={errors.currentPassword ? "input input--error" : "input"}
            />
            <button type="button" className="password-input__toggle" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
              {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
          </div>
          {errors.currentPassword && <span className="field__error">{errors.currentPassword}</span>}
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field__label">New password</span>
            <input
              type={show ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              className={errors.newPassword ? "input input--error" : "input"}
            />
            {errors.newPassword && <span className="field__error">{errors.newPassword}</span>}
          </label>
          <label className="field">
            <span className="field__label">Confirm new password</span>
            <input
              type={show ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              className={errors.confirmPassword ? "input input--error" : "input"}
            />
            {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
          </label>
        </div>
        {form.newPassword && (
          <div className="password-strength">
            <div className="password-strength__bars">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="password-strength__bar" style={{ background: i < strength ? strengthColor : "var(--line-strong)" }} />
              ))}
            </div>
            <span className="password-strength__label" style={{ color: strengthColor }}>{strengthLabel}</span>
          </div>
        )}
        {errors.form && <p className="auth-card__form-error">{errors.form}</p>}
        <div className="entry-form__actions entry-form__actions--start">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ---------- Preferences ---------- */
function PreferencesSection({ settings, updateSettings, CURRENCIES, notify }) {
  const set = (patch, msg) => {
    updateSettings(patch);
    notify(msg, "success");
  };
  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuPalette size={16} /></span>
        <div>
          <h3 className="card__title">Preferences</h3>
          <p className="settings-section__desc">Currency, date format, and appearance</p>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Currency</p>
          <p className="settings-row__desc">Used across all amounts in the app</p>
        </div>
        <select
          className="input input--compact"
          value={settings.currency}
          onChange={(e) => set({ currency: e.target.value }, "Currency updated.")}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Date format</p>
          <p className="settings-row__desc">How dates are displayed in tables</p>
        </div>
        <select
          className="input input--compact"
          value={settings.dateFormat}
          onChange={(e) => set({ dateFormat: e.target.value }, "Date format updated.")}
        >
          <option value="dd-mm-yyyy">DD-MM-YYYY</option>
          <option value="mm-dd-yyyy">MM-DD-YYYY</option>
          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
        </select>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Theme</p>
          <p className="settings-row__desc">Choose a light or dark appearance</p>
        </div>
        <div className="theme-picker">
          <button
            type="button"
            className={`theme-swatch ${settings.theme === "light" ? "theme-swatch--active" : ""}`}
            onClick={() => set({ theme: "light" }, "Switched to light theme.")}
          >
            <span className="theme-swatch__preview theme-swatch__preview--light" />
            Light
          </button>
          <button
            type="button"
            className={`theme-swatch ${settings.theme === "dark" ? "theme-swatch--active" : ""}`}
            onClick={() => set({ theme: "dark" }, "Switched to dark theme.")}
          >
            <span className="theme-swatch__preview theme-swatch__preview--dark" />
            Dark
          </button>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Compact tables</p>
          <p className="settings-row__desc">Tighter row spacing in transaction tables</p>
        </div>
        <ToggleSwitch
          checked={settings.compactTable}
          onChange={(v) => set({ compactTable: v }, v ? "Compact tables on." : "Compact tables off.")}
        />
      </div>
    </section>
  );
}

/* ---------- Notifications ---------- */
function NotificationsSection({ settings, updateSettings, notify }) {
  const set = (patch, msg) => {
    updateSettings(patch);
    notify(msg, "success");
  };
  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuBell size={16} /></span>
        <div>
          <h3 className="card__title">Notifications</h3>
          <p className="settings-section__desc">Alerts and summaries</p>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Budget alerts</p>
          <p className="settings-row__desc">Notify when a category goes over budget</p>
        </div>
        <ToggleSwitch
          checked={settings.budgetAlerts}
          onChange={(v) => set({ budgetAlerts: v }, v ? "Budget alerts on." : "Budget alerts off.")}
        />
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row__label">Monthly email summary</p>
          <p className="settings-row__desc">A recap of income and spend each month</p>
        </div>
        <ToggleSwitch
          checked={settings.emailSummary}
          onChange={(v) => set({ emailSummary: v }, v ? "Email summaries on." : "Email summaries off.")}
        />
      </div>
    </section>
  );
}

/* ---------- Budgets ---------- */
function BudgetsSection({ settings, updateBudget, CATEGORIES, notify }) {
  const [drafts, setDrafts] = useState(settings.budgets);

  useEffect(() => setDrafts(settings.budgets), [settings.budgets]);

  const handleSave = (id) => {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0) {
      notify("Enter a valid budget amount.", "error");
      return;
    }
    updateBudget(id, value);
    notify("Budget limit updated.", "success");
  };

  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuDatabase size={16} /></span>
        <div>
          <h3 className="card__title">Budget limits</h3>
          <p className="settings-section__desc">Monthly ceilings used by the Budgets page</p>
        </div>
      </div>
      <div className="budget-edit-grid">
        {CATEGORIES.map((cat) => (
          <div className="budget-edit-row" key={cat.id}>
            <span className="budget-edit-row__dot" style={{ background: cat.color }} />
            <span className="budget-edit-row__name">{cat.label}</span>
            <input
              type="number"
              min="0"
              className="input input--compact"
              value={drafts[cat.id] ?? 0}
              onChange={(e) => setDrafts((p) => ({ ...p, [cat.id]: e.target.value }))}
            />
            <button className="btn btn--ghost budget-edit-row__save" onClick={() => handleSave(cat.id)}>
              Save
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Data management ---------- */
function DataSection({ expenses, settings, onResetData, resetSettings, notify }) {
  const handleExport = () => {
    const payload = { exportedAt: new Date().toISOString(), settings, expenses };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger-data-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify("Export downloaded.", "success");
  };

  const handleResetData = () => {
    if (!window.confirm("Reset all transactions back to the demo dataset? This can't be undone.")) return;
    onResetData();
    notify("Transactions reset to demo data.", "info");
  };

  const handleResetSettings = () => {
    resetSettings();
    notify("Settings reset to defaults.", "info");
  };

  return (
    <section className="card settings-section">
      <div className="settings-section__head">
        <span className="settings-section__icon"><LuDownload size={16} /></span>
        <div>
          <h3 className="card__title">Data</h3>
          <p className="settings-section__desc">Export or reset your data (stored locally in this browser)</p>
        </div>
      </div>
      <div className="settings-actions">
        <button className="btn btn--ghost" onClick={handleExport}>
          <LuDownload size={15} /> Export as JSON
        </button>
        <button className="btn btn--ghost" onClick={handleResetSettings}>
          Reset preferences
        </button>
        <button className="btn btn--ghost settings-actions__danger" onClick={handleResetData}>
          <LuTrash2 size={15} /> Reset transactions
        </button>
      </div>
    </section>
  );
}

/* ---------- Danger zone ---------- */
function DangerZone({ deleteAccount, logout, notify }) {
  const handleDelete = () => {
    if (!window.confirm("Permanently delete your account? This can't be undone.")) return;
    notify("Account deleted.", "error");
    deleteAccount();
  };

  return (
    <section className="card settings-section settings-section--danger">
      <div className="settings-section__head">
        <span className="settings-section__icon settings-section__icon--danger"><LuTriangleAlert size={16} /></span>
        <div>
          <h3 className="card__title">Danger zone</h3>
          <p className="settings-section__desc">Irreversible actions</p>
        </div>
      </div>
      <div className="settings-actions">
        <button className="btn btn--ghost" onClick={logout}>Log out</button>
        <button className="btn btn--danger" onClick={handleDelete}>
          <LuTrash2 size={15} /> Delete account
        </button>
      </div>
    </section>
  );
}

/* ---------- Reusable toggle ---------- */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle-switch ${checked ? "toggle-switch--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-switch__thumb" />
    </button>
  );
}