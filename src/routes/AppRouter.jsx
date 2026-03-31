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
import OTRoomManagement from "../features/admin/pages/OTRoomManagement";
import AllRooms from "../features/admin/pages/AllRooms";
import OtRoom from "../features/admin/pages/OtRoom";
import StaffManagement from "../features/staff/pages/StaffManagement";
import StaffSchedulePage from "../features/staff/pages/StaffSchedulePage";
import StaffAvailabilityPage from "../features/staff/pages/StaffAvailabilityPage";
import EquipmentManagement from "../features/equipment/pages/EquipmentManagement";
import EquipmentAttributePage from "../features/equipment/pages/EquipmentAttributePage";
import CatalogManagement from "../features/catalog/pages/CatalogManagement";
import OperationManagement from "../features/operations/pages/OperationManagement";
import OperationsListWrapper from "../features/operations/pages/OperationsListWrapper";
import CatalogPricePage from "../features/catalog/pages/CatalogPricePage";
import WardManagement from "../features/admin/pages/WardManagement";
import OperationMonitoring from "../features/operations/pages/OperationMonitoring";
import IpdRequests from "../features/ipd_request/pages/IpdRequests";

// Placeholder component
const Page = ({ title }) => (
    <div style={{ padding: "2rem" }}>
        <h2>{title}</h2>
    </div>
);

const AppRouter = () => {
    // Role groupings for cleaner routing configuration
    const CLINICAL_ROLES = [
        ROLES.ADMIN, ROLES.SURGEON, ROLES.ANESTHESIOLOGIST,
        ROLES.SCRUB_NURSE, ROLES.CIRCULATING_NURSE, ROLES.ANESTHESIA_NURSE,
        ROLES.OT_TECHNICIAN, ROLES.SURGICAL_TECH, ROLES.ANESTHESIA_TECHNICIAN,
        ROLES.NURSE, ROLES.RECEPTIONIST
    ];

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<PageLayout><Page title="403 — Access Denied" /></PageLayout>} />

                {/* Protected */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<PageLayout><Outlet /></PageLayout>}>
                        <Route path="/dashboard" element={<Page title="Dashboard" />} />

                        {/* SUPER_ADMIN Routes */}
                        <Route path="/hospital-management" element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}><HospitalManagement /></RoleGuard>} />
                        <Route path="/admin-management" element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}><AdminsManagement /></RoleGuard>} />

                        {/* ADMIN ONLY - Infrastructure & Logistics */}
                        <Route path="/staff-management" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><StaffManagement /></RoleGuard>} />
                        <Route path="/staff-schedule/:id" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><StaffSchedulePage /></RoleGuard>} />
                        <Route path="/staff-availability/:id" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><StaffAvailabilityPage /></RoleGuard>} />
                        <Route path="/equipment-management" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><EquipmentManagement /></RoleGuard>} />
                        <Route path="/equipment-attributes/:id" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><EquipmentAttributePage /></RoleGuard>} />
                        <Route path="/ot-management" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><OTManagement /></RoleGuard>} />
                        <Route path="/ot-room-management" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><OTRoomManagement /></RoleGuard>} />
                        <Route path="/all-rooms" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><AllRooms /></RoleGuard>} />
                        <Route path="/ot-room/:id" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><OtRoom /></RoleGuard>} />
                        <Route path="/ot-item-catalog" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><CatalogManagement /></RoleGuard>} />
                        <Route path="/ot-price-catalog/:id" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><CatalogPricePage /></RoleGuard>} />
                        <Route path="/ot-ward" element={<RoleGuard allowedRoles={[ROLES.ADMIN]}><WardManagement /></RoleGuard>} />

                        {/* Clinical & Operations (Shared) */}
                        <Route path="/operations-list" element={<RoleGuard allowedRoles={CLINICAL_ROLES}><OperationsListWrapper /></RoleGuard>} />
                        <Route path="/operation-monitoring/:operationId" element={<RoleGuard allowedRoles={CLINICAL_ROLES}><OperationMonitoring /></RoleGuard>} />
                        <Route path="/operation-management" element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.RECEPTIONIST]}><IpdRequests /></RoleGuard>} />

                        {/* RECEPTIONIST specific */}
                        <Route path="/room-management" element={<RoleGuard allowedRoles={[ROLES.RECEPTIONIST]}><Page title="Room Management" /></RoleGuard>} />
                        <Route path="/ward-management" element={<RoleGuard allowedRoles={[ROLES.RECEPTIONIST]}><Page title="Ward Management" /></RoleGuard>} />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;