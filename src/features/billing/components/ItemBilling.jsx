import React from "react";

const ItemBilling = ({ itemDetails, formatCurrency }) => {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem", border: "1px solid #f1f5f9", borderRadius: "10px" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Item / Category</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Quantity Info</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Unit Price</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Adjustment (%)</th>
                        <th style={{ padding: "0.875rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Net Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {itemDetails.length > 0 ? itemDetails.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "800", color: "#334155" }}>{item.itemName}</div>
                                <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Ref: {item.itemCode || "—"} | {item.itemType}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "700" }}>Qty: {item.quantity || "—"}</div>
                                <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>HSN Code: {item.hsnCode || "—"}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontWeight: "600" }}>{formatCurrency(item.unitPrice)}</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                                <div style={{ fontSize: "0.65rem" }}>D: {item.discountPercent || 0}%</div>
                                <div style={{ fontSize: "0.65rem" }}>T: {item.gstPercent || 0}%</div>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                                <div style={{ fontWeight: "900", color: "#0f172a" }}>{formatCurrency(item.totalAmount)}</div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
                                No clinical inventory records utilized.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ItemBilling;
