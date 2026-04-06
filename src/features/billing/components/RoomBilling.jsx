import React from "react";

const RoomBilling = ({ roomDetails, formatCurrency, formatDate }) => {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem", border: "1px solid #f1f5f9", borderRadius: "10px" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Room Details</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Duration (Hrs)</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Rate / Hr</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Taxes & Discount</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {roomDetails.length > 0 ? roomDetails.map((room) => (
                        <tr key={room.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "800", color: "#334155" }}>{room.roomName}</div>
                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>#{room.roomNumber} | {room.isCurrent && "Current Active"}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "700" }}>{room.totalHours || "—"} Hours</div>
                                <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{formatDate(room.startTime).split(',')[1]} - {formatDate(room.endTime).split(',')[1]}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "700" }}>{formatCurrency(room.ratePerHour)}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontSize: "0.65rem", color: "#dc2626" }}>D: {formatCurrency(room.discountAmount)}</div>
                                <div style={{ fontSize: "0.65rem", color: "#0f172a" }}>T: {formatCurrency(room.gstAmount)} ({room.gstPercent || 0}%)</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                                <div style={{ fontWeight: "900", color: "#0f172a" }}>{formatCurrency(room.totalAmount)}</div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                                No theater occupancy records recorded.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RoomBilling;
