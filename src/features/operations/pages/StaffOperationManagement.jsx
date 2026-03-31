import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffOperations } from "../hooks/useStaffOperations";
import { useAuthContext } from "../../../context/AuthContext";

const StaffOperationManagement = () => {
    const { user } = useAuthContext();
    const { 
        loading, 
        error, 
        assignedOperations, 
        fetchMyOperationsByStatus 
    } = useStaffOperations();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("SCHEDULED"); // SCHEDULED, IN_PROGRESS, COMPLETED, ALL
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = useCallback(() => {
        if (activeTab === "ALL") {
            fetchMyOperationsByStatus(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "EMERGENCY"]);
        } else {
            fetchMyOperationsByStatus([activeTab]);
        }
    }, [activeTab, fetchMyOperationsByStatus]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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

    const displayOperations = assignedOperations.filter(op => {
        return (
            op.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.patientMrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.procedureName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.assignedRole?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>My Assigned Operations</h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>View and manage surgical procedures where you are currently assigned</p>
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
                    <i className="fa-solid fa-history"></i> Assignment History
                </button>
            </div>

            {/* Search Controls */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", 
                backgroundColor: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" 
            }}>
                <div style={{ position: "relative", flex: "1" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by patient, MRN, or procedure..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "8px", border: "1.5px solid #f1f5f9" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={loadData}
                    style={{ padding: "0.6rem 1.2rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}
                >
                    <i className="fa-solid fa-rotate"></i>
                </button>
            </div>

            {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Retrieving your assignments...</div>}
            {error && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {/* Assignments Registry */}
            {!loading && (
                <div className="login-card" style={{ padding: 0, border: "1px solid #e2e8f0", boxShadow: "none", maxWidth: "none" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Patient Profile</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>My Role</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Surgery Details</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Theater</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Timing</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Status</th>
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
                                                <div style={{ 
                                                    display: "inline-flex", padding: "0.25rem 0.6rem", borderRadius: "6px",
                                                    backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.7rem", fontWeight: "800"
                                                }}>
                                                    {op.assignedRole?.replace("_", " ")}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontWeight: "700", color: "#334155" }}>{op.procedureName}</div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Lead: {op.primarySurgeon}</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <i className="fa-solid fa-door-open" style={{ color: "#94a3b8" }}></i>
                                                    <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>{op.roomName}</span>
                                                </div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{op.roomNumber}</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>{new Date(op.scheduledStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Duration: {formatDuration(op.surgeryDurationMinutes || 120)}</div>
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
                                                <button 
                                                    onClick={() => navigate(`/operation-monitoring/${op.operationId}`, { state: { operationData: op } })}
                                                    style={{ 
                                                        padding: "0.5rem 1rem", 
                                                        backgroundColor: (op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? "var(--hospital-blue)" : "#fff", 
                                                        color: (op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? "white" : "#0f172a",
                                                        border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "800",
                                                        display: "inline-flex", alignItems: "center", gap: "0.5rem"
                                                    }}
                                                >
                                                    {(op.status === "IN_PROGRESS" || op.status === "SCHEDULED") ? <><i className="fa-solid fa-stethoscope"></i> Monitor</> : <><i className="fa-solid fa-eye"></i> View</>}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="7" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8" }}>
                                            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: "3rem", marginBottom: "1.5rem", color: "#f1f5f9", display: "block" }}></i>
                                            {searchTerm ? "No assignments match your search." : "You have no operations assigned in this category."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

function formatDuration(mins) {
    if (!mins) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
}

export default StaffOperationManagement;
