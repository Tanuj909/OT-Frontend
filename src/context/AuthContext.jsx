import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  isTokenExpired,
  clearAllTokens,
  setToken,
  getToken,
  decodeToken,
} from "../shared/utils/tokenHelper";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null); // auto logout timer

  // ─── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAllTokens();
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setUser(null);
    setIsAuthenticated(false);

    // Timer clear karo
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // ─── Auto Logout Timer ───────────────────────────────────────
  // Token ki expiry tak ka time calculate karo aur timer set karo
  const scheduleAutoLogout = useCallback(() => {
    const decoded = decodeToken();
    if (!decoded?.exp) return;

    const expiresInMs = decoded.exp * 1000 - Date.now();

    if (expiresInMs <= 0) {
      // Pehle se expire ho chuka hai
      logout();
      return;
    }

    // Timer set karo — jaise hi token expire hoga, logout ho jaayega
    timerRef.current = setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, expiresInMs);

  }, [logout]);

  // ─── App Load Check ──────────────────────────────────────────
  useEffect(() => {
    const initAuth = () => {
      const token = getToken();

      if (!token || isTokenExpired()) {
        clearAllTokens();
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        setUser(null);
        setIsAuthenticated(false);
      } else {
        const role = localStorage.getItem("userRole");
        const email = localStorage.getItem("userEmail");
        setUser({ email, role });
        setIsAuthenticated(true);
        scheduleAutoLogout(); // ← timer shuru karo
      }
      setIsLoading(false);
    };

    initAuth();

    // Cleanup — component unmount pe timer clear karo
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ─── Login ───────────────────────────────────────────────────
  const login = ({ email, role, token }) => {
    setToken(token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    setUser({ email, role });
    setIsAuthenticated(true);
    scheduleAutoLogout(); // ← login ke baad bhi timer shuru karo
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
};
