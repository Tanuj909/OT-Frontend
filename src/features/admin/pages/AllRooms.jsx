import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOtRoom } from "../hooks/useOtroom";

const AllRooms = () => {
    const { loading, error, rooms, fetchAllRooms } = useOtRoom();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAllRooms();
    }, [fetchAllRooms]);

    const filteredRooms = rooms.filter(room => 
        room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch(status) {
            case 'AVAILABLE': return { bg: '#f0fdf4', color: '#16a34a' };
            case 'OCCUPIED': return { bg: '#fef2f2', color: '#dc2626' };
            case 'MAINTENANCE': return { bg: '#fff7ed', color: '#ea580c' };
            default: return { bg: '#f8fafc', color: '#64748b' };
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem"
            }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>All OT Rooms</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>Manage and monitor all rooms in the hospital</p>
                </div>
                
                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.875rem" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search rooms..." 
                        style={{ 
                            width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", 
                            borderRadius: "8px", border: "1px solid var(--hospital-border)",
                            fontSize: "0.9rem", outline: "none"
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading && <div style={{ textAlign: "center", padding: "3rem" }}>Loading rooms...</div>}
            
            {error && (
                <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="login-card" style={{ padding: 0, overflow: "hidden", maxWidth: "none", border: "1px solid var(--hospital-border)", boxShadow: "none" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Room Name & No.</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Location</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>OT ID</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--hospital-text-secondary)", textTransform: "uppercase" }}>Status</th>
                                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", fontWeight: "600", color: "var(--hospital-text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.length > 0 ? filteredRooms.map((room) => {
                                    const statusStyle = getStatusStyle(room.status);
                                    return (
                                        <tr key={room.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ fontWeight: "600", color: "var(--hospital-text-primary)" }}>{room.roomName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--hospital-blue)" }}>{room.roomNumber}</div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ fontSize: "0.875rem" }}>{room.location}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--hospital-text-secondary)" }}>Floor {room.floor}</div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f1f5f9", borderRadius: "4px", fontWeight: "600" }}>
                                                    OT-{room.operationTheaterId}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ 
                                                    display: "inline-block", padding: "0.25rem 0.75rem", 
                                                    backgroundColor: statusStyle.bg, color: statusStyle.color, 
                                                    borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700" 
                                                }}>
                                                    {room.status}
                                                </div>
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
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                            No rooms matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllRooms;
