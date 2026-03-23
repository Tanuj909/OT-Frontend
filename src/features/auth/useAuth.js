import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { loginApi } from "./authApi";
import { ROLES } from "../../shared/constants/roles";

const ROLE_REDIRECT = {
  [ROLES.SUPER_ADMIN]: "/dashboard",
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.SURGEON]: "/dashboard",
  [ROLES.DOCTOR]: "/dashboard",
  [ROLES.NURSE]: "/dashboard",
  [ROLES.RECEPTIONIST]: "/dashboard",
  [ROLES.STAFF]: "/dashboard",
};

export const useAuth = () => {
  const { login, logout, user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data: response } = await loginApi(credentials);

      // Tera response: response.data.email, response.data.role, response.data.token
      const { email, role, token } = response.data;

      login({ email, role, token });

      const redirectPath = ROLE_REDIRECT[role] || "/dashboard";
      navigate(redirectPath, { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    navigate("/login", { replace: true });
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleLogout,
  };
};