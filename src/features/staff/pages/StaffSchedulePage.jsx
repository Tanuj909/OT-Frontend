import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffSchedule } from "../hooks/useStaffSchedule";
import { useStaff } from "../hooks/useStaff";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const StaffSchedulePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { 
        loading: scheduleLoading, 
        error: scheduleError, 
        schedules, 
        fetchSchedules, 
        addSchedule, 
        editSchedule, 
        removeSchedule 
    } = useStaffSchedule();

    const { selectedStaff, fetchStaffById } = useStaff();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
    const [editId, setEditId] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        days: [], // For Bulk Creation
        dayOfWeek: "", // For Singular Update
        startTime: "09:00",
        endTime: "17:00"
    });

    const initData = useCallback(async () => {
        await fetchStaffById(id);
        await fetchSchedules(id);
    }, [id, fetchStaffById, fetchSchedules]);

    useEffect(() => {
        if (id) {
            initData();
        }
    }, [id, initData]);

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day) 
                ? prev.days.filter(d => d !== day) 
                : [...prev.days, day]
        }));
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && item) {
            setEditId(item.id);
            setFormData({
                days: [],
                dayOfWeek: item.dayOfWeek,
                startTime: item.startTime,
                endTime: item.endTime
            });
        } else {
            setEditId(null);
            setFormData({
                days: [],
                dayOfWeek: "",
                startTime: "09:00",
                endTime: "17:00"
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        
        if (modalMode === "ADD") {
            if (formData.days.length === 0) {
                alert("Please select at least one day.");
                return;
            }
            res = await addSchedule({
                staffId: parseInt(id),
                days: formData.days,
                startTime: formData.startTime,
                endTime: formData.endTime
            });
        } else {
            res = await editSchedule(editId, {
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime
            });
        }

        if (res.success) {
            alert(`Schedule ${modalMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchSchedules(id);
        } else {
            alert(res.message || "Failed to process schedule.");
        }
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm("Are you sure you want to remove this schedule slot?")) {
            const res = await removeSchedule(scheduleId);
            if (res.success) fetchSchedules(id);
        }
    };

    if (scheduleLoading && !schedules.length) {
        return <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading staff availability...</div>;
    }

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Weekly Staff Schedule</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>
                        Assign duty hours for {selectedStaff?.name || `Staff #${id}`}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => navigate("/staff-management")}
                        style={{ padding: "0.75rem 1.2rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.875rem", color: "#64748b" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Staff
                    </button>
                    <button 
                        onClick={() => openModal("ADD")}
                        style={{
                            padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                            border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "0.5rem"
                        }}
                    >
                        <i className="fa-solid fa-calendar-plus"></i> Add Duty Slot
                    </button>
                </div>
            </div>

            {scheduleError && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{scheduleError}</div>}

            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Day of Week</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Duty Starts</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Duty Ends</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length > 0 ? schedules.map((s) => (
                            <tr key={s.scheduleId} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ fontWeight: "700", color: "#0f172a" }}>{s.dayOfWeek}</span>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <i className="fa-regular fa-clock" style={{ color: "#16a34a" }}></i>
                                        <span style={{ fontWeight: "600" }}>{s.startTime}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <i className="fa-solid fa-clock-rotate-left" style={{ color: "#dc2626" }}></i>
                                        <span style={{ fontWeight: "600" }}>{s.endTime}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button onClick={() => openModal("EDIT", s)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                            <i className="fa-solid fa-pen"></i> Edit
                                        </button>
                                        <button onClick={() => handleDelete(s.scheduleId)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fff", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    <i className="fa-solid fa-calendar-day" style={{ fontSize: "2rem", color: "#e2e8f0", marginBottom: "1rem", display: "block" }}></i>
                                    No duty hours assigned for this staff member yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{modalMode === "ADD" ? "Configure Duty Hours" : "Modify Shift Timing"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {modalMode === "ADD" ? (
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.6rem" }}>SELECT WORKING DAYS</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                        {DAYS_OF_WEEK.map(day => (
                                            <button 
                                                key={day}
                                                type="button"
                                                onClick={() => handleDayToggle(day)}
                                                style={{ 
                                                    padding: "0.4rem 0.75rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800",
                                                    border: formData.days.includes(day) ? "1px solid var(--hospital-blue)" : "1px solid #cbd5e1",
                                                    backgroundColor: formData.days.includes(day) ? "var(--hospital-blue)" : "#fff",
                                                    color: formData.days.includes(day) ? "#fff" : "#64748b",
                                                    cursor: "pointer", transition: "all 0.2s"
                                                }}
                                            >
                                                {day.charAt(0) + day.slice(1, 3).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>DAY OF WEEK</label>
                                    <input style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#f8fafc" }} readOnly value={formData.dayOfWeek} />
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>START TIME</label>
                                    <input type="time" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>END TIME</label>
                                    <input type="time" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    {modalMode === "ADD" ? "Confirm Duty Shift" : "Update Shift Record"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StaffSchedulePage;
