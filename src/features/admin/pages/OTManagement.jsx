import { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";

const OTManagement = () => {
    const { 
        loading, error, ots, 
        fetchOTs, addOT, editOT, removeOT 
    } = useAdmin();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        theaterNumber: "",
        name: "",
        location: "",
        building: "",
        floor: "",
        type: "CARDIAC"
    });

    const [editingOTId, setEditingOTId] = useState(null);

    useEffect(() => {
        fetchOTs();
    }, [fetchOTs]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const res = await addOT(formData);
        if (res.success) {
            setIsAddModalOpen(false);
            resetForm();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const res = await editOT(editingOTId, formData);
        if (res.success) {
            setIsEditModalOpen(false);
            resetForm();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this theater?")) {
            await removeOT(id);
        }
    };

    const openEditModal = (ot) => {
        setEditingOTId(ot.id);
        setFormData({
            theaterNumber: ot.theaterNumber || "",
            name: ot.name || "",
            location: ot.location || "",
            building: ot.building || "",
            floor: ot.floor || "",
            type: ot.type || "CARDIAC"
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ theaterNumber: "", name: "", location: "", building: "", floor: "", type: "CARDIAC" });
        setEditingOTId(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ACTIVE": return "#10b981";
            case "IN_USE": return "#3b82f6";
            case "MAINTENANCE": return "#f59e0b";
            default: return "#ef4444";
        }
    };

    return (
        <div className="page-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="text-2xl font-bold">Operation Theater Management</h1>
                    <p className="text-hospital-text-secondary">Comprehensive list of hospital surgical units</p>
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
                    <i className="fa-solid fa-plus font-bold"></i> Add New OT
                </button>
            </div>

            {loading && !isAddModalOpen && !isEditModalOpen && <p>Loading theathers...</p>}
            {error && !isAddModalOpen && !isEditModalOpen && <div style={{ color: "red", backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>{error}</div>}

            <div className="login-card" style={{ maxWidth: "100%", padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Theater Info</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Type</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Location</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ots.length > 0 ? ots.map((ot) => (
                            <tr key={ot.id} style={{ borderBottom: "1px solid var(--hospital-border)", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fdfdfd"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", backgroundColor: "#eff6ff", color: "var(--hospital-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <i className="fa-solid fa-bed-pulse"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{ot.name}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{ot.theaterNumber}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <span style={{ padding: "0.25rem 0.625rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: "600", backgroundColor: "#f1f5f9", color: "#475569" }}>
                                        {ot.type}
                                    </span>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <p className="text-sm font-medium">{ot.building}</p>
                                    <p style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>{ot.location} • Floor {ot.floor}</p>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: getStatusColor(ot.status) }}></div>
                                        <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: getStatusColor(ot.status) }}>{ot.status}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={() => openEditModal(ot)}
                                            style={{
                                                padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--hospital-border)",
                                                backgroundColor: "white", color: "var(--hospital-text-secondary)", cursor: "pointer"
                                            }}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(ot.id)}
                                            style={{
                                                padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid var(--hospital-border)",
                                                backgroundColor: "white", color: "#ef4444", cursor: "pointer"
                                            }}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    No Operation Theaters found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Add OT */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "500px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">New Operation Theater</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "span 1" }}>
                                <label className="text-sm font-medium mb-1 block">Theater Number</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="OT-CARD-01" required
                                    value={formData.theaterNumber} onChange={(e) => setFormData({...formData, theaterNumber: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 1" }}>
                                <label className="text-sm font-medium mb-1 block">Type</label>
                                <select 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem", appearance: "auto" }}
                                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="CARDIAC">CARDIAC</option>
                                    <option value="NEURO">NEURO</option>
                                    <option value="GENERAL">GENERAL</option>
                                    <option value="ORTHOPEDIC">ORTHOPEDIC</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label className="text-sm font-medium mb-1 block">Theater Name</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="Cardiac Operation Theater" required
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label className="text-sm font-medium mb-1 block">Building</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="Main Building" required
                                    value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Floor</label>
                                <input 
                                    type="number" className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="2" required
                                    value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Location / Block</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    placeholder="Block A" required
                                    value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button 
                                    type="submit" 
                                    style={{
                                        width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                        color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                    }}
                                >
                                    Initialize Theater
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit OT */}
            {isEditModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="login-card" style={{ maxWidth: "500px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 className="text-xl font-bold">Edit Operation Theater</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "span 1" }}>
                                <label className="text-sm font-medium mb-1 block">Theater Number</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.theaterNumber} onChange={(e) => setFormData({...formData, theaterNumber: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 1" }}>
                                <label className="text-sm font-medium mb-1 block">Type</label>
                                <select 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem", appearance: "auto" }}
                                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="CARDIAC">CARDIAC</option>
                                    <option value="NEURO">NEURO</option>
                                    <option value="GENERAL">GENERAL</option>
                                    <option value="ORTHOPEDIC">ORTHOPEDIC</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label className="text-sm font-medium mb-1 block">Theater Name</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label className="text-sm font-medium mb-1 block">Building</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Floor</label>
                                <input 
                                    type="number" className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Location / Block</label>
                                <input 
                                    className="search-input" style={{ width: "100%", paddingLeft: "1rem" }}
                                    required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button 
                                    type="submit" 
                                    style={{
                                        width: "100%", padding: "0.75rem", backgroundColor: "var(--hospital-blue)", 
                                        color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer"
                                    }}
                                >
                                    Update Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OTManagement;
