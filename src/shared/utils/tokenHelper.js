import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "accessToken";

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

export const clearAllTokens = () => {
  removeToken();
};

export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const getUserFromToken = () => {
  const decoded = decodeToken();
  if (!decoded) return null;
  return {
    email: decoded.sub,   // ← tera JWT payload mein "sub" = email hai
    role: decoded.role,   // ⚠️ check karo JWT mein role hai ya nahi
  };
};

export const isTokenExpired = () => {
  const decoded = decodeToken();
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
};