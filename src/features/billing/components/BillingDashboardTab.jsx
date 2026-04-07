import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { ROLES } from "../../../shared/constants/roles";
import PaymentModal from "./PaymentModal";

const BillingSummary = ({ master, details, formatCurrency, formatDate, onRefresh }) => {
    const { user } = useAuthContext();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Detailed Financial Ledger */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ 
                    backgroundColor: "#fff", padding: "1.25rem", borderRadius: "12px", 
                    border: "1px solid #f1f5f9"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                        <i className="fa-solid fa-file-invoice" style={{ color: "#2563eb", fontSize: "0.85rem" }}></i>
                        <h3 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1e293b", margin: 0, textTransform: "uppercase", letterSpacing: "0.025em" }}>Charge Ledger Breakdown</h3>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "#64748b", fontWeight: "600" }}>Total Room & Theater Charges</span>
                            <span style={{ fontWeight: "800", color: "#0f172a" }}>{formatCurrency(details?.totalRoomCharges)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "#64748b", fontWeight: "600" }}>Surgical & Medical Staff Fees</span>
                            <span style={{ fontWeight: "800", color: "#0f172a" }}>{formatCurrency(details?.totalStaffCharges)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "#64748b", fontWeight: "600" }}>Clinical Items & Inventory usage</span>
                            <span style={{ fontWeight: "800", color: "#0f172a" }}>{formatCurrency(details?.totalItemCharges)}</span>
                        </div>
                        
                        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0.5rem 0" }}></div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "#64748b", fontWeight: "700" }}>Gross Billing Amount</span>
                            <span style={{ fontWeight: "800", color: "#0f172a" }}>{formatCurrency(details?.grossAmount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#16a34a" }}>
                            <span style={{ fontWeight: "600" }}>Less: Special Concession / Discount</span>
                            <span style={{ fontWeight: "800" }}>- {formatCurrency(details?.totalDiscountAmount)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "#64748b", fontWeight: "600" }}>Add: GST / Medical Taxation</span>
                            <span style={{ fontWeight: "800", color: "#0f172a" }}>{formatCurrency(details?.totalGstAmount)}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "10px", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ color: "#94a3b8", fontSize: "0.85rem" }}></i>
                    <p style={{ margin: 0, fontSize: "0.65rem", color: "#64748b", fontWeight: "700" }}>Statement Records Synchronized: {formatDate(details?.updatedAt)}</p>
                </div>
            </div>

            {/* Financial Status Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ 
                    backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1.5px solid #e2e8f0",
                    display: "flex", flexDirection: "column", gap: "1.25rem", justifyContent: "center"
                }}>
                    <div style={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
                        <p style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Net Total Payable</p>
                        <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>{formatCurrency(details?.totalAmount)}</h2>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ backgroundColor: "#fff", padding: "0.75rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: "800", color: "#2563eb", textTransform: "uppercase", marginBottom: "0.25rem" }}>Advance Paid</p>
                            <p style={{ fontSize: "1rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>{formatCurrency(details?.advancePaid)}</p>
                        </div>
                        <div style={{ backgroundColor: "#fff", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #fee2e2" }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: "800", color: "#ef4444", textTransform: "uppercase", marginBottom: "0.25rem" }}>Balance Due</p>
                            <p style={{ fontSize: "1rem", fontWeight: "900", color: "#b91c1c", margin: 0 }}>{formatCurrency(details?.due)}</p>
                        </div>
                    </div>

                    {(user?.role === ROLES.BILLING_INCHARGE || user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) && (
                        <button 
                            disabled={Number(details?.due) <= 0}
                            onClick={() => {
                                console.log("Opening Payment for Role:", user?.role);
                                setIsPaymentOpen(true);
                            }}
                            style={{ 
                                width: "100%", padding: "1rem", borderRadius: "12px", border: "none", 
                                backgroundColor: Number(details?.due) > 0 ? "#1e293b" : "#f1f5f9", 
                                color: Number(details?.due) > 0 ? "white" : "#94a3b8",
                                fontWeight: "900", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em",
                                cursor: Number(details?.due) > 0 ? "pointer" : "default", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center"
                            }}
                        >
                            <i className="fa-solid fa-money-bill-transfer"></i>
                            {Number(details?.due) > 0 ? "Make Payment" : "Already Settled"}
                        </button>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
                        <div>
                            <p style={{ fontSize: "0.6rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Op-Ref / Case ID</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", margin: 0 }}>#{details?.operationExternalId || 'N/A'}</p>
                        </div>
                        <div style={{ height: "18px", width: "1px", backgroundColor: "#e2e8f0", alignSelf: "center" }}></div>
                        <div>
                            <p style={{ fontSize: "0.6rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Patient ID</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", margin: 0 }}>#{details?.patientExternalId || 'N/A'}</p>
                        </div>
                        <div style={{ height: "18px", width: "1px", backgroundColor: "#e2e8f0", alignSelf: "center" }}></div>
                        <div>
                            <p style={{ fontSize: "0.6rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Created</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", margin: 0 }}>{formatDate(details?.createdAt).split(',')[0]}</p>
                        </div>
                        <div style={{ height: "18px", width: "1px", backgroundColor: "#e2e8f0", alignSelf: "center" }}></div>
                        <div>
                            <p style={{ fontSize: "0.6rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Billing Master</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", margin: 0 }}>#OT-BM-{details?.billingMasterId || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isPaymentOpen && (
                <PaymentModal 
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    billingData={details}
                    onSuccess={onRefresh}
                />
            )}
        </div>
    );
};

export default BillingSummary;
