import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOtRoom } from "../hooks/useOtroom";
import { useOtFeature } from "../hooks/useOtFeature";

const OtRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        loading: roomLoading, error: roomError, selectedRoom, 
        fetchRoomById, editRoom, updateRoomStatus, 
        enableRoom, disableRoom, removeRoom 
    } = useOtRoom();

    const {
        loading: featureLoading,
        activeFeatures,
        roomFeatures,
        fetchActiveFeatures,
        fetchRoomFeatures,
        mapToRoom,
        unmapFromRoom
    } = useOtFeature();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
    const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

    useEffect(() => {
        if (id) {
            fetchRoomById(id);
            fetchRoomFeatures(id);
            fetchActiveFeatures();
        }
    }, [id, fetchRoomById, fetchRoomFeatures, fetchActiveFeatures]);

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

    const handleMapFeatures = async () => {
        if (selectedFeatureIds.length === 0) return alert("Select at least one feature");
        const res = await mapToRoom(id, selectedFeatureIds);
        if (res.success) {
            alert("Features added successfully");
            setIsMappingModalOpen(false);
            setSelectedFeatureIds([]);
            fetchRoomFeatures(id);
        } else {
            alert(res.message || "Mapping failed");
        }
    };

    const handleUnmapFeature = async (featureId) => {
        if (window.confirm("Remove this feature from the room?")) {
            const res = await unmapFromRoom(id, [featureId]);
            if (res.success) fetchRoomFeatures(id);
        }
    };

    if (roomLoading && !selectedRoom) return <div style={{ padding: "5rem", textAlign: "center" }}><div style={{ width: "40px", height: "40px", border: "3px solid #f1f5f9", borderTopColor: "var(--hospital-blue)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div></div>;
    if (roomError) return <div style={{ padding: "2rem", color: "#dc2626", textAlign: "center", fontWeight: "700" }}>{roomError}</div>;
    if (!selectedRoom) return <div style={{ padding: "4rem", textAlign: "center", fontWeight: "800", color: "#64748b" }}>Room Not Found</div>;

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "12px", width: "45px", height: "45px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>{selectedRoom.roomName}</h1>
                            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "#f1f5f9", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "800", color: "#64748b" }}>ID: {id}</span>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "500" }}>
                            {selectedRoom.roomNumber} • {selectedRoom.location} • OT-{selectedRoom.operationTheaterId}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        style={{ 
                            padding: "0.6rem 1.25rem", border: "1.5px solid var(--hospital-blue)", borderRadius: "10px", 
                            color: "var(--hospital-blue)", fontWeight: "700", backgroundColor: "white", cursor: "pointer", fontSize: "0.85rem"
                        }}
                    >
                        {isEditing ? "Cancel" : "Edit Room"}
                    </button>
                    <button 
                        onClick={handleDelete}
                        style={{ 
                            padding: "0.6rem 1.25rem", border: "1.5px solid #fee2e2", borderRadius: "10px", 
                            color: "#ef4444", fontWeight: "700", backgroundColor: "#fff1f2", cursor: "pointer", fontSize: "0.85rem"
                        }}
                    >
                        Delete Room
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }} className="room-grid">
                {/* Main Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                        {isEditing ? (
                            <form onSubmit={handleUpdate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div style={{ gridColumn: "span 2" }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "1rem", color: "#1e293b" }}>Edit Room</h3>
                                </div>
                                
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.4rem", color: "#64748b" }}>Room Name</label>
                                    <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #f1f5f9", borderRadius: "10px", fontWeight: "600" }} value={formData.roomName || ""} onChange={(e) => setFormData({...formData, roomName: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.4rem", color: "#64748b" }}>Room Number</label>
                                    <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #f1f5f9", borderRadius: "10px", fontWeight: "600" }} value={formData.roomNumber || ""} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.4rem", color: "#64748b" }}>Floor</label>
                                    <input type="number" style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #f1f5f9", borderRadius: "10px", fontWeight: "600" }} value={formData.floor || ""} onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.4rem", color: "#64748b" }}>Type</label>
                                    <select style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #f1f5f9", borderRadius: "10px", fontWeight: "600" }} value={formData.type || ""} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="GENERAL">GENERAL</option>
                                        <option value="MAJOR">MAJOR</option>
                                        <option value="ICU">ICU</option>
                                        <option value="CARDIAC">CARDIAC</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.75rem", color: "#64748b" }}>Room Infrastructure</label>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                            <input type="checkbox" checked={formData.hasHvac || false} onChange={e => setFormData({...formData, hasHvac: e.target.checked})} /> HVAC
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                            <input type="checkbox" checked={formData.hasGasSupply || false} onChange={e => setFormData({...formData, hasGasSupply: e.target.checked})} /> Gas Supply
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                            <input type="checkbox" checked={formData.hasSuction || false} onChange={e => setFormData({...formData, hasSuction: e.target.checked})} /> Suction
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                            <input type="checkbox" checked={formData.hasEmergencyPower || false} onChange={e => setFormData({...formData, hasEmergencyPower: e.target.checked})} /> Emergency Power
                                        </label>
                                    </div>
                                </div>

                                <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                    <button type="submit" style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>Update Room</button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "1.25rem", color: "#1e293b" }}>Room Details</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Type</span>
                                            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{selectedRoom.type}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Capacity</span>
                                            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{selectedRoom.capacity} Beds</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Floor</span>
                                            <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>Level {selectedRoom.floor}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Basic Features</span>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
                                            {[
                                                { label: "HVAC", key: "hasHvac" },
                                                { label: "Gas Supply", key: "hasGasSupply" },
                                                { label: "Suction", key: "hasSuction" },
                                                { label: "Emergency Power", key: "hasEmergencyPower" }
                                            ].map(feat => (
                                                <div key={feat.key} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", fontWeight: "600", color: selectedRoom[feat.key] ? "#1e293b" : "#cbd5e1" }}>
                                                    <i className={`fa-solid ${selectedRoom[feat.key] ? 'fa-circle-check text-green-500' : 'fa-circle-xmark'}`}></i>
                                                    {feat.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Room Features Section */}
                    <div style={{ backgroundColor: "white", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b" }}>Room Features</h3>
                                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Special features and equipment mapped to this room</p>
                            </div>
                            <button 
                                onClick={() => setIsMappingModalOpen(true)}
                                style={{ padding: "0.5rem 1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.8rem" }}
                            >
                                <i className="fa-solid fa-plus"></i> Add Feature
                            </button>
                        </div>

                        {roomFeatures.length > 0 ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
                                {roomFeatures.map(feat => (
                                    <div key={feat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                            <i className="fa-solid fa-microchip" style={{ color: feat.isActive ? "var(--hospital-blue)" : "#94a3b8", fontSize: "0.9rem" }}></i>
                                            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{feat.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleUnmapFeature(feat.id)}
                                            style={{ background: "none", color: "#cbd5e1", border: "none", cursor: "pointer", padding: "0.25rem" }}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1.5px dashed #e2e8f0" }}>
                                <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>No features mapped yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "1rem", color: "#64748b" }}>Status</h3>
                        <div style={{ 
                            padding: "1rem", borderRadius: "12px", textAlign: "center", 
                            backgroundColor: statusStyle.bg, color: statusStyle.color, 
                            fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem"
                        }}>
                            {selectedRoom.status}
                        </div>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <button onClick={() => handleStatusUpdate("AVAILABLE")} style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #f1f5f9", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Set Available</button>
                            <button onClick={() => handleStatusUpdate("MAINTENANCE")} style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #f1f5f9", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Set Maintenance</button>
                            <button onClick={() => handleStatusUpdate("OCCUPIED")} style={{ width: "100%", padding: "0.6rem", border: "1.5px solid #f1f5f9", borderRadius: "8px", backgroundColor: "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Set Occupied</button>
                        </div>
                    </div>

                    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                        <h3 style={{ fontSize: "0.8rem", fontWeight: "800", marginBottom: "1rem", color: "#64748b" }}>Activation</h3>
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {selectedRoom.isActive ? (
                                <button 
                                    onClick={() => handleAction(disableRoom, "Room deactivated")}
                                    style={{ width: "100%", padding: "0.8rem", backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.8rem" }}
                                >
                                    Disable Room
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAction(enableRoom, "Room activated")}
                                    style={{ width: "100%", padding: "0.8rem", backgroundColor: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.8rem" }}
                                >
                                    Activate Room
                                </button>
                            )}
                            <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>
                                {selectedRoom.isActive ? "Room is Active" : "Room is Inactive"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Features Modal */}
            {isMappingModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <div style={{ backgroundColor: "white", maxWidth: "450px", width: "100%", borderRadius: "20px", padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Add Features</h2>
                                <button onClick={() => setIsMappingModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#94a3b8" }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                        </div>

                        <div style={{ maxHeight: "300px", overflowY: "auto", padding: "0.25rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                {activeFeatures.filter(f => !roomFeatures.some(rf => rf.id === f.id)).length > 0 ? (
                                    activeFeatures.filter(f => !roomFeatures.some(rf => rf.id === f.id)).map(feat => {
                                        const isSelected = selectedFeatureIds.includes(feat.id);
                                        return (
                                            <div 
                                                key={feat.id}
                                                onClick={() => {
                                                    if (isSelected) setSelectedFeatureIds(selectedFeatureIds.filter(id => id !== feat.id));
                                                    else setSelectedFeatureIds([...selectedFeatureIds, feat.id]);
                                                }}
                                                style={{ 
                                                    padding: "0.8rem 1rem", borderRadius: "12px", border: "1.5px solid", 
                                                    borderColor: isSelected ? "var(--hospital-blue)" : "#f1f5f9",
                                                    backgroundColor: isSelected ? "#f0f9ff" : "white",
                                                    cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
                                                }}
                                            >
                                                <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#1e293b" }}>{feat.name}</span>
                                                {isSelected && <i className="fa-solid fa-circle-check" style={{ color: "var(--hospital-blue)" }}></i>}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ textAlign: "center", color: "#94a3b8", padding: "1rem", fontSize: "0.85rem" }}>No new active features found.</p>
                                )}
                            </div>
                        </div>

                        <button 
                            disabled={selectedFeatureIds.length === 0}
                            onClick={handleMapFeatures}
                            style={{ 
                                width: "100%", padding: "0.8rem", backgroundColor: selectedFeatureIds.length > 0 ? "var(--hospital-blue)" : "#cbd5e1", 
                                color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer"
                            }}
                        >
                            Map Features ({selectedFeatureIds.length})
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .text-green-500 { color: #10b981; }
                .text-red-500 { color: #ef4444; }
                @media (max-width: 1024px) { .room-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
};

export default OtRoom;
