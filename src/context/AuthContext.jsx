import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";

const AuthContext = createContext();

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
      .then((res) => setUser(res.data.user || res.data))
      .catch(() => {
        localStorage.removeItem("freshlink_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (apiResponse) => {
    // Accept either { token, user } or { token, user: { ... } }
    const token = apiResponse?.token || apiResponse?.data?.token;
    const userObj = apiResponse?.user || apiResponse?.data?.user || apiResponse?.data || apiResponse;
    if (token) localStorage.setItem("freshlink_token", token);
    setUser(userObj.user ? userObj.user : userObj);
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
