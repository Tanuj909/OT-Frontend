import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaff } from "../hooks/useStaff";
import { ROLES } from "../../../shared/constants/roles";

const StaffManagement = () => {
    const navigate = useNavigate();
    const { 
        loading, 
        error, 
        staffList, 
        fetchAllStaff, 
        createStaff, 
        updateStaff, 
        toggleStaffStatus 
    } = useStaff();

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedRole, setSelectedRole] = useState("");

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "DOCTOR"
    });

    useEffect(() => {
        fetchAllStaff();
    }, [fetchAllStaff]);

    const displayStaff = staffList.filter(staff => {
        const matchesSearch = searchTerm.trim() === "" || 
            staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole === "" || staff.role === selectedRole;
        
        return matchesSearch && matchesRole;
    });

    const openModal = (mode, staff = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && staff) {
            setSelectedId(staff.id);
            setFormData({
                name: staff.name || "",
                email: staff.email || "",
                role: staff.role || "DOCTOR",
                password: "" // Do not pre-fill password for updates
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "DOCTOR"
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        
        if (modalMode === "ADD") {
            res = await createStaff(formData);
        } else {
            // Remove password from update data if empty
            const { password, ...updateData } = formData;
            const dataToSubmit = password ? formData : updateData;
            res = await updateStaff(selectedId, dataToSubmit);
        }

        if (res.success) {
            alert(`Staff ${modalMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchAllStaff();
        } else {
            alert(res.message || "Failed to process record.");
        }
    };

    const handleStatusToggle = async (id, status) => {
        const res = await toggleStaffStatus(id, status);
        if (res.success) fetchAllStaff();
    };

    const getRoleBadgeStyle = (role) => {
        switch(role) {
            case ROLES.ADMIN: return { backgroundColor: "#fef3c7", color: "#92400e" };
            case ROLES.DOCTOR: return { backgroundColor: "#dcfce7", color: "#166534" };
            case ROLES.SURGEON: return { backgroundColor: "#dbeafe", color: "#1e40af" };
            case ROLES.NURSE: return { backgroundColor: "#f3e8ff", color: "#6b21a8" };
            case ROLES.RECEPTIONIST: return { backgroundColor: "#e0f2fe", color: "#075985" };
            default: return { backgroundColor: "#f1f5f9", color: "#475569" };
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Hospital Staff Management</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>Manage clinical team, physicians, and administrators</p>
                </div>
                <button 
                    onClick={() => openModal("ADD")}
                    style={{
                        padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Add New Staff
                </button>
            </div>

            {/* Filter Section */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", 
                backgroundColor: "white", padding: "1rem", borderRadius: "8px", 
                border: "1px solid var(--hospital-border)", flexWrap: "wrap", alignItems: "center"
            }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="">All Roles</option>
                    {Object.values(ROLES).filter(r => r !== ROLES.SUPER_ADMIN).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            {loading && !isModalOpen && <div style={{ textAlign: "center", padding: "3rem" }}>Fetching staff registry...</div>}
            {error && !isModalOpen && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {/* Staff Table */}
            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Staff Identity</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Email Contact</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Professional Role</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Current Status</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayStaff.length > 0 ? displayStaff.map((staff) => (
                            <tr key={staff.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--hospital-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.8rem" }}>
                                            {staff.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ fontWeight: "700", color: "var(--hospital-text-primary)" }}>{staff.name}</div>
                                    </div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem", color: "#64748b", fontSize: "0.875rem" }}>{staff.email}</td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ 
                                        padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "800",
                                        ...getRoleBadgeStyle(staff.role)
                                    }}>
                                        {staff.role}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ 
                                        fontSize: "0.75rem", fontWeight: "700", 
                                        color: staff.active ? "#10b981" : "#ef4444",
                                        backgroundColor: staff.active ? "#f0fdf4" : "#fef2f2",
                                        padding: "0.25rem 0.5rem", borderRadius: "4px"
                                    }}>
                                        {staff.active ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={() => navigate(`/staff-schedule/${staff.id}`)}
                                            style={{ padding: "0.4rem 0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }} 
                                            title="Duty Schedule"
                                        >
                                            <i className="fa-regular fa-clock"></i> Duty
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/staff-availability/${staff.id}`)}
                                            style={{ padding: "0.4rem 0.8rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }} 
                                            title="Manage Availability & Leaves"
                                        >
                                            <i className="fa-regular fa-calendar-check"></i> Availability
                                        </button>
                                        <button onClick={() => openModal("EDIT", staff)} style={{ padding: "0.4rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }} title="Edit Records">
                                            <i className="fa-solid fa-user-pen"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleStatusToggle(staff.id, staff.active)}
                                            style={{ 
                                                padding: "0.4rem 0.8rem", 
                                                backgroundColor: staff.active ? "#fef2f2" : "#f0fdf4", 
                                                color: staff.active ? "#dc2626" : "#16a34a", 
                                                border: `1px solid ${staff.active ? "#fecaca" : "#bbf7d0"}`,
                                                borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700"
                                            }}
                                        >
                                            {staff.active ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    No staff members found in the hospital registry.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal - Matched with Catalog UI patterns */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", width: "100%", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{modalMode === "ADD" ? "Register Staff Member" : "Update Credentials"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>FULL NAME</label>
                                <input style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. Amit Sharma" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>EMAIL ADDRESS</label>
                                <input type="email" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="amit.sharma@hospital.com" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>RE-SET PASSWORD {modalMode === "EDIT" && "(Leave blank to keep current)"}</label>
                                <input type="password" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required={modalMode === "ADD"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ASSIGN ROLE</label>
                                <select style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    {Object.values(ROLES).filter(r => r !== ROLES.SUPER_ADMIN).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    {modalMode === "ADD" ? "Initialize Staff Record" : "Save Updated Records"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
