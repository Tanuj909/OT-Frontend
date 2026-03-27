import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOtRoom } from "../hooks/useOtroom";
import { useOtFeature } from "../hooks/useOtFeature";

const AllRooms = () => {
    const { loading: roomsLoading, error: roomsError, rooms, fetchAllRooms } = useOtRoom();
    const { 
        loading: featuresLoading, 
        error: featuresError, 
        features, 
        fetchAllFeatures, 
        addFeature, 
        editFeature, 
        removeFeature, 
        toggleFeatureStatus,
        bulkAddFeatures
    } = useOtFeature();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("ROOMS"); // ROOMS, FEATURES
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE
    
    // Feature Modal State
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [featureForm, setFeatureForm] = useState({ name: "" });
    const [bulkFeatures, setBulkFeatures] = useState([{ name: "" }]);

    useEffect(() => {
        if (activeTab === "ROOMS") {
            fetchAllRooms();
        } else {
            fetchAllFeatures();
        }
    }, [activeTab, fetchAllRooms, fetchAllFeatures]);

    const filteredRooms = rooms.filter(room => 
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFeatures = features.filter(feature => {
        const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || 
                             (statusFilter === "ACTIVE" && feature.isActive) || 
                             (statusFilter === "INACTIVE" && !feature.isActive);
        return matchesSearch && matchesStatus;
    });

    const getRoomStatusStyle = (status) => {
        switch(status) {
            case 'AVAILABLE': return { bg: '#f0fdf4', color: '#16a34a' };
            case 'OCCUPIED': return { bg: '#fef2f2', color: '#dc2626' };
            case 'MAINTENANCE': return { bg: '#fff7ed', color: '#ea580c' };
            default: return { bg: '#f8fafc', color: '#64748b' };
        }
    };

    const handleFeatureSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (isBulkMode) {
            const validFeatures = bulkFeatures.filter(f => f.name.trim() !== "");
            if (validFeatures.length === 0) return alert("Please add at least one feature name");
            res = await bulkAddFeatures(validFeatures);
        } else if (currentFeature) {
            res = await editFeature(currentFeature.id, featureForm);
        } else {
            res = await addFeature(featureForm);
        }

        if (res.success) {
            setIsFeatureModalOpen(false);
            setFeatureForm({ name: "" });
            setBulkFeatures([{ name: "" }]);
            setCurrentFeature(null);
            fetchAllFeatures();
        } else {
            alert(res.message || "Operation failed");
        }
    };

    const handleAddBulkRow = () => {
        setBulkFeatures([...bulkFeatures, { name: "" }]);
    };

    const handleRemoveBulkRow = (index) => {
        if (bulkFeatures.length > 1) {
            const newList = [...bulkFeatures];
            newList.splice(index, 1);
            setBulkFeatures(newList);
        }
    };

    const handleBulkInputChange = (index, value) => {
        const newList = [...bulkFeatures];
        newList[index].name = value;
        setBulkFeatures(newList);
    };

    const handleToggleStatus = async (id) => {
        const res = await toggleFeatureStatus(id);
        if (res.success) fetchAllFeatures();
    };

    const handleDeleteFeature = async (id) => {
        if (window.confirm("Are you sure you want to delete this feature?")) {
            const res = await removeFeature(id);
            if (res.success) fetchAllFeatures();
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section with Tabs */}
            <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0f172a", marginBottom: "0.25rem" }}>Facility Infrastructure</h1>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "500" }}>Manage Operating Theater rooms and technical feature classifications</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {activeTab === "FEATURES" && (
                            <div style={{ position: "relative" }}>
                               <select 
                                   style={{ 
                                       padding: "0.75rem 1rem", borderRadius: "12px", border: "1.5px solid #e2e8f0",
                                       fontSize: "0.9rem", fontWeight: "700", color: "#475569", outline: "none",
                                       backgroundColor: "white", appearance: "none", minWidth: "150px"
                                   }}
                                   value={statusFilter}
                                   onChange={(e) => setStatusFilter(e.target.value)}
                               >
                                   <option value="ALL">All Status</option>
                                   <option value="ACTIVE">Active Only</option>
                                   <option value="INACTIVE">Inactive Only</option>
                               </select>
                               <i className="fa-solid fa-chevron-down" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", pointerEvents: "none", color: "#94a3b8" }}></i>
                            </div>
                        )}
                        <div style={{ position: "relative", width: "300px" }}>
                            <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                            <input 
                                type="text" 
                                placeholder={activeTab === "ROOMS" ? "Search OT rooms..." : "Search features..."} 
                                style={{ 
                                    width: "100%", padding: "0.75rem 1rem 0.75rem 2.8rem", 
                                    borderRadius: "12px", border: "1.5px solid #e2e8f0",
                                    fontSize: "0.9rem", outline: "none", backgroundColor: "white",
                                    transition: "all 0.2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--hospital-blue)"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {activeTab === "FEATURES" && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button 
                                    onClick={() => { setIsBulkMode(true); setCurrentFeature(null); setBulkFeatures([{name: ""}]); setIsFeatureModalOpen(true); }}
                                    style={{ padding: "0.75rem 1.25rem", backgroundColor: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" }}
                                >
                                    <i className="fa-solid fa-layer-group"></i> Bulk Upload
                                </button>
                                <button 
                                    onClick={() => { setIsBulkMode(false); setCurrentFeature(null); setFeatureForm({name: ""}); setIsFeatureModalOpen(true); }}
                                    style={{ padding: "0.75rem 1.25rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
                                >
                                    <i className="fa-solid fa-plus"></i> New Feature
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f1f5f9", padding: "0.4rem", borderRadius: "14px", width: "fit-content" }}>
                    <button 
                        onClick={() => { setActiveTab("ROOMS"); setSearchTerm(""); }}
                        style={{ 
                            padding: "0.6rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem",
                            backgroundColor: activeTab === "ROOMS" ? "white" : "transparent",
                            color: activeTab === "ROOMS" ? "var(--hospital-blue)" : "#64748b",
                            boxShadow: activeTab === "ROOMS" ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <i className="fa-solid fa-door-open"></i> OT Rooms
                    </button>
                    <button 
                        onClick={() => { setActiveTab("FEATURES"); setSearchTerm(""); setStatusFilter("ALL"); }}
                        style={{ 
                            padding: "0.6rem 2rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem",
                            backgroundColor: activeTab === "FEATURES" ? "white" : "transparent",
                            color: activeTab === "FEATURES" ? "var(--hospital-blue)" : "#64748b",
                            boxShadow: activeTab === "FEATURES" ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <i className="fa-solid fa-microchip"></i> Room Features
                    </button>
                </div>
            </div>

            {(roomsLoading || featuresLoading) && (
                <div style={{ textAlign: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #f1f5f9", borderTopColor: "var(--hospital-blue)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
                    <p style={{ color: "#64748b", fontWeight: "600" }}>Syncing infrastructure data...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}
            
            {(roomsError || featuresError) && (
                <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid #fee2e2" }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span style={{ fontWeight: "600" }}>{roomsError || featuresError}</span>
                </div>
            )}

            {!roomsLoading && !featuresLoading && (
                <div style={{ 
                    backgroundColor: "white", borderRadius: "20px", border: "1px solid #e2e8f0", 
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" 
                }}>
                    <div style={{ overflowX: "auto" }}>
                        {activeTab === "ROOMS" ? (
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Theater Registry</th>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location Identity</th>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Operation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRooms.length > 0 ? filteredRooms.map((room) => {
                                        const statusStyle = getRoomStatusStyle(room.status);
                                        return (
                                            <tr key={room.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }} className="table-row-hover">
                                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "1rem" }}>{room.roomName}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--hospital-blue)", fontWeight: "700" }}>{room.roomNumber}</div>
                                                </td>
                                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>{room.location}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>Floor {room.floor} • OT Registry #{room.operationTheaterId}</div>
                                                </td>
                                                <td style={{ padding: "1.25rem 1.5rem" }}>
                                                    <div style={{ 
                                                        display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.75rem", 
                                                        backgroundColor: statusStyle.bg, color: statusStyle.color, 
                                                        borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase"
                                                    }}>
                                                        <span style={{ width: "6px", height: "6px", backgroundColor: "currentColor", borderRadius: "50%" }}></span>
                                                        {room.status}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                                    <button 
                                                        onClick={() => navigate(`/ot-room/${room.id}`)}
                                                        style={{ 
                                                            padding: "0.5rem 1rem", backgroundColor: "white", 
                                                            border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                                            color: "#1e293b", fontWeight: "700", 
                                                            cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s"
                                                        }}
                                                    >
                                                        Analyze Room
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="4" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8" }}>No rooms found in infrastructure registry.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Feature Classification</th>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                                        <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Configuration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFeatures.length > 0 ? filteredFeatures.map((feature) => (
                                        <tr key={feature.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "1rem" }}>{feature.name}</div>
                                                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>UID: SYSTEM-FEAT-{feature.id}</div>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem" }}>
                                                <div 
                                                    onClick={() => handleToggleStatus(feature.id)}
                                                    style={{ 
                                                        width: "38px", height: "20px", backgroundColor: feature.isActive ? "var(--hospital-blue)" : "#cbd5e1",
                                                        borderRadius: "20px", cursor: "pointer", position: "relative", transition: "all 0.3s ease",
                                                        display: "inline-block", verticalAlign: "middle"
                                                    }}
                                                >
                                                    <div style={{ 
                                                        width: "14px", height: "14px", backgroundColor: "white", borderRadius: "50%",
                                                        position: "absolute", top: "3px", left: feature.isActive ? "21px" : "3px",
                                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                                                    }}></div>
                                                </div>
                                                <span style={{ 
                                                    marginLeft: "0.75rem", fontSize: "0.75rem", fontWeight: "800",
                                                    color: feature.isActive ? "#1e293b" : "#94a3b8" 
                                                }}>
                                                    {feature.isActive ? "ACTIVE" : "OFF"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                                    <button 
                                                        onClick={() => { setIsBulkMode(false); setCurrentFeature(feature); setFeatureForm({name: feature.name}); setIsFeatureModalOpen(true); }}
                                                        style={{ padding: "0.5rem", color: "var(--hospital-blue)", background: "none", border: "none", fontSize: "1rem", cursor: "pointer" }}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFeature(feature.id)}
                                                        style={{ padding: "0.5rem", color: "#dc2626", background: "none", border: "none", fontSize: "1rem", cursor: "pointer" }}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8" }}>No room features found matching these filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Feature Modal (Bulk or Single) */}
            {isFeatureModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form 
                        onSubmit={handleFeatureSubmit} 
                        style={{ backgroundColor: "white", maxWidth: isBulkMode ? "600px" : "450px", width: "100%", borderRadius: "24px", padding: "1.75rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>
                                    {isBulkMode ? "Bulk Register Features" : currentFeature ? "Edit Technical Feature" : "Define Technical Feature"}
                                </h2>
                                <button type="button" onClick={() => setIsFeatureModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#94a3b8" }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                        </div>

                        {!isBulkMode ? (
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "900", marginBottom: "0.5rem", color: "#64748b", textTransform: "uppercase" }}>Feature Name</label>
                                <input 
                                    type="text" 
                                    style={{ width: "100%", padding: "0.85rem 1rem", border: "2px solid #f1f5f9", borderRadius: "12px", fontSize: "1rem", fontWeight: "600" }} 
                                    required 
                                    value={featureForm.name} 
                                    onChange={e => setFeatureForm({name: e.target.value})} 
                                    placeholder="e.g. Laminar Air Flow"
                                />
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                                {bulkFeatures.map((feat, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <div style={{ flex: 1, position: "relative" }}>
                                            <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "#94a3b8", fontWeight: "800" }}>#{idx + 1}</span>
                                            <input 
                                                type="text" 
                                                style={{ width: "100%", padding: "0.85rem 1rem", border: "2px solid #f1f5f9", borderRadius: "12px", fontSize: "0.9rem", fontWeight: "600" }} 
                                                required 
                                                value={feat.name} 
                                                onChange={e => handleBulkInputChange(idx, e.target.value)} 
                                                placeholder="Enter technical name..."
                                            />
                                        </div>
                                        {bulkFeatures.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveBulkRow(idx)}
                                                style={{ width: "40px", height: "40px", minWidth: "40px", backgroundColor: "#fef2f2", color: "#ef4444", border: "none", borderRadius: "10px", cursor: "pointer" }}
                                            >
                                                <i className="fa-solid fa-minus"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={handleAddBulkRow}
                                    style={{ padding: "0.75rem", backgroundColor: "#f1f5f9", color: "var(--hospital-blue)", border: "2px dashed #cbd5e1", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", marginTop: "0.5rem" }}
                                >
                                    <i className="fa-solid fa-plus"></i> Add Another Infrastructure Attribute
                                </button>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            style={{ width: "100%", padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "14px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px" }}
                        >
                            {currentFeature ? "Authorize Revision" : isBulkMode ? "Register Infrastructure Registry" : "Register Technical Feature"}
                        </button>
                    </form>
                </div>
            )}
            <style>{`.table-row-hover:hover { background-color: #f8fafc; }`}</style>
        </div>
    );
};

export default AllRooms;
