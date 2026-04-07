import React, { useEffect, useState } from "react";
import { useEquipment } from "../hooks/useEquipment";

const PricingType = {
    PER_USE: "PER_USE",
    PER_HOUR: "PER_HOUR",
    FIXED: "FIXED"
};

const EquipmentPricing = ({ equipment, isOpen, onClose }) => {
    const { 
        loading, 
        activePricing, 
        fetchActivePricing, 
        savePricing, 
        removePricing 
    } = useEquipment();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        pricingType: PricingType.PER_HOUR,
        rate: 0,
        unit: "HOUR",
        isActive: true,
        effectiveFrom: "",
        effectiveTo: ""
    });

    useEffect(() => {
        if (isOpen && equipment?.id) {
            fetchActivePricing(equipment.id);
        }
    }, [isOpen, equipment, fetchActivePricing]);

    useEffect(() => {
        if (activePricing) {
            setFormData({
                pricingType: activePricing.pricingType || PricingType.PER_HOUR,
                rate: activePricing.rate || 0,
                unit: activePricing.unit || "HOUR",
                isActive: activePricing.isActive ?? true,
                effectiveFrom: activePricing.effectiveFrom ? activePricing.effectiveFrom.split('T')[0] : "",
                effectiveTo: activePricing.effectiveTo ? activePricing.effectiveTo.split('T')[0] : ""
            });
            setIsEditing(false); // Start in view mode if pricing exists
        } else {
            setFormData({
                pricingType: PricingType.PER_HOUR,
                rate: 0,
                unit: "HOUR",
                isActive: true,
                effectiveFrom: new Date().toISOString().split('T')[0],
                effectiveTo: "2030-12-31"
            });
            setIsEditing(true); // Start in edit mode if no pricing
        }
    }, [activePricing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            equipmentId: equipment.id,
            effectiveFrom: formData.effectiveFrom ? `${formData.effectiveFrom}T00:00:00` : null,
            effectiveTo: formData.effectiveTo ? `${formData.effectiveTo}T23:59:59` : null
        };

        const res = await savePricing(activePricing?.id, submissionData);
        if (res.success) {
            setIsEditing(false);
            fetchActivePricing(equipment.id);
        } else {
            alert(res.message || "Operation failed.");
        }
    };

    const handleDelete = async () => {
        if (!activePricing?.id) return;
        if (window.confirm("Remove billing logic? This will make this asset free of charge for future surgeries.")) {
            const res = await removePricing(activePricing.id);
            if (res.success) {
                fetchActivePricing(equipment.id);
                setIsEditing(true);
            }
        }
    };

    if (!isOpen) return null;

    const PricingCard = ({ label, value, icon, color }) => (
        <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: `1px solid ${color}22`, display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ backgroundColor: `${color}11`, color: color, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                <i className={icon}></i>
            </div>
            <div>
                <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b" }}>{value}</div>
            </div>
        </div>
    );

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: "1.5rem", backdropFilter: "blur(6px)" }}>
            <div className="login-card" style={{ maxWidth: "600px", width: "100%", padding: 0, overflow: "hidden", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)" }}>
                {/* Header */}
                <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to right, #ffffff, #f8fafc)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ backgroundColor: "var(--hospital-blue)", color: "white", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                            <i className="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>Asset Pricing Strategy</h2>
                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{equipment.name} • {equipment.assetCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.2rem" }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div style={{ padding: "1.5rem" }}>
                    {!isEditing && activePricing ? (
                        <div style={{ display: "grid", gap: "1.5rem" }}>
                            {/* Visual Display */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <PricingCard label="Billing Model" value={activePricing.pricingType.replace(/_/g, ' ')} icon="fa-solid fa-microchip" color="#2563eb" />
                                <PricingCard label="Current Rate" value={`₹${activePricing.rate} / ${activePricing.unit}`} icon="fa-solid fa-money-bill-wave" color="#16a34a" />
                                <PricingCard label="Effective From" value={activePricing.effectiveFrom.split('T')[0]} icon="fa-solid fa-calendar-check" color="#ea580c" />
                                <PricingCard label="Status" value={activePricing.isActive ? "ACTIVE" : "INACTIVE"} icon="fa-solid fa-circle-check" color={activePricing.isActive ? "#16a34a" : "#dc2626"} />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ flex: 1, padding: "0.8rem", backgroundColor: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i> Modify Rates
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    style={{ padding: "0.8rem", backgroundColor: "#fff", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "0.8rem" }}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
                            <div style={{ backgroundColor: "#eff6ff", padding: "1rem", borderRadius: "12px", border: "1px solid #dbeafe" }}>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: "900", color: "#1e40af", marginBottom: "0.75rem", textTransform: "uppercase" }}>1. Select Billing Model</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                                    {[
                                        { id: PricingType.PER_HOUR, label: "Hourly", icon: "fa-solid fa-clock" },
                                        { id: PricingType.PER_USE, label: "Per Use", icon: "fa-solid fa-play" },
                                        { id: PricingType.FIXED, label: "Fixed", icon: "fa-solid fa-lock" },
                                    ].map(type => (
                                        <div 
                                            key={type.id}
                                            onClick={() => setFormData({
                                                ...formData, 
                                                pricingType: type.id,
                                                unit: type.id === PricingType.PER_HOUR ? "HOUR" : type.id === PricingType.PER_USE ? "USE" : "FIXED"
                                            })}
                                            style={{ 
                                                padding: "0.75rem", borderRadius: "10px", cursor: "pointer", textAlign: "center",
                                                border: formData.pricingType === type.id ? "2px solid #2563eb" : "2px solid transparent",
                                                backgroundColor: formData.pricingType === type.id ? "white" : "rgba(255,255,255,0.5)",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            <i className={type.icon} style={{ display: "block", marginBottom: "0.4rem", color: formData.pricingType === type.id ? "#2563eb" : "#94a3b8" }}></i>
                                            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: formData.pricingType === type.id ? "#1e3a8a" : "#64748b" }}>{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>BILLING RATE (INR)</label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontWeight: "800", color: "#94a3b8" }}>₹</span>
                                        <input type="number" required style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.2rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "800" }} value={formData.rate} onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>BILLING UNIT</label>
                                    <input readOnly style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #f1f5f9", borderRadius: "10px", fontWeight: "800", backgroundColor: "#f8fafc", color: "#94a3b8" }} value={formData.unit} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>EFFECTIVE FROM</label>
                                    <input type="date" required style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "800" }} value={formData.effectiveFrom} onChange={e => setFormData({...formData, effectiveFrom: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>EXPIRY DATE</label>
                                    <input type="date" style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontWeight: "800" }} value={formData.effectiveTo} onChange={e => setFormData({...formData, effectiveTo: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                {activePricing && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)}
                                        style={{ flex: 1, padding: "1rem", backgroundColor: "white", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontWeight: "800", cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ flex: 2, padding: "1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)" }}
                                >
                                    {loading ? "Saving..." : activePricing ? "Update Strategy" : "Finalize Pricing"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Info */}
                <div style={{ backgroundColor: "#f8fafc", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-circle-info"></i>
                    Approved assets pricing logic applies to all upcoming OT billing summaries.
                </div>
            </div>
        </div>
    );
};

export default EquipmentPricing;
