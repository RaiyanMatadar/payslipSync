// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("payroll_token") || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("payroll_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data.admin);
          localStorage.setItem("payroll_user", JSON.stringify(res.data.admin));
        } catch (err) {
          console.warn("Session verification failed:", err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem("payroll_token");
          localStorage.removeItem("payroll_user");
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const res = await API.post("/auth/login", { emailOrUsername, password });
    const { token: receivedToken, admin } = res.data;
    setToken(receivedToken);
    setUser(admin);
    localStorage.setItem("payroll_token", receivedToken);
    localStorage.setItem("payroll_user", JSON.stringify(admin));
    return admin;
  };

  const register = async ({ name, email, username, password }) => {
    const res = await API.post("/auth/register", { name, email, username, password });
    const { token: receivedToken, admin } = res.data;
    setToken(receivedToken);
    setUser(admin);
    localStorage.setItem("payroll_token", receivedToken);
    localStorage.setItem("payroll_user", JSON.stringify(admin));
    return admin;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("payroll_token");
    localStorage.removeItem("payroll_user");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
