import { useEffect, useState } from "react";
import { useWardRoom } from "../hooks/useWardRoom";
import WardRoomBeds from "./WardRoomBeds";

const WardRoomManagement = ({ ward, onBack }) => {
    const { loading, error, rooms, fetchRoomsByWard, addWardRoom, editWardRoom, deactivateRoom } = useWardRoom();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBedsModalOpen, setIsBedsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        roomNumber: "",
        roomName: "",
        roomType: "GENERAL",
        totalBeds: "",
        ratePerHour: "",
        discountPercent: 0,
        gstPercent: 0,
        hsnCode: "",
        isActive: true
    });

    const roomTypes = ["GENERAL", "PRIVATE", "SEMI_PRIVATE", "ICU", "HDU", "RECOVERY"];

    useEffect(() => {
        if (ward?.id) {
            fetchRoomsByWard(ward.id, { isActive: true });
        }
    }, [ward, fetchRoomsByWard]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredRooms = rooms.filter(room => 
        room.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (mode, room = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && room) {
            setSelectedRoomId(room.id);
            setFormData({
                roomNumber: room.roomNumber || "",
                roomName: room.roomName || "",
                roomType: room.roomType || "GENERAL",
                totalBeds: room.totalBeds || "",
                ratePerHour: room.ratePerHour || "",
                discountPercent: room.discountPercent || 0,
                gstPercent: room.gstPercent || 0,
                hsnCode: room.hsnCode || "",
                isActive: room.isActive ?? true
            });
        } else {
            setSelectedRoomId(null);
            setFormData({ 
                roomNumber: "", 
                roomName: "", 
                roomType: "GENERAL", 
                totalBeds: "",
                ratePerHour: "",
                discountPercent: 0,
                gstPercent: 0,
                hsnCode: "",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleViewBeds = (room) => {
        setSelectedRoom(room);
        setIsBedsModalOpen(true);
    };

    const handleDeactivate = async (id) => {
        if (window.confirm("Are you sure you want to deactivate this room?")) {
            const res = await deactivateRoom(id);
            if (res.success) {
                alert("Room deactivated successfully");
                fetchRoomsByWard(ward.id, { isActive: true });
            } else {
                alert(res.message || "Failed to deactivate room");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            wardId: ward.id,
            totalBeds: parseInt(formData.totalBeds),
            ratePerHour: parseFloat(formData.ratePerHour),
            discountPercent: parseFloat(formData.discountPercent),
            gstPercent: parseFloat(formData.gstPercent)
        };

        let res;
        if (modalMode === "ADD") {
            res = await addWardRoom(dataToSubmit);
        } else {
            res = await editWardRoom(selectedRoomId, dataToSubmit);
        }

        if (res.success) {
            alert(`Room ${modalMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchRoomsByWard(ward.id, { isActive: true });
        } else {
            alert(res.message || "Operation failed");
        }
    };

    return (
        <div style={{ padding: "0" }}>
            {/* Sub-Header */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "1.5rem",
                padding: "1rem",
                backgroundColor: "rgba(30, 64, 175, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(30, 64, 175, 0.1)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button 
                        onClick={onBack}
                        style={{
                            width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #e2e8f0",
                            backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--hospital-blue)", transition: "all 0.2s"
                        }}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--hospital-blue)", margin: 0 }}>
                            {ward.wardName} <span style={{ color: "#64748b", fontWeight: "400", fontSize: "0.9rem" }}>({ward.wardNumber})</span>
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>Manage rooms and bed distribution for this ward</p>
                    </div>
                </div>
                <button 
                    onClick={() => openModal("ADD")}
                    style={{
                        padding: "0.6rem 1.2rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Add Room
                </button>
            </div>

            {/* Rooms Grid */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ position: "relative", maxWidth: "400px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search rooms..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {loading && !isModalOpen && <div style={{ textAlign: "center", padding: "3rem" }}>Loading room data...</div>}
            {error && !isModalOpen && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {filteredRooms.length > 0 ? filteredRooms.map((room) => (
                    <div key={room.id} style={{ 
                        backgroundColor: "white", 
                        borderRadius: "16px", 
                        border: "1px solid #e2e8f0", 
                        padding: "1.25rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        position: "relative",
                        overflow: "hidden"
                    }} className="room-card">
                        <div style={{ 
                            position: "absolute", top: 0, right: 0, 
                            padding: "0.4rem 1rem", 
                            backgroundColor: "rgba(30, 64, 175, 0.1)", 
                            color: "var(--hospital-blue)",
                            fontSize: "0.7rem", fontWeight: "800",
                            borderBottomLeftRadius: "12px",
                            textTransform: "uppercase"
                        }}>
                            {room.roomType}
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "#1e293b" }}>{room.roomName}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{room.roomNumber}</div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "10px" }}>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>BEDS</div>
                                <div style={{ fontSize: "1rem", fontWeight: "800", color: "#334155" }}>{room.availableBeds} / {room.totalBeds}</div>
                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Available / Total</div>
                            </div>
                            <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "10px" }}>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>RATE / HR</div>
                                <div style={{ fontSize: "1rem", fontWeight: "800", color: "#059669" }}>₹{room.ratePerHour}</div>
                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Excl. GST</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            <button 
                                onClick={() => handleViewBeds(room)}
                                style={{ 
                                    flex: "1 1 auto", padding: "0.6rem", backgroundColor: "rgba(30, 64, 175, 0.1)", 
                                    color: "var(--hospital-blue)", border: "1px solid rgba(30, 64, 175, 0.2)", 
                                    borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
                                }}
                            >
                                <i className="fa-solid fa-bed"></i> View Beds
                            </button>
                            <button 
                                onClick={() => openModal("EDIT", room)}
                                style={{ 
                                    padding: "0.6rem", backgroundColor: "#f1f5f9", 
                                    color: "#475569", border: "1px solid #e2e8f0", 
                                    borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem",
                                    display: "flex", alignItems: "center", justifyContent: "center", width: "40px"
                                }}
                                title="Edit Room"
                            >
                                <i className="fa-solid fa-edit"></i>
                            </button>
                            <button 
                                onClick={() => handleDeactivate(room.id)}
                                style={{ 
                                    padding: "0.6rem", backgroundColor: "#fef2f2", 
                                    color: "#dc2626", border: "1px solid #fecaca", 
                                    borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.8rem",
                                    display: "flex", alignItems: "center", justifyContent: "center", width: "40px"
                                }}
                                title="Deactivate Room"
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                        <i className="fa-solid fa-door-closed" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1rem" }}></i>
                        <p style={{ color: "#64748b", fontWeight: "600" }}>No rooms registered in this ward yet.</p>
                        <button 
                            onClick={() => openModal("ADD")}
                            style={{ 
                                marginTop: "1rem", padding: "0.6rem 1.2rem", backgroundColor: "white", 
                                border: "1px solid var(--hospital-blue)", color: "var(--hospital-blue)", 
                                borderRadius: "8px", fontWeight: "700", cursor: "pointer"
                            }}
                        >
                            Initialize First Room
                        </button>
                    </div>
                )}
            </div>

            {/* Modal: Add/Edit Room */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "600px", width: "100%", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>{modalMode === "ADD" ? "Configure New Room" : "Edit Room Specifications"}</h2>
                                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Define clinical and billing parameters</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>ROOM NAME</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} required value={formData.roomName} onChange={e => setFormData({...formData, roomName: e.target.value})} placeholder="e.g. Deluxe Cardiac Suite" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>ROOM NUMBER</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} placeholder="e.g. R-101" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>ROOM TYPE</label>
                                <select style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} value={formData.roomType} onChange={e => setFormData({...formData, roomType: e.target.value})}>
                                    {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>TOTAL BEDS</label>
                                <input type="number" style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} required value={formData.totalBeds} onChange={e => setFormData({...formData, totalBeds: e.target.value})} placeholder="4" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>RATE PER HOUR (₹)</label>
                                <input type="number" step="0.01" style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} required value={formData.ratePerHour} onChange={e => setFormData({...formData, ratePerHour: e.target.value})} placeholder="350.00" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>GST (%)</label>
                                <input type="number" step="0.1" style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} value={formData.gstPercent} onChange={e => setFormData({...formData, gstPercent: e.target.value})} placeholder="12" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>DISCOUNT (%)</label>
                                <input type="number" step="0.1" style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} placeholder="0" />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "0.5rem" }}>HSN CODE</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "10px" }} value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} placeholder="9993" />
                            </div>
                        </div>
                        
                        <div style={{ marginTop: "2rem" }}>
                            <button type="submit" style={{ 
                                width: "100%", padding: "1rem", backgroundColor: "var(--hospital-blue)", 
                                color: "white", border: "none", borderRadius: "10px", 
                                fontWeight: "800", cursor: "pointer", fontSize: "1rem",
                                boxShadow: "0 10px 15px -3px rgba(30, 64, 175, 0.3)"
                            }}>
                                {modalMode === "ADD" ? "Commit New Room" : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: View Beds */}
            {isBedsModalOpen && (
                <WardRoomBeds 
                    room={selectedRoom} 
                    onClose={() => setIsBedsModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default WardRoomManagement;
