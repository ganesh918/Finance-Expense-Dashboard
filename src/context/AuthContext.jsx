import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext(null);
const USERS_KEY = "ledger_users";
const SESSION_KEY = "ledger_session";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // If the email is already registered, the password must match it.
    if (existing) {
      if (existing.password !== password) {
        return { ok: false, error: "Email or password is incorrect." };
      }
      localStorage.setItem(SESSION_KEY, existing.email);
      setUser({ id: existing.id, name: existing.name, email: existing.email });
      return { ok: true };
    }

    // Unrecognized email — auto-create an account so login works without a
    // separate signup step. Demo-only behavior; a real app would never do this.
    const derivedName = cleanEmail.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newUser = { id: `u_${Date.now()}`, name: derivedName || "Member", email: email.trim(), password };
    saveUsers([...users, newUser]);
    localStorage.setItem(SESSION_KEY, newUser.email);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
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