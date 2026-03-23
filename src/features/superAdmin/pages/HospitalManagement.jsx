import { useEffect, useState } from "react";
import { useSuperAdmin } from "../hooks/useSuperAdmin";

const HospitalManagement = () => {
    const { 
        loading, error, hospitals, selectedHospital, hospitalAdmins,
        fetchHospitals, fetchHospitalById, addHospital, editHospital, fetchAdminsByHospital 
    } = useSuperAdmin();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        active: true
    });

    const [editingHospitalId, setEditingHospitalId] = useState(null);

    useEffect(() => {
        fetchHospitals();
    }, [fetchHospitals]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const res = await addHospital(formData);
        if (res.success) {
            setIsAddModalOpen(false);
            resetForm();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const res = await editHospital(editingHospitalId, formData);
        if (res.success) {
            setIsEditModalOpen(false);
            resetForm();
        }
    };

    const openEditModal = (e, hospital) => {
        e.stopPropagation(); // Avoid opening details modal
        setEditingHospitalId(hospital.id);
        setFormData({
            name: hospital.name || "",
            address: hospital.address || "",
            city: hospital.city || "",
            active: hospital.active ?? true
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: "", address: "", city: "", active: true });
        setEditingHospitalId(null);
    };

    const handleViewDetails = async (id) => {
        await fetchHospitalById(id);
        await fetchAdminsByHospital(id);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="page-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="text-2xl font-bold">Hospital Management</h1>
                    <p className="text-hospital-text-secondary">Comprehensive registry of hospital entities</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
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
                    <i className="fa-solid fa-plus font-bold"></i> Add Hospital
                </button>
            </div>

            {loading && !isAddModalOpen && !isEditModalOpen && !isDetailsModalOpen && <p>Loading hospitals...</p>}
            {error && !isAddModalOpen && !isEditModalOpen && !isDetailsModalOpen && <div style={{ color: "red", backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>{error}</div>}

            <div className="login-card" style={{ maxWidth: "100%", padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Hospital Entity</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Location</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hospitals.length > 0 ? hospitals.map((hospital) => (
                            <tr key={hospital.id} 
                                onClick={() => handleViewDetails(hospital.id)}
                                style={{ borderBottom: "1px solid var(--hospital-border)", cursor: "pointer", transition: "background-color 0.2s" }} 
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fdfdfd"} 
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: "#eff6ff", color: "var(--hospital-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <i className="fa-solid fa-hospital"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{hospital.name}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>ID: #{hospital.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <p className="text-sm font-medium">{hospital.city || "N/A"}</p>
                                    <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>{hospital.address || "N/A"}</p>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", borderRadius: "9999px", backgroundColor: hospital.active ? "#dcfce7" : "#fee2e2", color: hospital.active ? "#15803d" : "#ef4444", fontSize: "0.75rem", fontWeight: "600" }}>
                                        <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "9999px", backgroundColor: hospital.active ? "#15803d" : "#ef4444" }}></div>
                                        {hospital.active ? "Active" : "Disabled"}
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={(e) => openEditModal(e, hospital)}
                                            style={{
                                                padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--hospital-border)",
                                                backgroundColor: "white", color: "var(--hospital-text-secondary)", cursor: "pointer"
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button 
                                            className="nav-link"
                                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", fontWeight: "600" }}
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(hospital.id); }}
                                        >
                                            Admins
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    No Hospital Entities found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Add Hospital */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "450px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">Register New Hospital</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Hospital Name</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="e.g. Apollo Hospital"
                                    required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>City</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="e.g. Noida"
                                    required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Address</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="e.g. Sector 62, Near Metro Station"
                                    required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                style={{
                                    width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                }}
                            >
                                Register Entity
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Hospital */}
            {isEditModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "450px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">Edit Hospital Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Hospital Name</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>City</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <label className="text-sm font-medium" style={{ display: "block", marginBottom: "0.4rem" }}>Address</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <input 
                                    type="checkbox" id="active"
                                    checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                />
                                <label htmlFor="active" className="text-sm font-medium">Mark as Active</label>
                            </div>
                            <button 
                                type="submit" 
                                style={{
                                    width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                }}
                            >
                                Update Information
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Hospital Details & Admins (Z-Index increased to sit on top) */}
            {isDetailsModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1010 }}>
                    <div className="login-card" style={{ maxWidth: "600px", padding: 0, overflow: "hidden" }}>
                        <div style={{ padding: "1.5rem", backgroundColor: "var(--hospital-bg)", borderBottom: "1px solid var(--hospital-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "white", borderRadius: "1rem", color: "var(--hospital-blue)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-soft)" }}>
                                    <i className="fa-solid fa-hospital text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedHospital?.name}</h2>
                                    <p className="text-hospital-text-secondary text-sm">{selectedHospital?.city ? `${selectedHospital.city}, ${selectedHospital.address}` : selectedHospital?.address}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} style={{ background: "white", border: "none", cursor: "pointer", fontSize: "1rem", width: "2rem", height: "2rem", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-soft)" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-hospital-text-secondary">Assigned Administrators ({hospitalAdmins.length})</h3>
                                <div style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", backgroundColor: selectedHospital?.active ? "#dcfce7" : "#fee2e2", color: selectedHospital?.active ? "#15803d" : "#ef4444", fontWeight: "600" }}>
                                    {selectedHospital?.active ? "Active" : "Disabled"}
                                </div>
                            </div>

                            {loading ? (
                                <p style={{ textAlign: "center", padding: "2rem" }}>Loading admins...</p>
                            ) : hospitalAdmins.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }}>
                                    {hospitalAdmins.map(admin => (
                                        <div key={admin.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", border: "1px solid var(--hospital-border)", borderRadius: "0.75rem", backgroundColor: "#f8fafc" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "9999px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--hospital-blue)", border: "1px solid var(--hospital-border)" }}>
                                                    {admin.userName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{admin.userName || admin.name}</p>
                                                    <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>{admin.email}</p>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-user-check text-hospital-green"></i>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "3rem 1.5rem", border: "1px dashed var(--hospital-border)", borderRadius: "1rem" }}>
                                    <i className="fa-solid fa-user-slash text-3xl text-hospital-text-secondary" style={{ marginBottom: "1rem", display: "block" }}></i>
                                    <p className="text-hospital-text-secondary text-sm">No administrators assigned to this hospital yet.</p>
                                </div>
                            )}

                            <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--hospital-border)", display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <p className="text-xs text-hospital-text-secondary uppercase font-bold" style={{ marginBottom: "0.5rem" }}>Entity Details</p>
                                    <p className="text-sm"><i className="fa-solid fa-id-badge mr-2 text-hospital-text-secondary"></i> ID: {selectedHospital?.id}</p>
                                    <p className="text-sm"><i className="fa-solid fa-city mr-2 text-hospital-text-secondary" style={{ marginTop: "0.5rem", display: "inline-block" }}></i> City: {selectedHospital?.city || "N/A"}</p>
                                </div>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="nav-link" style={{ alignSelf: "flex-end", padding: "0.75rem 1.25rem", backgroundColor: "var(--hospital-blue)", color: "white" }}>
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalManagement;
