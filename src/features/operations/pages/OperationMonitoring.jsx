import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useOperations } from "../hooks/useOperations";
import { useStaffAssignment } from "../hooks/useStaffAssignment";
import { useSurgeonAssignment } from "../hooks/useSurgeonAssignment";
import { usePreop } from "../hooks/usePreop";
import { useStaff } from "../../staff/hooks/useStaff";
import { useAdmin } from "../../admin/hooks/useAdmin";
import { useOtRoom } from "../../admin/hooks/useOtroom";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";

import StaffSection from "../components/StaffSection";
import PreOpSection from "../components/PreOpSection";
import IntraOpSection from "../components/IntraOpSection";
import VitalsSection from "../components/VitalsSection";
import NotesSection from "../components/NotesSection";
import ConsumablesSection from "../components/ConsumablesSection";
import IVFluidSection from "../components/IVFluidSection";
import AnesthesiaDrugSection from "../components/AnesthesiaDrugSection";
import EquipmentSection from "../components/EquipmentSection";
import ImplantSection from "../components/ImplantSection";
import SurgeryEndModal from "../components/SurgeryEndModal";
import OperationReportModal from "../components/OperationReportModal";

const OperationMonitoring = () => {
    const { user } = useAuthContext();
    const role = user?.role;
    const { operationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const operationData = location.state?.operationData || null;
    const { 
        startSurgery, 
        checkSurgeryStatus, 
        fetchSurgeryReadiness, 
        fetchOperationReport,
        shiftRoom 
    } = useOperations();
    const { getPreopStatus } = usePreop();
    const { ots, fetchOTs } = useAdmin();
    const { rooms: theaterRooms, fetchRoomsByTheater } = useOtRoom();

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

    const [surgeryStatus, setSurgeryStatus] = useState(null);
    const [preopStatus, setPreopStatus] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [surgeryReadiness, setSurgeryReadiness] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedShiftTheater, setSelectedShiftTheater] = useState("");
    const [selectedShiftRoom, setSelectedShiftRoom] = useState("");
    const [isShiftingRoom, setIsShiftingRoom] = useState(false);

    // Define all possible sections
    const allSections = [
        { id: "STAFF", label: "Assigned Staff", icon: "fa-solid fa-users" },
        { id: "PRE_OP", label: "Pre-OP Prep", icon: "fa-solid fa-clipboard-check" },
        { id: "INTRA_OP", label: "Intra-OP Monitor", icon: "fa-solid fa-heart-pulse" },
        { id: "IV_FLUIDS", label: "IV Fluids", icon: "fa-solid fa-vial" },
        { id: "ANESTHESIA_DRUGS", label: "Anesthesia Drugs", icon: "fa-solid fa-syringe" },
        { id: "VITALS", label: "Patient Vitals", icon: "fa-solid fa-gauge-high" },
        { id: "NOTES", label: "Operation Notes", icon: "fa-solid fa-file-medical" },
        { id: "CONSUMABLES", label: "Consumables Used", icon: "fa-solid fa-box-archive" },
        { id: "EQUIPMENT", label: "Equipment Usage", icon: "fa-solid fa-laptop-medical" },
        { id: "IMPLANTS", label: "Implants", icon: "fa-solid fa-bone" }
    ];

    // Filter sections based on role
    const sections = (() => {
        if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) return allSections;
        
        switch (role) {
            case ROLES.SURGEON:
                return allSections.filter(s => ["PRE_OP", "INTRA_OP", "NOTES", "IMPLANTS", "STAFF"].includes(s.id));
            case ROLES.ANESTHESIOLOGIST:
                return allSections.filter(s => ["PRE_OP", "ANESTHESIA_DRUGS", "IV_FLUIDS", "VITALS", "STAFF"].includes(s.id));
            case ROLES.NURSE:
            case ROLES.SCRUB_NURSE:
            case ROLES.CIRCULATING_NURSE:
            case ROLES.ANESTHESIA_NURSE:
                return allSections.filter(s => ["VITALS", "NOTES", "CONSUMABLES", "EQUIPMENT", "IV_FLUIDS", "STAFF"].includes(s.id));
            case ROLES.OT_TECHNICIAN:
            case ROLES.SURGICAL_TECH:
            case ROLES.ANESTHESIA_TECHNICIAN:
                return allSections.filter(s => ["EQUIPMENT", "CONSUMABLES", "STAFF"].includes(s.id));
            case ROLES.RECEPTIONIST:
                return allSections.filter(s => ["STAFF"].includes(s.id));
            default:
                return allSections;
        }
    })();

    const [activeSection, setActiveSection] = useState(sections[0]?.id || "STAFF");

    useEffect(() => {
        // Ensure active section is valid for this role
        if (!sections.some(s => s.id === activeSection)) {
            setActiveSection(sections[0]?.id || "STAFF");
        }
    }, [role, sections, activeSection]);

    const loadAllStaffData = useCallback(async () => {
        // Fetch assigned
        const assignedRes = await fetchAssignedStaff(operationId);
        if (assignedRes.success) setAssignedStaff(assignedRes.data);

        const assignedSurgeonsRes = await fetchAssignedSurgeons(operationId);
        if (assignedSurgeonsRes.success) setAssignedSurgeons(assignedSurgeonsRes.data);

        // Fetch available (Usually restricted to Admins)
        if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
            const staffRes = await fetchAvailableStaff();
            if (staffRes.success) setAvailableStaff(staffRes.data);

            const surgeonsRes = await fetchAvailableSurgeons();
            if (surgeonsRes.success) setAvailableSurgeons(surgeonsRes.data);
        }
    }, [operationId, fetchAssignedStaff, fetchAssignedSurgeons, fetchAvailableStaff, fetchAvailableSurgeons, role]);

    const refreshStatuses = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const preopRes = await getPreopStatus(operationId);
            if (preopRes.success) setPreopStatus(preopRes.data);

            const surgeryRes = await checkSurgeryStatus(operationId);
            if (surgeryRes.success) setSurgeryStatus(surgeryRes.data);

            const readinessRes = await fetchSurgeryReadiness(operationId);
            if (readinessRes.success) setSurgeryReadiness(readinessRes.data);
        } finally {
            setIsRefreshing(false);
        }
    }, [operationId, getPreopStatus, checkSurgeryStatus, fetchSurgeryReadiness]);

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

    const handleEndSuccess = (data) => {
        refreshStatuses();
        navigate("/operations-list");
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
    const isSurgeryCompleted = currentSurgeryStatus === "COMPLETED";
    const isSurgeryStarted = currentSurgeryStatus === "IN_PROGRESS" || currentSurgeryStatus === "COMPLETED";
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

    const handleViewReport = async () => {
        const res = await fetchOperationReport(operationId);
        if (res.success) {
            setReportData(res.data);
            setIsReportOpen(true);
        } else {
            alert(res.message || "Failed to load report");
        }
    };

    const handleShiftRoomSubmit = async (e) => {
        e.preventDefault();
        if (!selectedShiftRoom) return alert("Select a room first");
        
        setIsShiftingRoom(true);
        const res = await shiftRoom(operationId, selectedShiftRoom);
        setIsShiftingRoom(false);
        
        if (res.success) {
            alert(res.message || "Room shifted successfully");
            setIsShiftModalOpen(false);
            window.location.reload(); // Re-fetch all or reload to reflect new location
        } else {
            alert(res.message || "Failed to shift room");
        }
    };
    const restrictedSections = ["INTRA_OP", "IV_FLUIDS", "ANESTHESIA_DRUGS", "VITALS", "NOTES", "CONSUMABLES", "EQUIPMENT", "IMPLANTS"];
    // Only restrict sections that are actually in the user's available sections
    const availableRestrictedSections = restrictedSections.filter(id => sections.some(s => s.id === id));
    const isSectionRestricted = availableRestrictedSections.includes(activeSection);
    
    // Logic: Block if NOT emergency AND (preop not done OR surgery not started/completed)
    const isBlocked = !isEmergency && isSectionRestricted && (!isPreopCompleted || !isSurgeryStarted);

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

                <div style={{ textAlign: "right", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ 
                        padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid #f1f5f9", 
                        backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex", flexDirection: "column", gap: "0.15rem"
                    }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.025em" }}>Current OT Room</div>
                        <div style={{ fontWeight: "800", color: "var(--hospital-blue)", fontSize: "0.875rem" }}>{patientData.room}</div>
                    </div>
                    
                    <div style={{ 
                        padding: "0.5rem 1rem", borderRadius: "12px", border: "1px solid #f1f5f9", 
                        backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex", flexDirection: "column", gap: "0.15rem"
                    }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.025em" }}>Lead Surgeon</div>
                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.875rem" }}>{patientData.surgeon}</div>
                    </div>
                    
                    {currentSurgeryStatus === "SCHEDULED" && (
                        <button 
                            onClick={async () => {
                                setIsShiftModalOpen(true);
                                // Prevent 401 logout for non-admins by only fetching if they have permissions
                                if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
                                    try { await fetchOTs(); } catch(e) {}
                                }
                            }}
                            style={{ 
                                height: "42px",
                                padding: "0 1.25rem", borderRadius: "10px", 
                                background: "#ffffff",
                                color: "var(--hospital-blue)", display: "flex", alignItems: "center", gap: "0.6rem",
                                border: "1.5px solid var(--hospital-blue)", cursor: "pointer", fontWeight: "800", fontSize: "0.75rem",
                                textTransform: "uppercase", letterSpacing: "0.05em",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f7ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                        >
                            <i className="fa-solid fa-right-left"></i>
                            <span>Shift Room</span>
                        </button>
                    )}

                    {isSurgeryInProgress && (role === ROLES.ADMIN || role === ROLES.SURGEON) && (
                        <button 
                            onClick={() => setIsEndModalOpen(true)}
                            className="end-surgery-btn"
                            style={{ 
                                height: "42px",
                                padding: "0 1.25rem", borderRadius: "10px", 
                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "white", display: "flex", alignItems: "center", gap: "0.6rem",
                                border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.75rem",
                                boxShadow: "0 8px 15px -3px rgba(239, 68, 68, 0.4)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                textTransform: "uppercase", letterSpacing: "0.05em",
                                border: "1px solid rgba(255, 255, 255, 0.1)"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 12px 20px -5px rgba(239, 68, 68, 0.5)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 8px 15px -3px rgba(239, 68, 68, 0.4)";
                            }}
                        >
                            <i className="fa-solid fa-circle-stop" style={{ fontSize: "0.9rem" }}></i>
                            <span>End Surgery</span>
                        </button>
                    )}

                    {isSurgeryCompleted && (
                        <div style={{ 
                            height: "42px", padding: "0 1.25rem", borderRadius: "10px", 
                            backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                            display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: "800", fontSize: "0.75rem",
                            textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>
                            <i className="fa-solid fa-circle-check" style={{ fontSize: "0.9rem" }}></i>
                            <span>Surgery Completed</span>
                        </div>
                    )}

                    {surgeryReadiness?.currentStatus === "COMPLETED" && (
                        <button 
                            onClick={handleViewReport}
                            style={{ 
                                height: "42px",
                                padding: "0 1.25rem", borderRadius: "10px", 
                                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                color: "white", display: "flex", alignItems: "center", gap: "0.6rem",
                                border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.75rem",
                                boxShadow: "0 8px 15px -3px rgba(37, 99, 235, 0.4)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                textTransform: "uppercase", letterSpacing: "0.05em"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <i className="fa-solid fa-file-invoice" style={{ fontSize: "0.9rem" }}></i>
                            <span>Operation Report</span>
                        </button>
                    )}
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
                    {activeSection === "EQUIPMENT" && <EquipmentSection />}
                    {activeSection === "IMPLANTS" && <ImplantSection />}

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
                            
                            {isPreopCompleted && !isSurgeryInProgress && (role === ROLES.ADMIN || role === ROLES.SURGEON) && (
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
            <SurgeryEndModal 
                isOpen={isEndModalOpen} 
                onClose={() => setIsEndModalOpen(false)} 
                operationId={operationId} 
                onEndSuccess={handleEndSuccess}
            />
            <OperationReportModal 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                data={reportData}
            />

            {/* Room Shifting Modal */}
            {isShiftModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
                    <div className="login-card" style={{ maxWidth: "450px", width: "100%", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>Shift Surgery Room</h2>
                            <button onClick={() => setIsShiftModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleShiftRoomSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.6rem", color: "#64748b" }}>SELECT NEW THEATER</label>
                                <select 
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}
                                    value={selectedShiftTheater}
                                    onChange={(e) => {
                                        setSelectedShiftTheater(e.target.value);
                                        if (e.target.value) fetchRoomsByTheater(e.target.value);
                                    }}
                                    required
                                >
                                    <option value="">Select Theater</option>
                                    {ots.map(ot => <option key={ot.id} value={ot.id}>{ot.name}</option>)}
                                </select>
                            </div>

                            {selectedShiftTheater && (
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.6rem", color: "#64748b" }}>AVAILABLE ROOMS</label>
                                    <select 
                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}
                                        value={selectedShiftRoom}
                                        onChange={(e) => setSelectedShiftRoom(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Room</option>
                                        {theaterRooms.map(room => (
                                            <option key={room.id} value={room.id}>{room.roomName} ({room.roomNumber})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isShiftingRoom || !selectedShiftRoom}
                                style={{ 
                                    width: "100%", padding: "1rem", borderRadius: "10px", 
                                    backgroundColor: "var(--hospital-blue)", color: "white", 
                                    border: "none", fontWeight: "800", cursor: "pointer",
                                    opacity: (isShiftingRoom || !selectedShiftRoom) ? 0.7 : 1
                                }}
                            >
                                {isShiftingRoom ? "Processing..." : "Confirm Room Transfer"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationMonitoring;
