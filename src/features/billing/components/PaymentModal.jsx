import React, { useState } from "react";
import { useBilling } from "../hooks/useBilling";
import { useAuthContext } from "../../../context/AuthContext";

const PaymentModal = ({ isOpen, onClose, billingData, onSuccess }) => {
    const { user } = useAuthContext();
    const { makePayment, loading } = useBilling();

    const [formData, setFormData] = useState({
        paymentType: "ADVANCE",
        paymentMode: "CASH",
        amount: billingData?.due || 0,
        referenceNumber: "",
        notes: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            operationExternalId: billingData.operationExternalId,
            patientExternalId: billingData.patientExternalId,
            paymentType: formData.paymentType,
            paymentMode: formData.paymentMode,
            amount: parseFloat(formData.amount),
            referenceNumber: formData.referenceNumber || `TXN-${Date.now()}`,
            // receivedBy: user?.username || "admin",
            notes: formData.notes
        };

        const res = await makePayment(payload);
        if (res.success) {
            alert(res.message);
            onSuccess();
            onClose();
        } else {
            alert(res.message);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1600 }}>
            <div className="login-card" style={{ maxWidth: "450px", width: "100%", padding: "2rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Register Collection</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Collection Amount (INR)</label>
                        <input 
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            required
                            max={billingData?.due}
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontWeight: "800", fontSize: "1.25rem", color: "#1e293b" }}
                        />
                        <p style={{ margin: "0.4rem 0 0", fontSize: "0.65rem", color: "#94a3b8", fontWeight: "700" }}>Max Balance Payable: ₹{billingData?.due}</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Mode</label>
                            <select 
                                value={formData.paymentMode}
                                onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}
                            >
                                <option value="CASH">Cash</option>
                                <option value="CARD">Debit/Credit Card</option>
                                <option value="UPI">UPI Transfer</option>
                                <option value="NET_BANKING">Net Banking</option>
                                <option value="CHEQUE">Cheque</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Classification</label>
                            <select 
                                value={formData.paymentType}
                                onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}
                            >
                                <option value="PARTIAL">Partial Payment</option>
                                <option value="FULL">Full / Settlement</option>
                                <option value="ADVANCE">Advance (Pre-Surgery)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Transaction Ref # (Optional)</label>
                        <input 
                            placeholder="TXN ID, Receipt No, etc."
                            value={formData.referenceNumber}
                            onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "600", fontSize: "0.8rem" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Remarks</label>
                        <textarea 
                            rows="2"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "600", fontSize: "0.8rem" }}
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || formData.amount <= 0}
                        style={{ 
                            width: "100%", padding: "1rem", borderRadius: "10px", 
                            backgroundColor: "#2563eb", color: "white", fontWeight: "800", border: "none", cursor: "pointer",
                            boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                            opacity: (loading || formData.amount <= 0) ? 0.7 : 1
                        }}
                    >
                        {loading ? "Recording Transaction..." : "Confirm Collection"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
