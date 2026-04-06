import React from "react";

const PaymentHistory = ({ history, formatCurrency, formatDate }) => {
    if (!history) return <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.8rem" }}>No collection history available.</div>;

    const { payments = [], refunds = [] } = history;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Detailed History Table */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase" }}>Transaction Logs</h3>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: "0.6rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Collected</p>
                            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "#16a34a" }}>{formatCurrency(history.totalPaid)}</p>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                                <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Date & Time</th>
                                <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Transaction Info</th>
                                <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Type / Mode</th>
                                <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Recipient</th>
                                <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length > 0 ? payments.map((pay) => (
                                <tr key={pay.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "0.875rem 1rem" }}>
                                        <div style={{ fontWeight: "700", color: "#334155" }}>{formatDate(pay.paidAt).split(',')[0]}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{formatDate(pay.paidAt).split(',')[1]}</div>
                                    </td>
                                    <td style={{ padding: "0.875rem 1rem" }}>
                                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.75rem" }}>Ref: {pay.referenceNumber || "—"}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#64748b", fontStyle: "italic" }}>{pay.notes || "Official Collection"}</div>
                                    </td>
                                    <td style={{ padding: "0.875rem 1rem" }}>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            <span style={{ padding: "0.1rem 0.4rem", backgroundColor: "#f1f5f9", borderRadius: "4px", fontSize: "0.6rem", fontWeight: "800", color: "#64748b" }}>{pay.paymentType}</span>
                                            <span style={{ padding: "0.1rem 0.4rem", backgroundColor: "#eff6ff", borderRadius: "4px", fontSize: "0.6rem", fontWeight: "800", color: "#2563eb" }}>{pay.paymentMode}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "0.875rem 1rem" }}>
                                        <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b" }}>{pay.receivedBy}</div>
                                    </td>
                                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                                        <div style={{ fontWeight: "900", color: "#0f172a" }}>{formatCurrency(pay.amount)}</div>
                                        <div style={{ fontSize: "0.6rem", color: "#16a34a", fontWeight: "800" }}>{pay.status}</div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                                        No transactions recorded under this case.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {refunds.length > 0 && (
                <div>
                     <h3 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ef4444", textTransform: "uppercase", marginBottom: "1rem" }}>Refund History</h3>
                     <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                        {/* Refund mapping logic same as above if needed */}
                     </table>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
