import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "../hooks/useOperations";
import { useStaffAssignment } from "../hooks/useStaffAssignment";
import { useSurgeonAssignment } from "../hooks/useSurgeonAssignment";
import { useStaff } from "../../staff/hooks/useStaff";

import StaffSection from "../components/StaffSection";
import PreOpSection from "../components/PreOpSection";
import IntraOpSection from "../components/IntraOpSection";
import VitalsSection from "../components/VitalsSection";
import NotesSection from "../components/NotesSection";
import ConsumablesSection from "../components/ConsumablesSection";

const OperationMonitoring = () => {
    const { operationId } = useParams();
    const navigate = useNavigate();
    const { 
        loading: staffLoading, 
        fetchAssignedStaff, 
        assignStaffToOperation, 
        unassignStaffFromOperation,
        fetchAvailableStaff
    } = useStaffAssignment();

    const {
        loading: surgeonsLoading,
        fetchAssignedSurgeons,
        assignSurgeonsToOperation,
        unassignSurgeonsFromOperation,
        fetchAvailableSurgeons
    } = useSurgeonAssignment();

    const [assignedStaff, setAssignedStaff] = useState([]);
    const [assignedSurgeons, setAssignedSurgeons] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [availableSurgeons, setAvailableSurgeons] = useState([]);
    const [activeSection, setActiveSection] = useState("STAFF");

    const loadAllStaffData = useCallback(async () => {
        // Fetch assigned
        const assignedRes = await fetchAssignedStaff(operationId);
        if (assignedRes.success) setAssignedStaff(assignedRes.data);

        const assignedSurgeonsRes = await fetchAssignedSurgeons(operationId);
        if (assignedSurgeonsRes.success) setAssignedSurgeons(assignedSurgeonsRes.data);

        // Fetch available
        const staffRes = await fetchAvailableStaff();
        if (staffRes.success) setAvailableStaff(staffRes.data);

        const surgeonsRes = await fetchAvailableSurgeons();
        if (surgeonsRes.success) setAvailableSurgeons(surgeonsRes.data);
    }, [operationId, fetchAssignedStaff, fetchAssignedSurgeons, fetchAvailableStaff, fetchAvailableSurgeons]);

    useEffect(() => {
        loadAllStaffData();
    }, [loadAllStaffData]);

    const handleAssignStaff = async (staffId, staffName, role) => {
        const staffObj = [{ staffId: parseInt(staffId), staffName, role }];
        const res = await assignStaffToOperation(operationId, staffObj);
        if (res.success) {
            loadAllStaffData();
        } else {
            alert(res.message || "Failed to assign staff");
        }
    };

    const handleAssignSurgeon = async (surgeonId, surgeonName, role) => {
        const isPrimary = role === "PRIMARY_SURGEON" || role === "LEAD_SURGEON";
        const surgeonObj = [{ surgeonId: parseInt(surgeonId), surgeonName, role, isPrimary }];
        const res = await assignSurgeonsToOperation(operationId, surgeonObj);
        if (res.success) {
            loadAllStaffData();
        } else {
            alert(res.message || "Failed to assign surgeon");
        }
    };

    const handleUnassignStaff = async (staffId) => {
        const res = await unassignStaffFromOperation(operationId, [staffId]);
        if (res.success) {
            loadAllStaffData();
        } else {
            alert(res.message || "Failed to unassign staff");
        }
    };

    const handleUnassignSurgeon = async (surgeonId) => {
        const res = await unassignSurgeonsFromOperation(operationId, [surgeonId]);
        if (res.success) {
            loadAllStaffData();
        } else {
            alert(res.message || "Failed to unassign surgeon");
        }
    };

    // Sample data (to be replaced by APIs)
    const patientData = {
        name: "Johnathan Smith",
        mrn: "MRN-882910",
        procedure: "Laparoscopic Cholecystectomy",
        surgeon: "Dr. Sarah Mitchell",
        anesthesiologist: "Dr. Robert Chen",
        room: "OT Room 04",
        status: "IN_PROGRESS",
        startTime: new Date().toISOString()
    };

    const sections = [
        { id: "STAFF", label: "Assigned Staff", icon: "fa-solid fa-users" },
        { id: "PRE_OP", label: "Pre-OP Prep", icon: "fa-solid fa-clipboard-check" },
        { id: "INTRA_OP", label: "Intra-OP Monitor", icon: "fa-solid fa-heart-pulse" },
        { id: "VITALS", label: "Patient Vitals", icon: "fa-solid fa-gauge-high" },
        { id: "NOTES", label: "Operation Notes", icon: "fa-solid fa-file-medical" },
        { id: "CONSUMABLES", label: "Consumables Used", icon: "fa-solid fa-box-archive" }
    ];

    return (
        <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header: Patient & Procedure Info */}
            <div className="login-card" style={{ 
                padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", 
                display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to right, #ffffff, #f8fafc)",
                maxWidth: "none"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ backgroundColor: "#eff6ff", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--hospital-blue)" }}>
                        <i className="fa-solid fa-id-card" style={{ fontSize: "1.5rem" }}></i>
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <h1 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>{patientData.name}</h1>
                            <span style={{ fontSize: "0.75rem", padding: "0.1rem 0.6rem", borderRadius: "20px", backgroundColor: "#e2e8f0", fontWeight: "700" }}>{patientData.mrn}</span>
                        </div>
                        <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>
                            <i className="fa-solid fa-stethoscope" style={{ marginRight: "0.4rem" }}></i>
                            {patientData.procedure}
                        </p>
                    </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", gap: "1.5rem" }}>
                    <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Current OT Room</div>
                        <div style={{ fontWeight: "800", color: "var(--hospital-blue)" }}>{patientData.room}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>Lead Surgeon</div>
                        <div style={{ fontWeight: "800" }}>{patientData.surgeon}</div>
                    </div>
                    <div style={{ backgroundColor: "#2563eb", padding: "0.4rem 1rem", borderRadius: "8px", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span style={{ fontWeight: "800", fontSize: "0.75rem" }}>MONITORING ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Content: Layout with Tabs and Workspace */}
            <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
                {/* Section Navigation Sidebar */}
                <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem",
                                borderRadius: "12px", border: "none", cursor: "pointer", textAlign: "left",
                                backgroundColor: activeSection === section.id ? "var(--hospital-blue)" : "white",
                                color: activeSection === section.id ? "white" : "#64748b",
                                transition: "all 0.3s ease",
                                boxShadow: activeSection === section.id ? "0 10px 15px -3px rgba(37, 99, 235, 0.4)" : "none",
                                border: activeSection === section.id ? "none" : "1px solid #e2e8f0"
                            }}
                        >
                            <i className={section.icon} style={{ fontSize: "1.1rem" }}></i>
                            <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>{section.label}</span>
                        </button>
                    ))}
                    
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: "auto", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem",
                            borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fff5f5", color: "#ef4444",
                            cursor: "pointer", textAlign: "left"
                        }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>Exit Monitoring</span>
                    </button>
                </div>

                {/* Workspace Area */}
                <div className="login-card" style={{ flex: 1, padding: "1.5rem", overflowY: "auto", maxWidth: "none", border: "1px solid #e2e8f0", boxShadow: "none" }}>
                    {activeSection === "STAFF" && (
                        <StaffSection 
                            assignedStaff={assignedStaff} 
                            assignedSurgeons={assignedSurgeons}
                            surgeons={availableSurgeons} 
                            clinicalStaff={availableStaff} 
                            onAssignStaff={handleAssignStaff} 
                            onAssignSurgeon={handleAssignSurgeon} 
                            onUnassignStaff={handleUnassignStaff} 
                            onUnassignSurgeon={handleUnassignSurgeon} 
                            loading={staffLoading || surgeonsLoading}
                        />
                    )}
                    {activeSection === "PRE_OP" && <PreOpSection />}
                    {activeSection === "INTRA_OP" && <IntraOpSection />}
                    {activeSection === "VITALS" && <VitalsSection />}
                    {activeSection === "NOTES" && <NotesSection />}
                    {activeSection === "CONSUMABLES" && <ConsumablesSection />}
                </div>
            </div>
        </div>
    );
};

export default OperationMonitoring;
