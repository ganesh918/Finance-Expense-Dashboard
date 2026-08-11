import { createContext, useContext, useEffect, useState } from "react";

/*
 * Mock authentication only — there is no backend in this project (per spec,
 * dummy/static data only, no API integration). Accounts and sessions are
 * kept in localStorage purely so a page refresh doesn't log you out during
 * a demo. Passwords are stored in plain text here for simplicity; never do
 * this in a real application — use a real auth provider or hashed
 * passwords on a real server instead.
 */

const AuthContext = createContext(null);
const USERS_KEY = "ledger_users";
const SESSION_KEY = "ledger_session";

const seedUsers = () => {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) return JSON.parse(existing);
  const seeded = [
    { id: "u1", name: "Demo User", email: "demo@ledger.com", password: "demo1234" },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
};

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || seedUsers();
  } catch {
    return seedUsers();
  }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedUsers();
    try {
      const sessionEmail = localStorage.getItem(SESSION_KEY);
      if (sessionEmail) {
        const found = getUsers().find((u) => u.email === sessionEmail);
        if (found) setUser({ id: found.id, name: found.name, email: found.email });
      }
    } finally {
      setReady(true);
    }
  }, []);

  const login = ({ email, password }) => {
    const users = getUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) {
      return { ok: false, error: "Email or password is incorrect." };
    }
    localStorage.setItem(SESSION_KEY, match.email);
    setUser({ id: match.id, name: match.name, email: match.email });
    return { ok: true };
  };

  const signup = ({ name, email, password }) => {
    const users = getUsers();
    const already = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (already) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = { id: `u_${Date.now()}`, name: name.trim(), email: email.trim(), password };
    const next = [...users, newUser];
    saveUsers(next);
    localStorage.setItem(SESSION_KEY, newUser.email);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = ({ name, email }) => {
    const users = getUsers();
    const current = users.find((u) => u.email === user.email);
    if (!current) return { ok: false, error: "Account not found." };

    const emailTaken = users.some(
      (u) => u.id !== current.id && u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailTaken) return { ok: false, error: "That email is already in use." };

    const updated = users.map((u) =>
      u.id === current.id ? { ...u, name: name.trim(), email: email.trim() } : u
    );
    saveUsers(updated);
    localStorage.setItem(SESSION_KEY, email.trim());
    setUser({ id: current.id, name: name.trim(), email: email.trim() });
    return { ok: true };
  };

  const changePassword = ({ currentPassword, newPassword }) => {
    const users = getUsers();
    const current = users.find((u) => u.email === user.email);
    if (!current) return { ok: false, error: "Account not found." };
    if (current.password !== currentPassword) {
      return { ok: false, error: "Current password is incorrect." };
    }
    const updated = users.map((u) => (u.id === current.id ? { ...u, password: newPassword } : u));
    saveUsers(updated);
    return { ok: true };
  };

  const deleteAccount = () => {
    const users = getUsers();
    saveUsers(users.filter((u) => u.email !== user.email));
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, updateProfile, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};