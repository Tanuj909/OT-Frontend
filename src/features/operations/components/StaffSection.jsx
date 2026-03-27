import { useState } from "react";
import { STAFF_GROUPS, SURGEON_GROUPS } from "../constants/monitoringRoles";

const StaffSection = ({ 
    assignedStaff, 
    assignedSurgeons, 
    surgeons, 
    clinicalStaff, 
    onAssignStaff, 
    onAssignSurgeon,
    onUnassignStaff,
    onUnassignSurgeon, 
    loading 
}) => {
    // Surgeon Assignment State
    const [selSurgeonId, setSelSurgeonId] = useState("");
    const [selSurgeonRole, setSelSurgeonRole] = useState("PRIMARY_SURGEON");

    // Clinical Staff Assignment State
    const [selStaffId, setSelStaffId] = useState("");
    const [selStaffRole, setSelStaffRole] = useState("");

    const handleAssignSurgeon = () => {
        if (!selSurgeonId || !selSurgeonRole) return;
        const staff = surgeons.find(s => s.id === parseInt(selSurgeonId));
        if (staff) {
            onAssignSurgeon(selSurgeonId, staff.userName || staff.name, selSurgeonRole);
            setSelSurgeonId("");
        }
    };

    const handleAssignStaff = () => {
        if (!selStaffId || !selStaffRole) return;
        const staff = clinicalStaff.find(s => s.id === parseInt(selStaffId));
        if (staff) {
            onAssignStaff(selStaffId, staff.userName || staff.name, selStaffRole);
            setSelStaffId("");
            setSelStaffRole("");
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <i className="fa-solid fa-user-shield" style={{ color: "var(--hospital-blue)" }}></i> Team Assignment Hub
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Surgeon Assignment */}
                <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "1rem", color: "#334155" }}>
                        <i className="fa-solid fa-user-doctor" style={{ marginRight: "0.5rem", color: "#6366f1" }}></i> SURGEON ASSIGNMENT
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <select 
                            value={selSurgeonId} 
                            onChange={e => setSelSurgeonId(e.target.value)}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700" }}
                        >
                            <option value="">Select Surgeon</option>
                            {surgeons.map(s => (
                                <option key={s.id} value={s.id}>{s.userName || s.name}</option>
                            ))}
                        </select>
                        <select 
                            value={selSurgeonRole} 
                            onChange={e => setSelSurgeonRole(e.target.value)}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700" }}
                        >
                            {SURGEON_GROUPS.map(group => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.roles.map(role => (
                                        <option key={role} value={role}>{role.replace("_", " ")}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <button 
                            onClick={handleAssignSurgeon}
                            disabled={loading || !selSurgeonId}
                            style={{ 
                                padding: "0.75rem", backgroundColor: "#6366f1", color: "white", 
                                border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer",
                                opacity: (loading || !selSurgeonId) ? 0.6 : 1
                            }}
                        >
                            {(loading && selSurgeonId) ? "Assigning..." : "Assign Surgeon"}
                        </button>
                    </div>
                </div>

                {/* Clinical Staff Assignment */}
                <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "1rem", color: "#334155" }}>
                        <i className="fa-solid fa-user-nurse" style={{ marginRight: "0.5rem", color: "#2563eb" }}></i> CLINICAL STAFF
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <select 
                            value={selStaffId} 
                            onChange={e => setSelStaffId(e.target.value)}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700" }}
                        >
                            <option value="">Select Staff</option>
                            {clinicalStaff.map(s => (
                                <option key={s.id} value={s.id}>{s.userName || s.name}</option>
                            ))}
                        </select>
                        <select 
                            value={selStaffRole} 
                            onChange={e => setSelStaffRole(e.target.value)}
                            style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontWeight: "700" }}
                        >
                            <option value="">Select Clinical Role</option>
                            {STAFF_GROUPS.map(group => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.roles.map(role => (
                                        <option key={role} value={role}>{role.replace("_", " ")}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <button 
                            onClick={handleAssignStaff}
                            disabled={loading || !selStaffId || !selStaffRole}
                            style={{ 
                                padding: "0.75rem", backgroundColor: "#2563eb", color: "white", 
                                border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer",
                                opacity: (loading || !selStaffId || !selStaffRole) ? 0.6 : 1
                            }}
                        >
                            {(loading && selStaffId) ? "Assigning..." : "Assign Clinical"}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {/* Display Surgeons */}
                {assignedSurgeons.map((staff, idx) => (
                    <div key={`surgeon-${idx}`} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #e0e7ff", backgroundColor: "#f5f7ff", display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "20px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #c7d2fe" }}>
                            <i className="fa-solid fa-user-doctor" style={{ color: "#6366f1" }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "800", color: "#1e1b4b" }}>{staff.surgeonName || staff.staffName}</div>
                            <div style={{ fontSize: "0.7rem", color: "#6366f1", fontWeight: "700" }}>{staff.role?.replace("_", " ")}</div>
                        </div>
                        <button 
                            onClick={() => onUnassignSurgeon(staff.surgeonId)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}
                        >
                            <i className="fa-solid fa-user-minus"></i>
                        </button>
                    </div>
                ))}

                {/* Display Staff */}
                {assignedStaff.map((staff, idx) => (
                    <div key={`staff-${idx}`} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #f1f5f9", backgroundColor: "#f8fafc", display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "20px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                            <i className="fa-solid fa-user-nurse" style={{ color: "var(--hospital-blue)" }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "800", color: "#0f172a" }}>{staff.staffName}</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--hospital-blue)", fontWeight: "700" }}>{staff.role?.replace("_", " ")}</div>
                        </div>
                        <button 
                            onClick={() => onUnassignStaff(staff.staffId)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}
                        >
                            <i className="fa-solid fa-user-minus"></i>
                        </button>
                    </div>
                ))}

                {(assignedStaff.length === 0 && assignedSurgeons.length === 0) && (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                        <i className="fa-solid fa-user-slash" style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}></i>
                        No clinical team assigned yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffSection;
