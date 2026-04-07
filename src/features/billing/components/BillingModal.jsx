import React, { useEffect, useState } from "react";
import { useBilling } from "../hooks/useBilling";
import BillingDashboardTab from "./BillingDashboardTab";
import RoomBilling from "./RoomBilling";
import ItemBilling from "./ItemBilling";
import PaymentHistory from "./PaymentHistory";
import BillingSummary from "./BillingSummary"; // Import the new summary report

const BillingModal = ({ isOpen, onClose, operationId, patientName }) => {
    const { 
        loading, 
        error, 
        billingMaster, 
        billingDetails, 
        roomDetails, 
        itemDetails, 
        paymentHistory,
        fetchAllBillingData,
        fetchBillingSummary,
        billingSummary 
    } = useBilling();

    const [isSummaryReportOpen, setIsSummaryReportOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("SUMMARY"); // SUMMARY, ROOMS, ITEMS, HISTORY

    useEffect(() => {
        if (isOpen && operationId) {
            fetchAllBillingData(operationId);
        }
    }, [isOpen, operationId, fetchAllBillingData]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const StatusIndicator = ({ status }) => {
        const getStyles = (s) => {
            switch(s) {
                case 'PAID': return { bg: '#f0fdf4', color: '#16a34a' };
                case 'PARTIALLY_PAID': return { bg: '#fffbeb', color: '#d97706' };
                case 'ACTIVE': return { bg: '#eff6ff', color: '#2563eb' };
                case 'DUE': return { bg: '#fef2f2', color: '#dc2626' };
                default: return { bg: '#f9fafb', color: '#64748b' };
            }
        };
        const styles = getStyles(status);
        return (
            <span style={{ 
                padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.6rem", fontWeight: "900",
                backgroundColor: styles.bg, color: styles.color,
                textTransform: "uppercase", letterSpacing: "0.025em"
            }}>
                {status || 'UNSETTLED'}
            </span>
        );
    };

    return (
        <div style={{ 
            position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", 
            backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", 
            zIndex: 1500, padding: "1.5rem" 
        }}>
            <div className="login-card" style={{ 
                maxWidth: "950px", width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column",
                borderRadius: "16px", overflow: "hidden", padding: 0, border: "1px solid #e2e8f0",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", backgroundColor: "white"
            }}>
                {/* Minimal Header */}
                <div style={{ 
                    padding: "1rem 1.5rem", backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ backgroundColor: "#f1f5f9", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                            <i className="fa-solid fa-receipt" style={{ fontSize: "1rem" }}></i>
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Clinical Billing Statement</h2>
                                <StatusIndicator status={billingMaster?.paymentStatus || billingDetails?.billingStatus} />
                            </div>
                            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Px: {patientName} | Case ID: {operationId}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ 
                        background: "#fff", border: "1px solid #f1f5f9", color: "#94a3b8", 
                        width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem"
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Sub-Header / Nav */}
                <div style={{ display: "flex", backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 1.5rem", flexWrap: "wrap" }}>
                    {[
                        { id: "SUMMARY", label: "Financial Summary", icon: "fa-solid fa-chart-line" },
                        { id: "ROOMS", label: "Occupancy Log", icon: "fa-solid fa-bed" },
                        { id: "ITEMS", label: "Materials Ledger", icon: "fa-solid fa-box-open" },
                        { id: "HISTORY", label: "Payment History", icon: "fa-solid fa-clock-rotate-left" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "1rem 1.25rem", border: "none", background: "none", cursor: "pointer",
                                borderBottom: activeTab === tab.id ? "2.5px solid #2563eb" : "2.5px solid transparent",
                                color: activeTab === tab.id ? "#2563eb" : "#94a3b8",
                                fontWeight: "800", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.6rem",
                                textTransform: "uppercase", letterSpacing: "0.025em"
                            }}
                        >
                            <i className={tab.icon} style={{ fontSize: "0.85rem" }}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", backgroundColor: "#fff" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "4rem" }}>
                            <div className="loading-spinner" style={{ margin: "0 auto 1rem", width: "30px", height: "30px" }}></div>
                            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8" }}>Aggregating Accounts...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "4rem", color: "#ef4444" }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "2rem", marginBottom: "1rem" }}></i>
                            <p style={{ fontSize: "0.8rem", fontWeight: "800" }}>{error}</p>
                        </div>
                    ) : (
                        <div style={{ height: "100%" }}>
                            {activeTab === "SUMMARY" && (
                                <BillingDashboardTab 
                                    master={billingMaster} 
                                    details={billingDetails} 
                                    formatCurrency={formatCurrency} 
                                    formatDate={formatDate} 
                                    onRefresh={() => fetchAllBillingData(operationId)}
                                />
                            )}
                            {activeTab === "ROOMS" && (
                                <RoomBilling 
                                    roomDetails={roomDetails} 
                                    formatCurrency={formatCurrency} 
                                    formatDate={formatDate} 
                                />
                            )}
                            {activeTab === "ITEMS" && (
                                <ItemBilling 
                                    itemDetails={itemDetails} 
                                    formatCurrency={formatCurrency} 
                                />
                            )}
                            {activeTab === "HISTORY" && (
                                <PaymentHistory 
                                    history={paymentHistory} 
                                    formatCurrency={formatCurrency} 
                                    formatDate={formatDate} 
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ 
                    padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", backgroundColor: "#fcfcfc", 
                    display: "flex", justifyContent: "flex-end", gap: "0.75rem" 
                }}>
                    <button 
                        onClick={onClose}
                        style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#64748b", fontWeight: "800", cursor: "pointer", fontSize: "0.7rem" }}
                    >
                        Dismiss
                    </button>
                    <button 
                        onClick={async () => {
                            const res = await fetchBillingSummary(operationId);
                            if (res.success) {
                                setIsSummaryReportOpen(true);
                            }
                        }}
                        style={{ 
                            padding: "0.6rem 1.25rem", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", 
                            color: "white", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", 
                            gap: "0.5rem", fontSize: "0.7rem", transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                    >
                        <i className="fa-solid fa-file-invoice"></i>
                        Print Invoice
                    </button>
                </div>
                {isSummaryReportOpen && (
                    <BillingSummary 
                        isOpen={isSummaryReportOpen}
                        onClose={() => setIsSummaryReportOpen(false)}
                        data={billingSummary}
                    />
                )}
            </div>
        </div>
    );
};

export default BillingModal;
