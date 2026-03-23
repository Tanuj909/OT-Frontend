import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ROLES } from "../shared/constants/roles";
import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "./RoleGuard";
import PageLayout from "../shared/components/layout/PageLayout";

// Auth
import Login from "../features/auth/pages/Login";

import HospitalManagement from "../features/superAdmin/pages/HospitalManagement";
import AdminsManagement from "../features/superAdmin/pages/AdminsManagement";

import OTManagement from "../features/admin/pages/OTManagement";

// Placeholder component — baad mein real pages se replace karna
const Page = ({ title }) => (
  <div style={{ padding: "2rem" }}>
    <h2>{title}</h2>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<PageLayout><Page title="403 — Access Denied" /></PageLayout>} />

        {/* Protected — login hona chahiye */}
        <Route element={<ProtectedRoute />}>

          {/* Common Routes for all logged-in users — Dashboard sabke liye common hai */}
          <Route element={<PageLayout><Outlet /></PageLayout>}>
            <Route path="/dashboard" element={<Page title="Dashboard" />} />

            {/* SUPER_ADMIN specific routes */}
            <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />}>
              <Route path="/hospital-management" element={<HospitalManagement />} />
              <Route path="/admin-management" element={<AdminsManagement />} />
            </Route>

            {/* ADMIN specific routes */}
            <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/staff-management" element={<Page title="Staff Management" />} />
              <Route path="/ot-management" element={<OTManagement />} />
              <Route path="/ot-room-management" element={<Page title="OT Room Management" />} />
              <Route path="/ot-item-catalog" element={<Page title="OT Item Catalog" />} />
              <Route path="/ot-ward" element={<Page title="OT Ward" />} />
              <Route path="/equipment-management" element={<Page title="Equipment Management" />} />
            </Route>

            {/* RECEPTIONIST specific routes */}
            <Route element={<RoleGuard allowedRoles={[ROLES.RECEPTIONIST]} />}>
              <Route path="/operation-management" element={<Page title="Operation Management" />} />
              <Route path="/room-management" element={<Page title="Room Management" />} />
              <Route path="/ward-management" element={<Page title="Ward Management" />} />
            </Route>

            {/* SURGEON specific routes */}
            <Route element={<RoleGuard allowedRoles={[ROLES.SURGEON]} />}>
              <Route path="/pre-op" element={<Page title="Manage Pre-OP" />} />
              <Route path="/intra-op" element={<Page title="Manage Intra-OP" />} />
              <Route path="/iv-fluids" element={<Page title="IV Fluids" />} />
              <Route path="/vitals-management" element={<Page title="Vitals Management" />} />
            </Route>

          </Route>

          {/* Default redirect — role ke hisaab se pehle page pe bhejo */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;