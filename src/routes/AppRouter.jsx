import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../features/auth/pages/Login";

// Placeholder — baad mein real pages se replace karna
const Dashboard = () => (
  <div style={{ padding: "2rem" }}>
    <h2>Dashboard — Login Successful! ✅</h2>
  </div>
);

const Unauthorized = () => (
  <div style={{ padding: "2rem" }}>
    <h2>403 — Access Denied</h2>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;