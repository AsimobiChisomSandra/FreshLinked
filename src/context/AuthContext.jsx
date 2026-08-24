import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";

const AuthContext = createContext();

const readUser = (apiResponse) => {
  const payload = apiResponse?.data ?? apiResponse ?? {};
  const candidate = payload.user ?? payload ?? apiResponse ?? {};
  return candidate && typeof candidate === "object" && (candidate._id || candidate.id || candidate.email)
    ? candidate
    : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("freshlink_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((res) => {
        const authUser = readUser(res);
        setUser(authUser);
        if (!authUser) localStorage.removeItem("freshlink_token");
      })
      .catch(() => {
        localStorage.removeItem("freshlink_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (apiResponse) => {
    const payload = apiResponse?.data ?? apiResponse ?? {};
    const token = payload?.token ?? apiResponse?.token;
    const authUser = readUser(payload) ?? readUser(apiResponse);

    if (token) {
      localStorage.setItem("freshlink_token", token);
    }

    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("freshlink_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
