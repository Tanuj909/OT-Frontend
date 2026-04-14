import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOperations } from "../hooks/useOperations";
import { useAdmin } from "../../admin/hooks/useAdmin";
import { useOtRoom } from "../../admin/hooks/useOtroom";
import { useStaff } from "../../staff/hooks/useStaff";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";
import BillingModal from "../../billing/components/BillingModal";
import BillingSummary from "../../billing/components/BillingSummary";
import { useBilling } from "../../billing/hooks/useBilling";
import TransferToRecoveryModal from "../components/TransferToRecoveryModal";
import AdmissionStatusButton from "../components/AdmissionStatusButton";
import RecoveryDetailsModal from "../components/RecoveryDetailsModal";

const SURGERY_STATUS = [
    "REQUESTED", "SCHEDULED", "CONFIRMED", "IN_PROGRESS", 
    "COMPLETED", "CANCELLED", "DELAYED", "EMERGENCY"
];

const OperationManagement = () => {
    const { user } = useAuthContext();
    const { 
        loading, 
        error, 
        operations, 
        fetchAllOperations,
        fetchOperationsByStatus 
    } = useOperations();
    const navigate = useNavigate();

    const { ots, fetchOTs } = useAdmin();
    const { rooms, fetchRoomsByTheater } = useOtRoom();
    const { staffList, fetchAllStaff } = useStaff();

    const [activeTab, setActiveTab] = useState(user?.role === ROLES.RECEPTIONIST ? "ALL" : "SCHEDULED"); // SCHEDULED, IN_PROGRESS, ALL, BY_STATUS
    const [selectedStatus, setSelectedStatus] = useState("IN_PROGRESS");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBillingOp, setSelectedBillingOp] = useState(null);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isBillingSummaryOpen, setIsBillingSummaryOpen] = useState(false);
    const { fetchBillingSummary, billingSummary } = useBilling();

    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedOpForTransfer, setSelectedOpForTransfer] = useState(null);

    const [isRecoveryDetailsOpen, setIsRecoveryDetailsOpen] = useState(false);
    const [selectedOpIdForRecovery, setSelectedOpIdForRecovery] = useState(null);

    const handleTransferClick = (op) => {
        setSelectedOpForTransfer(op);
        setIsTransferModalOpen(true);
    };

    const handleViewRecoveryClick = (opId) => {
        setSelectedOpIdForRecovery(opId);
        setIsRecoveryDetailsOpen(true);
    };

    const loadData = useCallback(() => {
        if (activeTab === "ALL") {
            fetchAllOperations();
        } else if (activeTab === "SCHEDULED") {
            fetchOperationsByStatus("SCHEDULED");
        } else if (activeTab === "IN_PROGRESS") {
            fetchOperationsByStatus("IN_PROGRESS");
        } else if (activeTab === "COMPLETED") {
            fetchOperationsByStatus("COMPLETED");
        } else {
            fetchOperationsByStatus(selectedStatus);
        }
    }, [activeTab, selectedStatus, fetchAllOperations, fetchOperationsByStatus]);

    const handleViewBillingSummary = async (opId) => {
        const res = await fetchBillingSummary(opId);
        if (res.success) {
            setIsBillingSummaryOpen(true);
        }
    };

    useEffect(() => {
        loadData();
        
        // IMPORTANT: Clinical staff (Surgeons, Nurses, Techs) may not have permission 
        // to view the entire staff registry or all OT theaters, leading to 401 errors.
        if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
            fetchOTs();
            fetchAllStaff();
        }
    }, [loadData, fetchOTs, fetchAllStaff, user?.role]);

    const getStatusStyle = (status) => {
        switch(status) {
            case "REQUESTED": return { color: "#3b82f6", bg: "#eff6ff", icon: "fa-regular fa-paper-plane" };
            case "SCHEDULED": return { color: "#8b5cf6", bg: "#f5f3ff", icon: "fa-regular fa-calendar-days" };
            case "CONFIRMED": return { color: "#10b981", bg: "#ecfdf5", icon: "fa-solid fa-check-double" };
            case "IN_PROGRESS": return { color: "#2563eb", bg: "#eff6ff", icon: "fa-solid fa-spinner fa-spin" };
            case "COMPLETED": return { color: "#16a34a", bg: "#f0fdf4", icon: "fa-solid fa-circle-check" };
            case "CANCELLED": return { color: "#dc2626", bg: "#fef2f2", icon: "fa-solid fa-ban" };
            case "DELAYED": return { color: "#ea580c", bg: "#fff7ed", icon: "fa-solid fa-clock-rotate-left" };
            case "EMERGENCY": return { color: "#991b1b", bg: "#fef2f2", icon: "fa-solid fa-triangle-exclamation" };
            default: return { color: "#64748b", bg: "#f8fafc", icon: "fa-solid fa-question" };
        }
    };

    const displayOperations = operations.filter(op => {
        return (
            op.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.patientMrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.procedureName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>Surgery & Operation Center</h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Monitor surgical requests, ongoing operations, and theater utilization registry</p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "2px" }}>

                <button 
                    onClick={() => setActiveTab("SCHEDULED")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", whiteSpace: "nowrap",
                        color: activeTab === "SCHEDULED" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "SCHEDULED" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-regular fa-calendar-check"></i> Scheduled
                </button>
                <button 
                    onClick={() => setActiveTab("IN_PROGRESS")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", whiteSpace: "nowrap",
                        color: activeTab === "IN_PROGRESS" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "IN_PROGRESS" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-spinner"></i> In Progress
                </button>
                <button 
                    onClick={() => setActiveTab("COMPLETED")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", whiteSpace: "nowrap",
                        color: activeTab === "COMPLETED" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "COMPLETED" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-circle-check"></i> Completed
                </button>
                <button 
                    onClick={() => setActiveTab("ALL")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", whiteSpace: "nowrap",
                        color: activeTab === "ALL" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "ALL" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-list-ul"></i> All Operations
                </button>
                <button 
                    onClick={() => setActiveTab("BY_STATUS")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", whiteSpace: "nowrap",
                        color: activeTab === "BY_STATUS" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "BY_STATUS" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-filter"></i> Filter by State
                </button>
            </div>

            {/* Filter Controls */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", 
                backgroundColor: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" 
            }}>
                <div style={{ position: "relative", flex: "1" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by patient, MRN, or theater..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "8px", border: "1.5px solid #f1f5f9" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === "BY_STATUS" && (
                    <select 
                        style={{ padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #f1f5f9", minWidth: "180px", fontWeight: "700", color: "#475569" }}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        {SURGERY_STATUS.map(s => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                    </select>
                )}
                <button 
                    onClick={loadData}
                    style={{ padding: "0.6rem 1.2rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}
                >
                    <i className="fa-solid fa-rotate"></i>
                </button>
            </div>

            {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Processing surgical records...</div>}
            {error && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {/* Operations Registry */}
            {!loading && (
                <div className="login-card" style={{ padding: 0, border: "1px solid #e2e8f0", boxShadow: "none", maxWidth: "none" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Patient Profile</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Surgery Details</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Assigned Theater</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Timing</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Registry Status</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayOperations.length > 0 ? displayOperations.map((op) => {
                                    const style = getStatusStyle(op.status);
                                    return (
                                        <tr key={op.operationId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontWeight: "800", color: "#0f172a" }}>{op.patientName}</div>
                                                <div style={{ fontSize: "0.7rem", color: "#64748b" }}>MRN: <code style={{ color: "var(--hospital-blue)" }}>{op.patientMrn}</code></div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontWeight: "700", color: "#334155" }}>{op.procedureName}</div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Ref: {op.operationReference?.substring(0, 8)}...</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <i className="fa-solid fa-hospital-user" style={{ color: "#94a3b8" }}></i>
                                                    <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>{op.roomName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>{new Date(op.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>EST End: {new Date(op.endTime).toLocaleTimeString([], { timeStyle: 'short' })}</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ 
                                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                                    padding: "0.35rem 0.75rem", borderRadius: "12px",
                                                    fontSize: "0.65rem", fontWeight: "800",
                                                    color: style.color, backgroundColor: style.bg,
                                                    border: `1px solid ${style.color}33`
                                                }}>
                                                    <i className={style.icon}></i>
                                                    {op.status.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedBillingOp(op);
                                                            setIsBillingModalOpen(true);
                                                        }}
                                                        style={{ 
                                                            padding: "0.4rem 0.8rem", 
                                                            backgroundColor: "#f8fafc", 
                                                            color: "#2563eb",
                                                            border: "1px solid #dbeafe", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700",
                                                            display: "flex", alignItems: "center", gap: "0.4rem"
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-file-invoice-dollar"></i> Billing
                                                    </button>
                                                    <button 
                                                        onClick={() => handleViewBillingSummary(op.operationId)}
                                                        style={{ 
                                                            padding: "0.4rem 0.8rem", 
                                                            backgroundColor: "#f0f9ff", 
                                                            color: "#0369a1",
                                                            border: "1px solid #e0f2fe", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700",
                                                            display: "flex", alignItems: "center", gap: "0.4rem"
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-file-contract"></i> Summary
                                                    </button>

                                                    {op.status === "COMPLETED" && (
                                                        <AdmissionStatusButton 
                                                            operationId={op.operationId} 
                                                            onTransferClick={() => handleTransferClick(op)} 
                                                            onViewRecovery={() => handleViewRecoveryClick(op.operationId)}
                                                        />
                                                    )}

                                                    {user?.role !== ROLES.BILLING_INCHARGE && (
                                                        <button 
                                                            onClick={() => navigate(`/operation-monitoring/${op.operationId}`, { state: { operationData: op } })}
                                                            style={{ 
                                                                padding: "0.4rem 0.8rem", 
                                                                backgroundColor: (op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? "#2563eb" : "#fff", 
                                                                color: (op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? "white" : "#0f172a",
                                                                border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" 
                                                            }}
                                                        >
                                                            {(op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? <><i className="fa-solid fa-desktop"></i> Monitor</> : "View Details"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8" }}>
                                            <i className="fa-solid fa-clipboard-list" style={{ fontSize: "3rem", marginBottom: "1.5rem", color: "#f1f5f9", display: "block" }}></i>
                                            {searchTerm ? "No records match your search." : "No surgery requests pending for this registry."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isBillingModalOpen && (
                <BillingModal 
                    isOpen={isBillingModalOpen}
                    onClose={() => setIsBillingModalOpen(false)}
                    operationId={selectedBillingOp?.operationId}
                    patientName={selectedBillingOp?.patientName}
                />
            )}

            {isBillingSummaryOpen && (
                <BillingSummary 
                    isOpen={isBillingSummaryOpen}
                    onClose={() => setIsBillingSummaryOpen(false)}
                    data={billingSummary}
                />
            )}

            {isTransferModalOpen && (
                <TransferToRecoveryModal 
                    operation={selectedOpForTransfer}
                    onClose={() => setIsTransferModalOpen(false)}
                    onSuccess={loadData}
                />
            )}

            {isRecoveryDetailsOpen && (
                <RecoveryDetailsModal 
                    operationId={selectedOpIdForRecovery}
                    onClose={() => setIsRecoveryDetailsOpen(false)}
                />
            )}
        </div>
    );
};

export default OperationManagement;
