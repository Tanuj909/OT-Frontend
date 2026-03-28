import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useOperations } from "../hooks/useOperations";
import { useStaffAssignment } from "../hooks/useStaffAssignment";
import { useSurgeonAssignment } from "../hooks/useSurgeonAssignment";
import { usePreop } from "../hooks/usePreop";
import { useStaff } from "../../staff/hooks/useStaff";

import StaffSection from "../components/StaffSection";
import PreOpSection from "../components/PreOpSection";
import IntraOpSection from "../components/IntraOpSection";
import VitalsSection from "../components/VitalsSection";
import NotesSection from "../components/NotesSection";
import ConsumablesSection from "../components/ConsumablesSection";
import IVFluidSection from "../components/IVFluidSection";
import AnesthesiaDrugSection from "../components/AnesthesiaDrugSection";

const OperationMonitoring = () => {
    const { operationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const operationData = location.state?.operationData || null;
    const { startSurgery, checkSurgeryStatus } = useOperations();
    const { getPreopStatus } = usePreop();

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

    const [surgeryStatus, setSurgeryStatus] = useState(null);
    const [preopStatus, setPreopStatus] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const refreshStatuses = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const preopRes = await getPreopStatus(operationId);
            if (preopRes.success) setPreopStatus(preopRes.data);

            const surgeryRes = await checkSurgeryStatus(operationId);
            if (surgeryRes.success) setSurgeryStatus(surgeryRes.data);
        } finally {
            setIsRefreshing(false);
        }
    }, [operationId, getPreopStatus, checkSurgeryStatus]);

    useEffect(() => {
        loadAllStaffData();
        refreshStatuses();
    }, [loadAllStaffData, refreshStatuses]);

    const handleStartSurgery = async () => {
        if (!window.confirm("Are you sure you want to start this surgery?")) return;
        
        const res = await startSurgery(operationId);
        if (res.success) {
            alert(res.message || "Surgery started successfully!");
            refreshStatuses();
        } else {
            alert(res.message || "Failed to start surgery.");
        }
    };

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

    const isPreopCompleted = preopStatus?.exists && preopStatus?.status === "COMPLETED";
    const currentSurgeryStatus = surgeryStatus?.status || operationData?.status;
    const isSurgeryInProgress = currentSurgeryStatus === "IN_PROGRESS";
    const isEmergency = currentSurgeryStatus === "EMERGENCY";

    // Find lead surgeon from assigned surgeons list
    const leadSurgeonObj = assignedSurgeons.find(s => s.primary || s.role === "LEAD_SURGEON");

    const patientData = {
        name: operationData?.patientName || "Loading...",
        mrn: operationData?.patientMrn || "N/A",
        procedure: operationData?.procedureName || "Procedure Details",
        surgeon: leadSurgeonObj?.surgeonName || operationData?.primarySurgeonName || "Not Assigned",
        room: operationData?.roomName || "OT Room",
        status: currentSurgeryStatus || "PENDING",
        startTime: operationData?.startTime || new Date().toISOString()
    };
    const restrictedSections = ["INTRA_OP", "IV_FLUIDS", "ANESTHESIA_DRUGS", "VITALS", "NOTES", "CONSUMABLES"];
    const isSectionRestricted = restrictedSections.includes(activeSection);
    
    // Logic: Block if NOT emergency AND (preop not done OR surgery not in progress)
    const isBlocked = !isEmergency && isSectionRestricted && (!isPreopCompleted || !isSurgeryInProgress);

    const sections = [
        { id: "STAFF", label: "Assigned Staff", icon: "fa-solid fa-users" },
        { id: "PRE_OP", label: "Pre-OP Prep", icon: "fa-solid fa-clipboard-check" },
        { id: "INTRA_OP", label: "Intra-OP Monitor", icon: "fa-solid fa-heart-pulse" },
        { id: "IV_FLUIDS", label: "IV Fluids", icon: "fa-solid fa-vial" },
        { id: "ANESTHESIA_DRUGS", label: "Anesthesia Drugs", icon: "fa-solid fa-syringe" },
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
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, minHeight: 0 }}>
                {/* Horizontal Section Navigation */}
                <div style={{ 
                    display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", 
                    backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0",
                    overflowX: "auto", whiteSpace: "nowrap"
                }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1.25rem",
                                borderRadius: "12px", border: "none", cursor: "pointer",
                                backgroundColor: activeSection === section.id ? "var(--hospital-blue)" : "transparent",
                                color: activeSection === section.id ? "white" : "#64748b",
                                transition: "all 0.3s ease",
                                fontWeight: "700", fontSize: "0.875rem",
                                border: activeSection === section.id ? "none" : "1px solid transparent"
                            }}
                        >
                            <i className={section.icon} style={{ fontSize: "1rem" }}></i>
                            <span>{section.label}</span>
                        </button>
                    ))}
                    
                    <div style={{ marginLeft: "auto", paddingLeft: "1rem", borderLeft: "1px solid #e2e8f0" }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 1.25rem",
                                borderRadius: "12px", border: "1px solid #fee2e2", backgroundColor: "#fff5f5", color: "#ef4444",
                                cursor: "pointer", fontWeight: "700", fontSize: "0.875rem"
                            }}
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Exit</span>
                        </button>
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="login-card" style={{ 
                    flex: 1, padding: "1.5rem", overflowY: "auto", maxWidth: "none", 
                    border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", position: "relative",
                    backgroundColor: "white" 
                }}>
                    {/* Render active section */}
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
                    {activeSection === "PRE_OP" && <PreOpSection onStatusUpdate={refreshStatuses} />}
                    {activeSection === "INTRA_OP" && <IntraOpSection />}
                    {activeSection === "IV_FLUIDS" && <IVFluidSection />}
                    {activeSection === "ANESTHESIA_DRUGS" && <AnesthesiaDrugSection />}
                    {activeSection === "VITALS" && <VitalsSection />}
                    {activeSection === "NOTES" && <NotesSection />}
                    {activeSection === "CONSUMABLES" && <ConsumablesSection />}

                    {/* Blocking Overlay */}
                    {isBlocked && (
                        <div style={{ 
                            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
                            backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(4px)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            zIndex: 10, borderRadius: "12px", textAlign: "center", padding: "2rem"
                        }}>
                            <div style={{ 
                                width: "80px", height: "80px", backgroundColor: "#fff", borderRadius: "50%", 
                                display: "flex", alignItems: "center", justifyContent: "center", 
                                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", marginBottom: "1.5rem"
                            }}>
                                <i className="fa-solid fa-lock" style={{ fontSize: "2rem", color: "#64748b" }}></i>
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1e293b", margin: "0 0 0.5rem" }}>Section Locked</h3>
                            <p style={{ color: "#64748b", fontWeight: "600", marginBottom: "1.5rem", maxWidth: "400px" }}>
                                {!isPreopCompleted 
                                    ? "Pre-OP assessment must be completed before accessing this clinical section."
                                    : "Surgery has not been started yet. Please start the surgery to begin monitoring."
                                }
                            </p>
                            
                            {isPreopCompleted && !isSurgeryInProgress && (
                                <button 
                                    onClick={handleStartSurgery}
                                    style={{
                                        backgroundColor: "var(--hospital-blue)", color: "white", border: "none",
                                        padding: "0.75rem 1.75rem", borderRadius: "8px", fontWeight: "800",
                                        cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
                                        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)"
                                    }}
                                >
                                    <i className="fa-solid fa-play"></i> Start Surgery Now
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperationMonitoring;
