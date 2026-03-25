import { useEffect, useState, useCallback } from "react";
import { useOperations } from "../hooks/useOperations";
import { useAdmin } from "../../admin/hooks/useAdmin";
import { useOtRoom } from "../../admin/hooks/useOtroom";
import { useStaff } from "../../staff/hooks/useStaff";

const SURGERY_STATUS = [
    "REQUESTED", "SCHEDULED", "CONFIRMED", "IN_PROGRESS", 
    "COMPLETED", "CANCELLED", "DELAYED", "EMERGENCY"
];

const OperationManagement = () => {
    const { 
        loading, 
        error, 
        operations, 
        fetchRequestedOperations, 
        fetchAllOperations, 
        fetchOperationsByStatus,
        scheduleOperation 
    } = useOperations();

    const { ots, fetchOTs } = useAdmin();
    const { rooms, fetchRoomsByTheater } = useOtRoom();
    const { staffList, fetchAllStaff } = useStaff();

    const [activeTab, setActiveTab] = useState("REQUESTED"); // REQUESTED, ALL, BY_STATUS
    const [selectedStatus, setSelectedStatus] = useState("IN_PROGRESS");
    const [searchTerm, setSearchTerm] = useState("");

    // Scheduling Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [schedulingOp, setSchedulingOp] = useState(null);
    const [selectedTheaterId, setSelectedTheaterId] = useState("");
    
    const [scheduleForm, setScheduleForm] = useState({
        roomId: "",
        surgeonId: "",
        surgeonName: "",
        anesthesiologistId: "",
        anesthesiologistName: "",
        startTime: "",
        endTime: ""
    });

    const loadData = useCallback(() => {
        if (activeTab === "REQUESTED") {
            fetchRequestedOperations();
        } else if (activeTab === "ALL") {
            fetchAllOperations();
        } else {
            fetchOperationsByStatus(selectedStatus);
        }
    }, [activeTab, selectedStatus, fetchRequestedOperations, fetchAllOperations, fetchOperationsByStatus]);

    useEffect(() => {
        loadData();
        fetchOTs();
        fetchAllStaff();
    }, [loadData, fetchOTs, fetchAllStaff]);

    // Handle Theater selection change
    const handleTheaterChange = (e) => {
        const theaterId = e.target.value;
        setSelectedTheaterId(theaterId);
        if (theaterId) {
            fetchRoomsByTheater(theaterId);
        }
    };

    const handleOpenSchedule = (op) => {
        setSchedulingOp(op);
        setScheduleForm({
            ...scheduleForm,
            startTime: op.startTime?.substring(0, 16) || "",
            endTime: op.endTime?.substring(0, 16) || ""
        });
        setIsScheduleModalOpen(true);
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        const res = await scheduleOperation(schedulingOp.operationId, scheduleForm);
        if (res.success) {
            alert("Surgery Scheduled Successfully");
            setIsScheduleModalOpen(false);
            setSelectedTheaterId("");
            loadData();
        } else {
            alert(res.message || "Scheduling failed.");
        }
    };

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
            <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
                <button 
                    onClick={() => setActiveTab("REQUESTED")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", 
                        color: activeTab === "REQUESTED" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "REQUESTED" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-inbox"></i> Surgery Requests
                </button>
                <button 
                    onClick={() => setActiveTab("ALL")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", 
                        color: activeTab === "ALL" ? "var(--hospital-blue)" : "#64748b",
                        borderBottom: activeTab === "ALL" ? "2px solid var(--hospital-blue)" : "none",
                        transition: "all 0.2s"
                    }}
                >
                    <i className="fa-solid fa-list-ul"></i> All Surgeons Log
                </button>
                <button 
                    onClick={() => setActiveTab("BY_STATUS")}
                    style={{ 
                        padding: "0.75rem 1.5rem", border: "none", background: "none", cursor: "pointer",
                        fontWeight: "700", fontSize: "0.875rem", 
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
                                                    {op.status === "REQUESTED" && (
                                                        <button 
                                                            onClick={() => handleOpenSchedule(op)}
                                                            style={{ padding: "0.4rem 0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}
                                                        >
                                                            <i className="fa-solid fa-calendar-check"></i> Schedule
                                                        </button>
                                                    )}
                                                    <button style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}>
                                                        View File
                                                    </button>
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

            {/* Scheduling Modal */}
            {isScheduleModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleScheduleSubmit} className="login-card" style={{ maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Finalize Surgery Schedule</h2>
                                <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Registering theater and clinical staff for {schedulingOp?.patientName}</p>
                            </div>
                            <button type="button" onClick={() => { setIsScheduleModalOpen(false); setSelectedTheaterId(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            {/* Theater & Room */}
                            <div style={{ gridColumn: selectedTheaterId ? "span 1" : "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ASSIGNED THEATER</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required 
                                    value={selectedTheaterId} 
                                    onChange={handleTheaterChange}
                                >
                                    <option value="">Select Theater Block</option>
                                    {ots.map(ot => <option key={ot.id} value={ot.id}>{ot.name}</option>)}
                                </select>
                            </div>

                            {selectedTheaterId && (
                                <div style={{ gridColumn: "span 1" }}>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>SPECIFIC OT ROOM</label>
                                    <select 
                                        style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                        required
                                        value={scheduleForm.roomId}
                                        onChange={e => setScheduleForm({...scheduleForm, roomId: e.target.value})}
                                    >
                                        <option value="">Select Room</option>
                                        {rooms.map(room => <option key={room.id} value={room.id}>{room.roomName} - {room.roomNumber}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Surgeon */}
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PRIMARY SURGEON</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={scheduleForm.surgeonId}
                                    onChange={e => {
                                        const s = staffList.find(x => x.id === parseInt(e.target.value));
                                        setScheduleForm({...scheduleForm, surgeonId: e.target.value, surgeonName: s?.name || ""});
                                    }}
                                >
                                    <option value="">Select Surgeon</option>
                                    {staffList.filter(s => s.role === "SURGEON" || s.role === "DOCTOR").map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Anesthesiologist */}
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ANESTHESIOLOGIST</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={scheduleForm.anesthesiologistId}
                                    onChange={e => {
                                        const s = staffList.find(x => x.id === parseInt(e.target.value));
                                        setScheduleForm({...scheduleForm, anesthesiologistId: e.target.value, anesthesiologistName: s?.name || ""});
                                    }}
                                >
                                    <option value="">Select Specialist</option>
                                    {staffList.filter(s => s.role === "ANESTHESIOLOGIST" || s.role === "DOCTOR").map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Timings */}
                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PROCEDURE START</label>
                                <input 
                                    type="datetime-local" 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    required
                                    value={scheduleForm.startTime}
                                    onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ESTIMATED END</label>
                                <input 
                                    type="datetime-local" 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    required
                                    value={scheduleForm.endTime}
                                    onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        width: "100%", padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                                        border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer",
                                        textTransform: "uppercase", letterSpacing: "1px"
                                    }}
                                >
                                    Authorize Surgical Booking
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OperationManagement;
