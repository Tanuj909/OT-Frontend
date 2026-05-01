import { useEffect, useState, useCallback } from "react";
import { useOperations } from "../../../features/operations/hooks/useOperations";
import { useAdmin } from "../../../features/admin/hooks/useAdmin";
import { useOtRoom } from "../../../features/admin/hooks/useOtroom";
import { useStaff } from "../../../features/staff/hooks/useStaff";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";
import { useIpdRequests } from "../hooks/useIpdRequests";
import { getAvailableStaffByTimeApi } from "../../../features/staff/service/staffService";

const IpdRequests = () => {
    const { 
        loading, 
        error, 
        operations, 
        fetchRequestedOperations, 
        scheduleOperation 
    } = useOperations();

    const { activeOts, fetchActiveOTs } = useAdmin();
    const { rooms, fetchRoomsByTheater } = useOtRoom();
    const { staffList, fetchAllStaff } = useStaff();
    const { user } = useAuthContext();
    const [availableSurgeons, setAvailableSurgeons] = useState([]);
    const [availableAnesthesiologists, setAvailableAnesthesiologists] = useState([]);
    const [staffAvailabilityLoading, setStaffAvailabilityLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [schedulingOp, setSchedulingOp] = useState(null);
    const [selectedTheaterId, setSelectedTheaterId] = useState("");

    const { createOtRequest, loading: creatingRequest } = useIpdRequests();
    
    const [scheduleForm, setScheduleForm] = useState({
        roomId: "",
        surgeonId: "",
        surgeonName: "",
        anesthesiologistId: "",
        anesthesiologistName: "",
        startTime: "",
        endTime: ""
    });

    const [admitForm, setAdmitForm] = useState({
        patientName: "",
        ipdAdmissionId: "",
        procedureName: "",
        surgeonId: "",
        surgeonName: "",
        preferredDate: "",
        complexity: "MEDIUM"
    });

    useEffect(() => {
        fetchRequestedOperations();
        const authorizedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST];
        if (authorizedRoles.includes(user?.role)) {
            fetchActiveOTs();
            fetchAllStaff();
        }
    }, [fetchRequestedOperations, fetchActiveOTs, fetchAllStaff, user?.role]);

    // Fetch available staff when both start and end time are set
    useEffect(() => {
        if (scheduleForm.startTime && scheduleForm.endTime) {
            const fetchStaffByTime = async () => {
                setStaffAvailabilityLoading(true);
                try {
                    const res = await getAvailableStaffByTimeApi(scheduleForm.startTime, scheduleForm.endTime);
                    const data = res.data?.data || res.data;
                    setAvailableSurgeons(data.surgeons || []);
                    setAvailableAnesthesiologists(data.anesthesiologists || []);
                } catch (err) {
                    console.error("Failed to fetch staff availability", err);
                } finally {
                    setStaffAvailabilityLoading(false);
                }
            };
            fetchStaffByTime();
        } else {
            setAvailableSurgeons([]);
            setAvailableAnesthesiologists([]);
        }
    }, [scheduleForm.startTime, scheduleForm.endTime]);

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
            fetchRequestedOperations();
        } else {
            alert(res.message || "Scheduling failed.");
        }
    };

    const handleAdmitSubmit = async (e) => {
        e.preventDefault();
        // Convert numeric fields
        const payload = {
            ...admitForm,
            ipdAdmissionId: parseInt(admitForm.ipdAdmissionId),
            surgeonId: admitForm.surgeonId.toString()
        };
        
        const res = await createOtRequest(payload);
        if (res.success) {
            alert("Patient OT Request Created Successfully");
            setIsAdmitModalOpen(false);
            setAdmitForm({
                patientName: "",
                ipdAdmissionId: "",
                procedureName: "",
                surgeonId: "",
                surgeonName: "",
                preferredDate: "",
                complexity: "MEDIUM"
            });
            fetchRequestedOperations();
        } else {
            alert(res.message || "Request creation failed.");
        }
    };

    const displayOperations = operations.filter(op => {
        return (
            op.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.patientMrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.procedureName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>IPD Surgical Requests</h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Manage pending surgical requests from IPD and finalize scheduling</p>
                </div>
                {(user?.role === ROLES.ADMIN || user?.role === ROLES.RECEPTIONIST) && (
                    <button 
                        onClick={() => setIsAdmitModalOpen(true)}
                        style={{ 
                            padding: "0.75rem 1.5rem", backgroundColor: "#10b981", color: "white", 
                            border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700",
                            display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                    >
                        <i className="fa-solid fa-user-plus"></i> Admit Patient (OT Request)
                    </button>
                )}
            </div>

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
            </div>

            {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading requests...</div>}
            {error && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {!loading && (
                <div className="login-card" style={{ padding: 0, border: "1px solid #e2e8f0", boxShadow: "none", maxWidth: "none" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Patient Profile</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Surgery Details</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Requested For</th>
                                    <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayOperations.length > 0 ? displayOperations.map((op) => (
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
                                            <div style={{ fontSize: "0.75rem", fontWeight: "600" }}>{op.startTime ? new Date(op.startTime).toLocaleString() : "Date Not Specified"}</div>
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                            <button 
                                                onClick={() => handleOpenSchedule(op)}
                                                style={{ padding: "0.4rem 0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}
                                            >
                                                <i className="fa-solid fa-calendar-check"></i> Finalize Schedule
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8" }}>
                                            No pending IPD surgery requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Admit Patient Modal */}
            {isAdmitModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleAdmitSubmit} className="login-card" style={{ maxWidth: "750px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>New OT Admission Request</h2>
                                <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Create a surgical request for a patient from IPD</p>
                            </div>
                            <button type="button" onClick={() => setIsAdmitModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PATIENT NAME</label>
                                <input 
                                    type="text" required
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    value={admitForm.patientName}
                                    onChange={e => setAdmitForm({...admitForm, patientName: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>IPD ADMISSION ID</label>
                                <input 
                                    type="number" required
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    value={admitForm.ipdAdmissionId}
                                    onChange={e => setAdmitForm({...admitForm, ipdAdmissionId: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PROCEDURE NAME</label>
                                <input 
                                    type="text" required
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    value={admitForm.procedureName}
                                    onChange={e => setAdmitForm({...admitForm, procedureName: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PREFERRED DATE</label>
                                <input 
                                    type="datetime-local" required
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} 
                                    value={admitForm.preferredDate}
                                    onChange={e => setAdmitForm({...admitForm, preferredDate: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PRIMARY SURGEON</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={admitForm.surgeonId}
                                    onChange={e => {
                                        const s = staffList.find(x => x.id === parseInt(e.target.value));
                                        setAdmitForm({...admitForm, surgeonId: e.target.value, surgeonName: s?.name || s?.userName || ""});
                                    }}
                                >
                                    <option value="">Select Surgeon</option>
                                    {staffList.filter(s => s.role === "SURGEON" || s.role === "DOCTOR").map(s => (
                                        <option key={s.id} value={s.id}>{s.name || s.userName} ({s.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ gridColumn: "span 1" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>COMPLEXITY</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={admitForm.complexity}
                                    onChange={e => setAdmitForm({...admitForm, complexity: e.target.value})}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button 
                                    type="submit" 
                                    disabled={creatingRequest}
                                    style={{ 
                                        width: "100%", padding: "1rem", backgroundColor: "#10b981", color: "white", 
                                        border: "none", borderRadius: "8px", fontWeight: "800", cursor: creatingRequest ? "not-allowed" : "pointer",
                                        textTransform: "uppercase", letterSpacing: "1px", opacity: creatingRequest ? 0.7 : 1
                                    }}
                                >
                                    {creatingRequest ? "Creating Request..." : "Submit OT Request"}
                                </button>
                            </div>
                        </div>
                    </form>
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
                            <div style={{ gridColumn: selectedTheaterId ? "span 1" : "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ASSIGNED THEATER</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required 
                                    value={selectedTheaterId} 
                                    onChange={handleTheaterChange}
                                >
                                    <option value="">Select Theater Block</option>
                                    {activeOts.map(ot => <option key={ot.id} value={ot.id}>{ot.name}</option>)}
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

                            {staffAvailabilityLoading && (
                                <div style={{ gridColumn: "span 2", textAlign: "center", color: "#64748b", fontSize: "0.8rem", padding: "0.5rem" }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "0.5rem" }}></i>Loading available staff...
                                </div>
                            )}

                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PRIMARY SURGEON {scheduleForm.startTime && scheduleForm.endTime ? "(By Availability)" : ""}</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={scheduleForm.surgeonId}
                                    onChange={e => {
                                        const s = availableSurgeons.find(x => x.id === parseInt(e.target.value)) || staffList.find(x => x.id === parseInt(e.target.value));
                                        setScheduleForm({...scheduleForm, surgeonId: e.target.value, surgeonName: s?.userName || s?.name || s?.staffName || ""});
                                    }}
                                >
                                    <option value="">Select Available Surgeon</option>
                                    {availableSurgeons.length > 0 ? (
                                        availableSurgeons.map(s => (
                                            <option key={s.id} value={s.id} disabled={!s.isAvailable}>
                                                {s.userName} {s.isAvailable ? "✅ Available" : "🔴 Busy"}
                                            </option>
                                        ))
                                    ) : (
                                        staffList.filter(s => s.role === "SURGEON" || s.role === "DOCTOR").map(s => (
                                            <option key={s.id} value={s.id}>{s.name || s.userName} ({s.role})</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ANESTHESIOLOGIST {scheduleForm.startTime && scheduleForm.endTime ? "(By Availability)" : ""}</label>
                                <select 
                                    style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700" }} 
                                    required
                                    value={scheduleForm.anesthesiologistId}
                                    onChange={e => {
                                        const s = availableAnesthesiologists.find(x => x.id === parseInt(e.target.value)) || staffList.find(x => x.id === parseInt(e.target.value));
                                        setScheduleForm({...scheduleForm, anesthesiologistId: e.target.value, anesthesiologistName: s?.userName || s?.name || ""});
                                    }}
                                >
                                    <option value="">Select Specialist</option>
                                    {availableAnesthesiologists.length > 0 ? (
                                        availableAnesthesiologists.map(s => (
                                            <option key={s.id} value={s.id} disabled={!s.isAvailable}>
                                                {s.userName} {s.isAvailable ? "✅ Available" : "🔴 Busy"}
                                            </option>
                                        ))
                                    ) : (
                                        staffList.filter(s => s.role === "ANESTHESIOLOGIST" || s.role === "DOCTOR").map(s => (
                                            <option key={s.id} value={s.id}>{s.name || s.userName} ({s.role})</option>
                                        ))
                                    )}
                                </select>
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

export default IpdRequests;
