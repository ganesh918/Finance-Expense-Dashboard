import { useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPage.css";

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" };

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const { notify } = useToast();

  const isSignup = mode === "signup";

  const switchMode = (next) => {
    setMode(next);
    setForm(emptyForm);
    setErrors({});
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (isSignup && !form.name.trim()) next.name = "Enter your name.";

    if (!form.email.trim()) next.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Enter your password.";
    else if (isSignup && form.password.length < 8) next.password = "Password must be at least 8 characters.";

    if (isSignup) {
      if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
      else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const result = isSignup
      ? signup({ name: form.name, email: form.email, password: form.password })
      : login({ email: form.email, password: form.password });

    setSubmitting(false);

    if (!result.ok) {
      setErrors({ form: result.error });
      notify(result.error, "error");
      return;
    }
    notify(isSignup ? `Welcome, ${form.name.split(" ")[0]}!` : "Welcome back!", "success");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__mark"><LuLock size={16} /></span>
          <div>
            <h1 className="auth-card__title">Ledger</h1>
            <p className="auth-card__subtitle">Finance & Expense Dashboard</p>
          </div>
        </div>

        <div className="segmented segmented--full">
          <button
            type="button"
            className={`segmented__btn ${!isSignup ? "segmented__btn--active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`segmented__btn ${isSignup ? "segmented__btn--active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="entry-form" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <label className="field">
              <span className="field__label">Full name</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Jordan Patel"
                className={errors.name ? "input input--error" : "input"}
                autoComplete="name"
              />
              {errors.name && <span className="field__error">{errors.name}</span>}
            </label>
          )}

          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
              className={errors.email ? "input input--error" : "input"}
              autoComplete="email"
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                placeholder={isSignup ? "At least 8 characters" : "••••••••"}
                className={errors.password ? "input input--error" : "input"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-input__toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </label>

          {isSignup && (
            <label className="field">
              <span className="field__label">Confirm password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? "input input--error" : "input"}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
            </label>
          )}

          {errors.form && <p className="auth-card__form-error">{errors.form}</p>}

          <button type="submit" className="btn btn--primary auth-card__submit" disabled={submitting}>
            {submitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}