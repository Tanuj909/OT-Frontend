import React, { useEffect, useState } from 'react';
import { useWardBed } from '../hooks/useWardBed';

const WardRoomBeds = ({ room, onClose }) => {
    const { loading, error, beds, fetchBedsByRoom, addWardBed, editWardBed } = useWardBed();
    
    // UI States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("ADD"); // ADD or EDIT
    const [selectedBed, setSelectedBed] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterActive, setFilterActive] = useState("true"); // Changed to string to handle empty state

    // Form State
    const [formData, setFormData] = useState({
        bedNumber: "",
        isActive: true
    });

    const statusColors = {
        AVAILABLE: { bg: "#ecfdf5", text: "#059669", border: "#10b981", icon: "fa-check-circle" },
        OCCUPIED: { bg: "#eff6ff", text: "#2563eb", border: "#3b82f6", icon: "fa-user-bed" },
        MAINTENANCE: { bg: "#fef2f2", text: "#dc2626", border: "#ef4444", icon: "fa-tools" },
        RESERVED: { bg: "#fffbeb", text: "#d97706", border: "#f59e0b", icon: "fa-clock" }
    };

    const bedStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];

    useEffect(() => {
        if (room?.id) {
            loadBeds();
        }
    }, [room, filterStatus, filterActive]);

    const loadBeds = () => {
        const filters = {};
        if (filterStatus) filters.status = filterStatus;
        if (filterActive !== "") filters.isActive = filterActive === "true";
        fetchBedsByRoom(room.id, filters);
    };

    const handleOpenForm = (mode, bed = null) => {
        setFormMode(mode);
        if (mode === "EDIT" && bed) {
            setSelectedBed(bed);
            setFormData({
                bedNumber: bed.bedNumber,
                isActive: bed.isActive
            });
        } else {
            setSelectedBed(null);
            setFormData({
                bedNumber: "",
                isActive: true
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (formMode === "ADD") {
            res = await addWardBed({
                wardRoomId: room.id,
                bedNumber: formData.bedNumber
            });
        } else {
            res = await editWardBed(selectedBed.id, {
                bedNumber: formData.bedNumber,
                isActive: formData.isActive
            });
        }

        if (res.success) {
            alert(`Bed ${formMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsFormOpen(false);
            loadBeds();
        } else {
            alert(res.message || "Operation failed");
        }
    };

    const filteredBeds = beds.filter(bed => 
        bed.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            zIndex: 1300, padding: "2rem", backdropFilter: "blur(4px)"
        }}>
            <div style={{
                backgroundColor: "#f8fafc", width: "100%", maxWidth: "900px", 
                maxHeight: "90vh", borderRadius: "24px", display: "flex", 
                flexDirection: "column", overflow: "hidden", 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1.5rem 2rem", background: "white", 
                    borderBottom: "1px solid #e2e8f0", display: "flex", 
                    justifyContent: "space-between", alignItems: "center"
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ 
                                width: "40px", height: "40px", borderRadius: "12px", 
                                backgroundColor: "rgba(30, 64, 175, 0.1)", color: "var(--hospital-blue)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem"
                            }}>
                                <i className="fa-solid fa-bed"></i>
                            </div>
                            <div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                                    Room Beds: {room.roomName}
                                </h2>
                                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>{room.roomNumber} • {room.roomType}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button 
                            onClick={() => handleOpenForm("ADD")}
                            style={{
                                padding: "0.6rem 1.2rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                                border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "0.5rem"
                            }}
                        >
                            <i className="fa-solid fa-plus"></i> Add Bed
                        </button>
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ padding: "1rem 2rem", backgroundColor: "white", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                        <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                        <input 
                            type="text" 
                            placeholder="Search by bed number..." 
                            style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{ padding: "0.6rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", color: "#475569", fontWeight: "600" }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {bedStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <select 
                        style={{ padding: "0.6rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", fontSize: "0.9rem", color: "#475569", fontWeight: "600" }}
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                    >
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                        <option value="">Both Active/Inactive</option>
                    </select>
                </div>

                {/* Content */}
                <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
                    {loading && <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem", marginBottom: "1rem" }}></i>
                        <p>Syncing bed data...</p>
                    </div>}
                    
                    {error && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid #fee2e2" }}>{error}</div>}

                    {!loading && filteredBeds.length === 0 && (
                        <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "20px", border: "2px dashed #e2e8f0" }}>
                            <i className="fa-solid fa-bed-pulse" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1rem" }}></i>
                            <h3 style={{ color: "#475569", marginBottom: "0.5rem" }}>No beds found</h3>
                            <p style={{ color: "#94a3b8" }}>Try adjusting your filters or add a new bed.</p>
                        </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* List Header */}
                        {filteredBeds.length > 0 && (
                            <div style={{ 
                                display: "grid", 
                                gridTemplateColumns: "60px 1fr 1fr 100px", 
                                padding: "0.75rem 1.5rem", 
                                color: "#64748b", 
                                fontSize: "0.75rem", 
                                fontWeight: "800",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                <div>Unit</div>
                                <div>Bed Details</div>
                                <div style={{ textAlign: "center" }}>Status</div>
                                <div style={{ textAlign: "right" }}>Actions</div>
                            </div>
                        )}
                        {filteredBeds.map((bed) => {
                            const status = statusColors[bed.status] || statusColors.AVAILABLE;
                            return (
                                <div key={bed.id} style={{
                                    backgroundColor: "white", borderRadius: "16px", padding: "0.75rem 1.5rem",
                                    border: "1px solid #e2e8f0", 
                                    transition: "all 0.2s",
                                    display: "grid", 
                                    gridTemplateColumns: "60px 1fr 1fr 100px",
                                    alignItems: "center",
                                    boxShadow: bed.isActive ? "0 2px 4px rgba(0,0,0,0.02)" : "none",
                                    opacity: bed.isActive ? 1 : 0.6,
                                    borderLeft: `4px solid ${status.border}`
                                }} className="bed-row">
                                    {/* Icon Unit */}
                                    <div style={{ 
                                        width: "40px", height: "40px", borderRadius: "10px", 
                                        backgroundColor: status.bg, color: status.text,
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
                                    }}>
                                        <i className={`fa-solid ${status.icon}`}></i>
                                    </div>

                                    {/* Bed Info */}
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#1e293b" }}>{bed.bedNumber}</div>
                                        <div style={{ 
                                            fontSize: "0.65rem", 
                                            color: bed.isActive ? "#10b981" : "#dc2626", 
                                            fontWeight: "800",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.3rem"
                                        }}>
                                            {bed.isActive ? (
                                                <><i className="fa-solid fa-circle-check" style={{ fontSize: "0.5rem" }}></i> OPERATIONAL</>
                                            ) : (
                                                <><i className="fa-solid fa-circle-xmark" style={{ fontSize: "0.5rem" }}></i> INACTIVE</>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                        <div style={{
                                            padding: "0.4rem 1rem", borderRadius: "20px", 
                                            backgroundColor: status.bg, color: status.text,
                                            fontSize: "0.75rem", fontWeight: "800", textAlign: "center",
                                            border: `1px solid ${status.border}33`,
                                            minWidth: "120px"
                                        }}>
                                            {bed.status}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={() => handleOpenForm("EDIT", bed)}
                                            style={{ 
                                                width: "36px", height: "36px", borderRadius: "10px", 
                                                backgroundColor: "#f1f5f9", color: "#475569", 
                                                border: "1px solid #e2e8f0", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}
                                            title="Configure Bed"
                                        >
                                            <i className="fa-solid fa-gear"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {isFormOpen && (
                    <div style={{
                        position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)",
                        backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 1400
                    }}>
                        <form onSubmit={handleSubmit} style={{
                            backgroundColor: "white", padding: "2.5rem", borderRadius: "24px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", marginBottom: "0.5rem" }}>
                                {formMode === "ADD" ? "Add New Bed" : "Update Bed"}
                            </h3>
                            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem" }}>
                                {formMode === "ADD" ? "Enter the bed number to register." : "Modify bed details."}
                            </p>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>BED NUMBER</label>
                                <input 
                                    style={{ width: "100%", padding: "0.8rem 1rem", border: "1px solid #cbd5e1", borderRadius: "12px", fontSize: "1rem" }} 
                                    required 
                                    value={formData.bedNumber} 
                                    onChange={e => setFormData({...formData, bedNumber: e.target.value})} 
                                    placeholder="e.g. B-101-1" 
                                />
                            </div>

                            {formMode === "EDIT" && (
                                <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <input 
                                        type="checkbox" 
                                        id="bedActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                        style={{ width: "18px", height: "18px" }}
                                    />
                                    <label htmlFor="bedActive" style={{ fontSize: "0.9rem", fontWeight: "700", color: "#475569" }}>Active and Available for use</label>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)}
                                    style={{ flex: 1, padding: "0.8rem", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ flex: 1, padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                                >
                                    {formMode === "ADD" ? "Create" : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardRoomBeds;
