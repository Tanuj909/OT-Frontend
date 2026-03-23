import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

// allowedRoles = ["SUPER_ADMIN", "ADMIN"] — jo bhi us route ke liye allowed hain
const RoleGuard = ({ allowedRoles }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;

  return allowedRoles.includes(user?.role)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
};

export default RoleGuard;