import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStaffAvailability } from "../hooks/useStaffAvailability";
import { useStaff } from "../hooks/useStaff";

const AVAILABILITY_STATUS = [
    { value: "AVAILABLE", label: "Available for Surgery", color: "#16a34a", bg: "#f0fdf4" },
    { value: "UNAVAILABLE", label: "Not Available", color: "#64748b", bg: "#f1f5f9" },
    { value: "EXTRA_SHIFT", label: "Extra Shift", color: "#2563eb", bg: "#eff6ff" },
    { value: "ON_LEAVE", label: "On Leave", color: "#ea580c", bg: "#fff7ed" },
    { value: "SICK_LEAVE", label: "Sick Leave", color: "#dc2626", bg: "#fef2f2" },
    { value: "HOLIDAY", label: "Public Holiday", color: "#7c3aed", bg: "#f5f3ff" }
];

const StaffAvailabilityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { 
        loading: availabilityLoading, 
        error: availabilityError, 
        availabilities, 
        fetchAvailabilities, 
        addAvailability, 
        removeAvailability 
    } = useStaffAvailability();

    const { selectedStaff, fetchStaffById } = useStaff();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States (Initial values for today)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "17:00",
        status: "AVAILABLE"
    });

    const initData = useCallback(async () => {
        await fetchStaffById(id);
        await fetchAvailabilities(id);
    }, [id, fetchStaffById, fetchAvailabilities]);

    useEffect(() => {
        if (id) {
            initData();
        }
    }, [id, initData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await addAvailability({
            staffId: parseInt(id),
            ...formData
        });

        if (res.success) {
            alert(`Availability recorded successfully`);
            setIsModalOpen(false);
            fetchAvailabilities(id);
        } else {
            alert(res.message || "Failed to record availability.");
        }
    };

    const handleDelete = async (recordId) => {
        if (window.confirm("Delete this availability/leave record?")) {
            const res = await removeAvailability(recordId);
            if (res.success) fetchAvailabilities(id);
        }
    };

    const getStatusConfig = (status) => {
        return AVAILABILITY_STATUS.find(s => s.value === status) || AVAILABILITY_STATUS[1];
    };

    if (availabilityLoading && !availabilities.length) {
        return <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Auditing staffing schedules...</div>;
    }

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Staff Availability & Leaves</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>
                        Manage date-specific exceptions for {selectedStaff?.name || `Staff #${id}`}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => navigate("/staff-management")}
                        style={{ padding: "0.75rem 1.2rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.875rem", color: "#64748b" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Staff Registry
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                            border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "0.5rem"
                        }}
                    >
                        <i className="fa-solid fa-plus"></i> Record Exception
                    </button>
                </div>
            </div>

            {availabilityError && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{availabilityError}</div>}

            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Scheduled Date</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Time Slot</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Availability Status</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {availabilities.slice().reverse().map((a) => {
                            const config = getStatusConfig(a.status);
                            return (
                                <tr key={a.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <i className="fa-regular fa-calendar-check" style={{ color: "var(--hospital-blue)" }}></i>
                                            <span style={{ fontWeight: "700", color: "#0f172a" }}>{new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "#475569" }}>{a.startTime} — {a.endTime}</span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{ 
                                            padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800",
                                            color: config.color, backgroundColor: config.bg, border: `1px solid ${config.color}33`
                                        }}>
                                            {config.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                        <button onClick={() => handleDelete(a.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fff", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                            <i className="fa-solid fa-trash-can"></i> Remove
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {availabilities.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: "2rem", color: "#e2e8f0", marginBottom: "1rem", display: "block" }}></i>
                                    No availability exceptions found. System will fallback to standard weekly schedule.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", width: "100%", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Record Shift Exception</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>EXCEPTION DATE</label>
                                <input type="date" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>

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

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>AVAILABILITY STATUS</label>
                                <select style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px", backgroundColor: "#fff" }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    {AVAILABILITY_STATUS.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.9rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Confirm Exception
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StaffAvailabilityPage;
