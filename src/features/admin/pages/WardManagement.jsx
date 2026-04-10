import { useEffect, useState } from "react";
import { useWard } from "../hooks/useWard";
import WardRoomManagement from "../components/WardRoomManagement";

const WardManagement = () => {
    const { loading, error, wards, fetchAllWards, addWard, editWard, toggleWardStatus } = useWard();
    
    // UI States
    const [view, setView] = useState("WARDS"); // WARDS or ROOMS
    const [activeWard, setActiveWard] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
    const [selectedId, setSelectedId] = useState(null);
    const [filters, setFilters] = useState({ wardType: "", isActive: "" });
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        wardNumber: "",
        wardName: "",
        wardType: "GENERAL",
        totalBeds: ""
    });

    useEffect(() => {
        if (view === "WARDS") {
            fetchAllWards(filters);
        }
    }, [filters, fetchAllWards, view]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    
    const wardTypes = ["GENERAL", "ICU", "HDU", "PRIVATE", "SEMI_PRIVATE", "NICU", "PICU", "RECOVERY"];

    const filteredWards = wards.filter(ward => 
        ward.wardName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ward.wardNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (mode, ward = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && ward) {
            setSelectedId(ward.id);
            setFormData({
                wardNumber: ward.wardNumber || "",
                wardName: ward.wardName || "",
                wardType: ward.wardType || "GENERAL",
                totalBeds: ward.totalBeds || ""
            });
        } else {
            setSelectedId(null);
            setFormData({ wardNumber: "", wardName: "", wardType: "GENERAL", totalBeds: "" });
        }
        setIsModalOpen(true);
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const res = await toggleWardStatus(id, currentStatus);
        if (res.success) {
            alert(`Ward ${currentStatus ? 'Deactivated' : 'Activated'} Successfully`);
            fetchAllWards(filters);
        } else {
            alert(res.message || "Failed to toggle status.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            totalBeds: parseInt(formData.totalBeds)
        };

        let res;
        if (modalMode === "ADD") {
            res = await addWard(dataToSubmit);
        } else {
            res = await editWard(selectedId, dataToSubmit);
        }

        if (res.success) {
            alert(`Ward ${modalMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchAllWards(filters);
        }
    };

    const handleViewRooms = (ward) => {
        setActiveWard(ward);
        setView("ROOMS");
    };

    const handleBackToWards = () => {
        setView("WARDS");
        setActiveWard(null);
    };

    if (view === "ROOMS" && activeWard) {
        return (
            <div style={{ padding: "1.5rem" }}>
                <WardRoomManagement ward={activeWard} onBack={handleBackToWards} />
            </div>
        );
    }

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Ward Management</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>Monitor world-class medical units and clinical beds</p>
                </div>
                <button 
                    onClick={() => openModal("ADD")}
                    style={{
                        padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Initialize Ward
                </button>
            </div>

            {/* Filters Section */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", 
                backgroundColor: "white", padding: "1rem", borderRadius: "8px", 
                border: "1px solid var(--hospital-border)", flexWrap: "wrap", alignItems: "center"
            }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by name or number..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                    value={filters.wardType}
                    onChange={(e) => setFilters({...filters, wardType: e.target.value})}
                >
                    <option value="">All Types</option>
                    {wardTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                    value={filters.isActive}
                    onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>

            {loading && !isModalOpen && <div style={{ textAlign: "center", padding: "3rem" }}>Loading capacity data...</div>}
            {error && !isModalOpen && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {/* Table Display */}
            <div className="login-card" style={{ padding: 0, overflow: "hidden", maxWidth: "none", border: "1px solid var(--hospital-border)", boxShadow: "none" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Ward Unit</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Classification</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Bed Capacity</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>State</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWards.length > 0 ? filteredWards.map((ward) => (
                                <tr key={ward.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontWeight: "700", fontSize: "0.9375rem" }}>{ward.wardName || (ward.wardNumber)}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{ward.wardNumber}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.6rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                                            {ward.wardType}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>Total: {ward.totalBeds}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Occupied: {ward.occupiedBeds || 0} • Available: {ward.availableBeds || ward.totalBeds}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: ward.isActive ? "#10b981" : "#ef4444" }}></div>
                                            <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: ward.isActive ? "#10b981" : "#ef4444" }}>
                                                {ward.isActive ? "ACTIVE" : "DISABLED"}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button 
                                                onClick={() => handleViewRooms(ward)} 
                                                style={{ 
                                                    padding: "0.4rem 0.8rem", 
                                                    backgroundColor: "rgba(30, 64, 175, 0.1)", 
                                                    color: "var(--hospital-blue)", 
                                                    border: "1px solid rgba(30, 64, 175, 0.2)", 
                                                    borderRadius: "4px", cursor: "pointer",
                                                    fontSize: "0.75rem", fontWeight: "700",
                                                    display: "flex", alignItems: "center", gap: "0.3rem"
                                                }} 
                                                title="Manage Ward Rooms"
                                            >
                                                <i className="fa-solid fa-door-open"></i> Rooms
                                            </button>
                                            <button onClick={() => openModal("EDIT", ward)} style={{ padding: "0.4rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }} title="Edit Configuration">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleStatusToggle(ward.id, ward.isActive)}
                                                style={{ 
                                                    padding: "0.4rem 0.8rem", 
                                                    backgroundColor: ward.isActive ? "#fef2f2" : "#f0fdf4", 
                                                    color: ward.isActive ? "#dc2626" : "#16a34a", 
                                                    border: `1px solid ${ward.isActive ? "#fecaca" : "#bbf7d0"}`,
                                                    borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700"
                                                }}
                                            >
                                                {ward.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                        No ward units matching your technical search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Add/Edit Ward */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{modalMode === "ADD" ? "Initialize Ward Unit" : "Update Configuration"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>WARD NAME</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.wardName} onChange={e => setFormData({...formData, wardName: e.target.value})} placeholder="e.g. General Surgical Block" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>WARD NUMBER</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.wardNumber} onChange={e => setFormData({...formData, wardNumber: e.target.value})} placeholder="e.g. W-101" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>CLASSIFICATION</label>
                                    <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.wardType} onChange={e => setFormData({...formData, wardType: e.target.value})}>
                                        {wardTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>TOTAL BEDS</label>
                                    <input type="number" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.totalBeds} onChange={e => setFormData({...formData, totalBeds: e.target.value})} placeholder="20" />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    {modalMode === "ADD" ? "Initialize Clinical Unit" : "Update Specifications"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WardManagement;
