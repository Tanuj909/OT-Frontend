import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOtRoom } from "../hooks/useOtroom";

const OtRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        loading, error, selectedRoom, 
        fetchRoomById, editRoom, updateRoomStatus, 
        enableRoom, disableRoom, removeRoom 
    } = useOtRoom();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (id) {
            fetchRoomById(id);
        }
    }, [id, fetchRoomById]);

    useEffect(() => {
        if (selectedRoom) {
            setFormData({ ...selectedRoom });
        }
    }, [selectedRoom]);

    const handleAction = async (actionFn, successMsg) => {
        const res = await actionFn(id);
        if (res.success) {
            alert(successMsg);
            fetchRoomById(id);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await editRoom(id, formData);
        if (res.success) {
            alert("Room updated successfully.");
            setIsEditing(false);
            fetchRoomById(id);
        }
    };

    const handleStatusUpdate = async (status) => {
        const res = await updateRoomStatus(id, { status, reason: "Manual update" });
        if (res.success) {
            alert(`Room status updated to ${status}`);
            fetchRoomById(id);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            const res = await removeRoom(id);
            if (res.success) {
                alert("Room deleted successfully.");
                navigate("/all-rooms");
            }
        }
    };

    if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>Loading room data...</div>;
    if (error) return <div style={{ padding: "2rem", color: "#dc2626", textAlign: "center" }}>{error}</div>;
    if (!selectedRoom) return <div style={{ padding: "4rem", textAlign: "center" }}>Room not found.</div>;

    const getStatusColor = (status) => {
        switch(status) {
            case 'AVAILABLE': return { bg: '#f0fdf4', color: '#16a34a' };
            case 'OCCUPIED': return { bg: '#fef2f2', color: '#dc2626' };
            case 'MAINTENANCE': return { bg: '#fff7ed', color: '#ea580c' };
            default: return { bg: '#f8fafc', color: '#64748b' };
        }
    };

    const statusStyle = getStatusColor(selectedRoom.status);

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header Area */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: "white", border: "1px solid var(--hospital-border)", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>{selectedRoom.roomName}</h1>
                        <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>
                            {selectedRoom.roomNumber} • {selectedRoom.location} • OT-{selectedRoom.operationTheaterId}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        style={{ 
                            padding: "0.5rem 1rem", border: "1px solid var(--hospital-blue)", borderRadius: "6px", 
                            color: "var(--hospital-blue)", fontWeight: "600", backgroundColor: "white", cursor: "pointer", fontSize: "0.875rem"
                        }}
                    >
                        {isEditing ? "Cancel" : "Edit Room"}
                    </button>
                    <button 
                        onClick={handleDelete}
                        style={{ 
                            padding: "0.5rem 1rem", border: "1px solid #dc2626", borderRadius: "6px", 
                            color: "#dc2626", fontWeight: "600", backgroundColor: "white", cursor: "pointer", fontSize: "0.875rem"
                        }}
                    >
                        Delete Room
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }} className="room-grid">
                {/* Main Section */}
                <div>
                    <div className="login-card" style={{ padding: "1.5rem", maxWidth: "none", border: "1px solid var(--hospital-border)", boxShadow: "none" }}>
                        {isEditing ? (
                            <form onSubmit={handleUpdate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div style={{ gridColumn: "span 2" }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>Edit Room Details</h3>
                                </div>
                                
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>ROOM NAME</label>
                                    <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.roomName || ""} onChange={(e) => setFormData({...formData, roomName: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>ROOM NUMBER</label>
                                    <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.roomNumber || ""} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>LOCATION</label>
                                    <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>FLOOR</label>
                                    <input type="number" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.floor || ""} onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})} />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>TYPE</label>
                                    <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.type || ""} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="GENERAL">GENERAL</option>
                                        <option value="MAJOR">MAJOR</option>
                                        <option value="ICU">ICU</option>
                                        <option value="CARDIAC">CARDIAC</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>STATUS</label>
                                    <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.status || ""} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="OCCUPIED">OCCUPIED</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>CAPACITY (BEDS)</label>
                                    <input type="number" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.capacity || ""} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.8rem", color: "#64748b" }}>FEATURES</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={formData.hasHvac || false} onChange={e => setFormData({...formData, hasHvac: e.target.checked})} /> HVAC
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={formData.hasGasSupply || false} onChange={e => setFormData({...formData, hasGasSupply: e.target.checked})} /> Gas Supply
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={formData.hasSuction || false} onChange={e => setFormData({...formData, hasSuction: e.target.checked})} /> Suction
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={formData.hasEmergencyPower || false} onChange={e => setFormData({...formData, hasEmergencyPower: e.target.checked})} /> Emergency Power
                                        </label>
                                    </div>
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "0.4rem", color: "#64748b" }}>SPECIAL FEATURES</label>
                                    <textarea style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", height: "80px", resize: "none" }} value={formData.specialFeatures || ""} onChange={(e) => setFormData({...formData, specialFeatures: e.target.value})} />
                                </div>

                                <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                    <button type="submit" style={{ padding: "0.7rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>Save Data</button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1.25rem", color: "var(--hospital-text-primary)" }}>Room Information</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--hospital-text-secondary)" }}>Type</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>{selectedRoom.type}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--hospital-text-secondary)" }}>Capacity</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>{selectedRoom.capacity} Beds</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--hospital-text-secondary)" }}>Floor</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>{selectedRoom.floor}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f1f5f9" }}>
                                            <span style={{ fontSize: "0.875rem", color: "var(--hospital-text-secondary)" }}>Location</span>
                                            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>{selectedRoom.location}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Features</span>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                                                <i className={`fa-solid ${selectedRoom.hasHvac ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-500'}`}></i> HVAC
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                                                <i className={`fa-solid ${selectedRoom.hasGasSupply ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-500'}`}></i> Gas Supply
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                                                <i className={`fa-solid ${selectedRoom.hasSuction ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-500'}`}></i> Suction
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                                                <i className={`fa-solid ${selectedRoom.hasEmergencyPower ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-500'}`}></i> Emergency Power
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: "2rem" }}>
                                    <h4 style={{ fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Notes / Special Features</h4>
                                    <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
                                        {selectedRoom.specialFeatures || "No special features listed."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="login-card" style={{ padding: "1.25rem", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                        <h3 style={{ fontSize: "0.875rem", fontWeight: "700", marginBottom: "1rem" }}>Current Status</h3>
                        <div style={{ 
                            padding: "1rem", borderRadius: "8px", textAlign: "center", 
                            backgroundColor: statusStyle.bg, color: statusStyle.color, 
                            fontWeight: "800", fontSize: "1rem", marginBottom: "1.5rem"
                        }}>
                            {selectedRoom.status}
                        </div>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <button onClick={() => handleStatusUpdate("AVAILABLE")} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8125rem", fontWeight: "600" }}>Set Available</button>
                            <button onClick={() => handleStatusUpdate("MAINTENANCE")} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8125rem", fontWeight: "600" }}>Set Maintenance</button>
                            <button onClick={() => handleStatusUpdate("OCCUPIED")} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e2e8f0", borderRadius: "6px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8125rem", fontWeight: "600" }}>Set Occupied</button>
                        </div>
                    </div>

                    <div className="login-card" style={{ padding: "1.25rem", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                        <h3 style={{ fontSize: "0.875rem", fontWeight: "700", marginBottom: "1rem" }}>Activation</h3>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {selectedRoom.isActive ? (
                                <button 
                                    onClick={() => handleAction(disableRoom, "Room disabled.")}
                                    style={{ width: "100%", padding: "0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}
                                >
                                    Disable Room
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAction(enableRoom, "Room enabled.")}
                                    style={{ width: "100%", padding: "0.75rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}
                                >
                                    Enable Room
                                </button>
                            )}
                            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#64748b" }}>
                                {selectedRoom.isActive ? "Room is currently active." : "Room is currently disabled."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-green-500 { color: #10b981; }
                .text-red-500 { color: #ef4444; }
                @media (max-width: 1024px) {
                    .room-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default OtRoom;
