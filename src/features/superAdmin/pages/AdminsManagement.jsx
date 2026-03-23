import { useEffect, useState } from "react";
import { useSuperAdmin } from "../hooks/useSuperAdmin";

const AdminsManagement = () => {
    const { 
        loading, error, admins, hospitals, 
        fetchAdmins, fetchHospitals, addAdmin, mapAdminToHospital, updateAdminMapping 
    } = useSuperAdmin();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [selectedHospitalId, setSelectedHospitalId] = useState("");

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        fetchAdmins();
        fetchHospitals();
    }, [fetchAdmins, fetchHospitals]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const res = await addAdmin({
            userName: formData.userName,
            email: formData.email,
            password: formData.password
        });
        if (res.success) {
            setIsCreateModalOpen(false);
            setFormData({ userName: "", email: "", password: "" });
        }
    };

    const handleMapSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAdmin || !selectedHospitalId) return;

        let res;
        if (selectedAdmin.hospital) {
            res = await updateAdminMapping(selectedHospitalId, selectedAdmin.id);
        } else {
            res = await mapAdminToHospital(selectedHospitalId, selectedAdmin.id);
        }

        if (res.success) {
            setIsMapModalOpen(false);
            setSelectedAdmin(null);
            setSelectedHospitalId("");
            fetchAdmins(); // Refresh to see updated mapping
        }
    };

    const openMapModal = (admin) => {
        setSelectedAdmin(admin);
        setSelectedHospitalId(admin.hospital?.id || "");
        setIsMapModalOpen(true);
    };

    return (
        <div className="page-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="text-2xl font-bold">Administrator Management</h1>
                    <p className="text-hospital-text-secondary">Direct authority over system administrators and hospital mapping</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "var(--hospital-blue)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-user-plus font-bold"></i> Create Admin
                </button>
            </div>

            {loading && !isCreateModalOpen && !isMapModalOpen && <p>Loading administrators...</p>}
            {error && !isCreateModalOpen && !isMapModalOpen && <div style={{ color: "red", backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>{error}</div>}

            <div className="login-card" style={{ maxWidth: "100%", padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Admin Identity</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Role</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Assigned Hospital</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Account Status</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.length > 0 ? admins.map((admin) => (
                            <tr key={admin.id} 
                                style={{ borderBottom: "1px solid var(--hospital-border)", transition: "background-color 0.2s" }} 
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fdfdfd"} 
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", backgroundColor: "white", border: "1px solid var(--hospital-border)", color: "var(--hospital-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                                            {admin.userName?.charAt(0) || admin.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{admin.userName || admin.name}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>{admin.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", backgroundColor: "#f1f5f9", padding: "0.25rem 0.625rem", borderRadius: "0.375rem" }}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    {admin.hospital ? (
                                        <div>
                                            <p className="text-sm font-semibold text-hospital-blue">{admin.hospital.name}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>{admin.hospital.city}</p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-hospital-text-secondary font-medium">No Hospital Assigned</span>
                                    )}
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", backgroundColor: admin.active ? "#10b981" : "#ef4444" }}></div>
                                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: admin.active ? "#10b981" : "#ef4444" }}>
                                            {admin.active ? "Active" : "Locked"}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                    <button 
                                        onClick={() => openMapModal(admin)}
                                        style={{
                                            padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: "600", borderRadius: "0.5rem",
                                            border: "1px solid var(--hospital-border)", backgroundColor: "white", cursor: "pointer", transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--hospital-blue)"; e.currentTarget.style.color = "var(--hospital-blue)"; }}
                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--hospital-border)"; e.currentTarget.style.color = "inherit"; }}
                                    >
                                        <i className="fa-solid fa-link mr-1"></i> {admin.hospital ? "Update Mapping" : "Assign Hospital"}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    No Administrators found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Create Admin */}
            {isCreateModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "450px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">Register New Admin</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Login Username</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="e.g. Rahul Sharma" required
                                    value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Email Address</label>
                                <input 
                                    type="email" className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="rahul@example.com" required
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Secure Password</label>
                                <input 
                                    type="password" className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="••••••••" required
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                style={{
                                    width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                }}
                            >
                                Create Admin Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Map Admin to Hospital */}
            {isMapModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "450px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">Hospital Assignment</h2>
                            <button onClick={() => setIsMapModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--hospital-blue)" }}>
                                {selectedAdmin?.userName?.charAt(0) || selectedAdmin?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{selectedAdmin?.userName || selectedAdmin?.name}</p>
                                <p className="text-xs text-hospital-text-secondary">{selectedAdmin?.email}</p>
                            </div>
                        </div>
                        <form onSubmit={handleMapSubmit}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Select Primary Hospital</label>
                                <select 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem", appearance: "auto" }}
                                    required value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)}
                                >
                                    <option value="">Choose a hospital...</option>
                                    {hospitals.map(h => (
                                        <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                style={{
                                    width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                }}
                            >
                                {selectedAdmin?.hospital ? "Update Assignment" : "Confirm Assignment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminsManagement;
