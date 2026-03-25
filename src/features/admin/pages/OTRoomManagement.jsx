import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOtRoom } from "../hooks/useOtroom";

const OTRoomManagement = () => {
    const { loading, error, rooms, fetchRoomsByTheater, addRoom } = useOtRoom();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get OT details from URL query params
    const params = new URLSearchParams(location.search);
    const otId = params.get("otId");
    const otName = params.get("otName");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        operationTheaterId: otId ? parseInt(otId) : null,
        roomNumber: "",
        roomName: "",
        location: "",
        floor: "",
        type: "GENERAL",
        status: "AVAILABLE",
        hasHvac: true,
        hasGasSupply: true,
        hasSuction: true,
        hasEmergencyPower: true,
        capacity: 1,
        specialFeatures: ""
    });

    useEffect(() => {
        if (otId) {
            fetchRoomsByTheater(otId);
            setFormData(prev => ({ ...prev, operationTheaterId: parseInt(otId) }));
        }
    }, [otId, fetchRoomsByTheater]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const res = await addRoom(formData);
        if (res.success) {
            setIsAddModalOpen(false);
            resetForm();
            if (otId) fetchRoomsByTheater(otId);
        }
    };

    const resetForm = () => {
        setFormData({
            operationTheaterId: otId ? parseInt(otId) : null,
            roomNumber: "",
            roomName: "",
            location: "",
            floor: "",
            type: "GENERAL",
            status: "AVAILABLE",
            hasHvac: true,
            hasGasSupply: true,
            hasSuction: true,
            hasEmergencyPower: true,
            capacity: 1,
            specialFeatures: ""
        });
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <button 
                            onClick={() => navigate("/ot-management")}
                            style={{ 
                                background: "none", border: "1px solid var(--hospital-border)", 
                                borderRadius: "0.5rem", padding: "0.5rem 0.75rem", cursor: "pointer",
                                color: "var(--hospital-text-secondary)"
                            }}
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">OT Room List</h1>
                            <p className="text-hospital-text-secondary">Scientific configuration for units in: <span className="font-bold text-hospital-blue">{otName}</span></p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    style={{
                        padding: "0.7rem 1.25rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "0.5rem", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Add New Room
                </button>
            </div>

            {loading && !isAddModalOpen && <p>Loading room data...</p>}
            {error && !isAddModalOpen && <div style={{ color: "red", backgroundColor: "#fee2e2", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>{error}</div>}

            <div className="login-card" style={{ maxWidth: "none", padding: 0, overflow: "hidden", flex: 1, border: "1px solid var(--hospital-border)", boxShadow: "none" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1000px" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Room Info</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Type</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Features</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "var(--hospital-text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.length > 0 ? rooms.map((room) => (
                                <tr key={room.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontSize: "0.9375rem", fontWeight: "700" }}>{room.roomName}</div>
                                        <div style={{ fontSize: "0.8125rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{room.roomNumber}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontSize: "0.875rem" }}>{room.type}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Floor {room.floor} • Cap {room.capacity}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem" }}>
                                            <i title="HVAC" className={`fa-solid fa-wind ${room.hasHvac ? 'text-green-500' : 'text-gray-300'}`}></i>
                                            <i title="Gas" className={`fa-solid fa-flask ${room.hasGasSupply ? 'text-green-500' : 'text-gray-300'}`}></i>
                                            <i title="Suction" className={`fa-solid fa-droplet-slash ${room.hasSuction ? 'text-green-500' : 'text-gray-300'}`}></i>
                                            <i title="Power" className={`fa-solid fa-bolt ${room.hasEmergencyPower ? 'text-green-500' : 'text-gray-300'}`}></i>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{ 
                                            fontSize: "0.75rem", fontWeight: "700", padding: "0.25rem 0.6rem", 
                                            backgroundColor: room.status === "AVAILABLE" ? "#f0fdf4" : "#fef2f2",
                                            color: room.status === "AVAILABLE" ? "#16a34a" : "#dc2626",
                                            borderRadius: "4px"
                                        }}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                        <button 
                                            onClick={() => navigate(`/ot-room/${room.id}`)}
                                            style={{ 
                                                padding: "0.4rem 0.8rem", backgroundColor: "white", 
                                                border: "1px solid var(--hospital-border)", borderRadius: "6px",
                                                color: "var(--hospital-text-primary)", fontWeight: "600", 
                                                cursor: "pointer", fontSize: "0.8rem"
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                        No rooms registered for this theater.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Add Room */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <div className="login-card" style={{ maxWidth: "650px", width: "100%", maxHeight: "95vh", overflowY: "auto", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Register New OT Room</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ROOM NAME</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.roomName} onChange={e => setFormData({...formData, roomName: e.target.value})} placeholder="e.g. cardiac Surgery Room 1" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ROOM NUMBER</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="e.g. OT-R101" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ROOM TYPE</label>
                                <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option value="GENERAL">GENERAL</option>
                                    <option value="MAJOR">MAJOR</option>
                                    <option value="ICU">ICU</option>
                                    <option value="CARDIAC">CARDIAC</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>LOCATION / BLOCK</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Block A" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>FLOOR</label>
                                <input type="number" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})} placeholder="2" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>CAPACITY (BEDS)</label>
                                <input type="number" style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} placeholder="1" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>INITIAL STATUS</label>
                                <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="AVAILABLE">AVAILABLE</option>
                                    <option value="MAINTENANCE">MAINTENANCE</option>
                                    <option value="OCCUPIED">OCCUPIED</option>
                                </select>
                            </div>
                            
                            <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.8rem" }}>TECHNICAL SPECIFICATIONS</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={formData.hasHvac} onChange={e => setFormData({...formData, hasHvac: e.target.checked})} /> HVAC System
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={formData.hasGasSupply} onChange={e => setFormData({...formData, hasGasSupply: e.target.checked})} /> Gas Supply
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={formData.hasSuction} onChange={e => setFormData({...formData, hasSuction: e.target.checked})} /> Suction System
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={formData.hasEmergencyPower} onChange={e => setFormData({...formData, hasEmergencyPower: e.target.checked})} /> Emergency Power
                                    </label>
                                </div>
                            </div>
                            
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>SPECIAL FEATURES / NOTES</label>
                                <textarea style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", height: "80px", resize: "none" }} value={formData.specialFeatures} onChange={e => setFormData({...formData, specialFeatures: e.target.value})} placeholder="e.g. Laminar airflow, Advanced ventilation" />
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    Initialize & Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                .text-green-500 { color: #10b981; }
                .text-gray-300 { color: #d1d5db; }
            `}</style>
        </div>
    );
};

export default OTRoomManagement;
