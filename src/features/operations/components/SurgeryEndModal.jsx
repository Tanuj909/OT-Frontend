import React, { useState, useEffect } from "react";
import { useSurgeryEnd } from "../hooks/useSurgeryEnd";

const SurgeryEndModal = ({ isOpen, onClose, operationId, onEndSuccess }) => {
    const { fetchReadiness, endSurgery, loading, readiness, error } = useSurgeryEnd();
    
    const [step, setStep] = useState(1); // 1: Readiness, 2: Final Details
    const [formData, setFormData] = useState({
        drainDetails: "",
        dressingDetails: "",
        recoveryLocation: "PACU",
        immediatePostOpCondition: ""
    });

    useEffect(() => {
        if (isOpen && operationId) {
            setStep(1);
            fetchReadiness(operationId);
        }
    }, [isOpen, operationId, fetchReadiness]);

    const handleEndSubmit = async (e) => {
        e.preventDefault();
        const res = await endSurgery(operationId, formData);
        if (res.success) {
            onEndSuccess(res.data);
            onClose();
        } else {
            alert(res.message || "Failed to end surgery.");
        }
    };

    if (!isOpen) return null;

    // Helper to group checks
    const getCategorizedChecks = () => {
        if (!readiness?.checks) return {};
        
        const categories = {
            "Clinical Status": ["vitalsRecorded", "bloodLossRecorded", "intraOpCompleted", "allIVFluidsEndTimeSet"],
            "Staff & assignment": ["primarySurgeonAssigned", "anesthesiologistAssigned", "roomAssigned"],
            "Documentation": ["procedurePerformedFilled", "woundClosureFilled", "allDrugsEndTimeSet", "allEquipmentEndTimeSet", "preOpCompleted", "intraOpExists"]
        };

        const grouped = {};
        Object.entries(categories).forEach(([cat, keys]) => {
            grouped[cat] = keys.map(key => ({
                label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                status: readiness.checks[key]
            }));
        });
        return grouped;
    };

    const categorizedChecks = getCategorizedChecks();

    return (
        <div style={{ 
            position: "fixed", inset: 0, zIndex: 1000, 
            display: "flex", justifyContent: "center", alignItems: "center",
            backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(8px)",
            padding: "1rem", animation: "fadeIn 0.3s ease-out"
        }}>
            <div style={{ 
                width: "100%", maxWidth: "700px", backgroundColor: "#fff", 
                borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                display: "flex", flexDirection: "column", maxHeight: "90vh", overflow: "hidden"
            }}>
                {/* Header with Stepper */}
                <div style={{ 
                    padding: "1.5rem 2rem", borderBottom: "1px solid #f1f5f9", 
                    background: "linear-gradient(to right, #f8fafc, #ffffff)" 
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>End Surgery Protocol</h2>
                            <p style={{ fontSize: "0.875rem", color: "#64748b", margin: "0.25rem 0 0", fontWeight: "500" }}>Operation ID: #{operationId}</p>
                        </div>
                        <button onClick={onClose} style={{ 
                            background: "#f1f5f9", border: "none", width: "36px", height: "36px", 
                            borderRadius: "50%", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Stepper UI */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                            <div style={{ 
                                width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: step >= 1 ? "var(--hospital-blue)" : "#e2e8f0", color: "#fff", fontWeight: "700", fontSize: "0.875rem"
                            }}>1</div>
                            <span style={{ fontWeight: "700", fontSize: "0.875rem", color: step === 1 ? "#0f172a" : "#94a3b8" }}>Readiness Check</span>
                        </div>
                        <div style={{ height: "2px", flex: 0.5, backgroundColor: step === 2 ? "var(--hospital-blue)" : "#f1f5f9" }}></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                            <div style={{ 
                                width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: step === 2 ? "var(--hospital-blue)" : "#f1f5f9", 
                                color: step === 2 ? "#fff" : "#94a3b8", fontWeight: "700", fontSize: "0.875rem",
                                border: step === 2 ? "none" : "2px solid #e2e8f0"
                            }}>2</div>
                            <span style={{ fontWeight: "700", fontSize: "0.875rem", color: step === 2 ? "#0f172a" : "#94a3b8" }}>Post-Op Documentation</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {loading && !readiness ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                            <div className="loader" style={{ 
                                border: "4px solid #f3f3f3", borderTop: "4px solid var(--hospital-blue)", 
                                borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite" 
                            }}></div>
                            <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: "600" }}>Verifying clinical readiness...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "2rem" }}>
                            <div style={{ 
                                width: "64px", height: "64px", backgroundColor: "#fef2f2", color: "#ef4444", 
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                                margin: "0 auto 1.5rem", fontSize: "1.5rem" 
                            }}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h3 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Verification Failed</h3>
                            <p style={{ color: "#ef4444", fontWeight: "600" }}>{error}</p>
                            <button onClick={() => fetchReadiness(operationId)} style={{ 
                                marginTop: "1.5rem", padding: "0.75rem 1.5rem", background: "var(--hospital-blue)", 
                                color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" 
                            }}>Retry Verification</button>
                        </div>
                    ) : step === 1 ? (
                        /* Step 1: Readiness */
                        <div>
                            {/* Readiness Summary Card */}
                            <div style={{ 
                                padding: "1.25rem", borderRadius: "16px", marginBottom: "2rem",
                                backgroundColor: readiness?.canEnd ? "#f0fdf4" : "#fff7ed",
                                border: `1px solid ${readiness?.canEnd ? "#bbf7d0" : "#ffedd5"}`,
                                display: "flex", alignItems: "center", gap: "1rem"
                            }}>
                                <div style={{ 
                                    width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                                    backgroundColor: readiness?.canEnd ? "#22c55e" : "#f59e0b", color: "#fff", fontSize: "1.25rem"
                                }}>
                                    <i className={`fa-solid ${readiness?.canEnd ? "fa-circle-check" : "fa-circle-info"}`}></i>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: readiness?.canEnd ? "#166534" : "#92400e", fontWeight: "800" }}>
                                        {readiness?.canEnd ? "All Pre-requisites Met" : "Mandatory Actions Required"}
                                    </h4>
                                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem", color: readiness?.canEnd ? "#15803d" : "#b45309", fontWeight: "500" }}>
                                        {readiness?.canEnd 
                                            ? "The procedure is ready for final documentation and closure." 
                                            : "Please resolve the marked items below before ending the surgery."}
                                    </p>
                                </div>
                            </div>

                            {/* Categorized Checks */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {Object.entries(categorizedChecks).map(([category, checks]) => (
                                    <div key={category}>
                                        <h5 style={{ 
                                            fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", 
                                            color: "#94a3b8", marginBottom: "0.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" 
                                        }}>
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--hospital-blue)" }}></span>
                                            {category}
                                        </h5>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                                            {checks.map(check => (
                                                <div key={check.label} style={{ 
                                                    padding: "1rem", borderRadius: "14px", backgroundColor: "#f8fafc", 
                                                    border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between",
                                                    transition: "transform 0.2s"
                                                }}>
                                                    <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#334155" }}>{check.label}</span>
                                                    {check.status ? (
                                                        <i className="fa-solid fa-check" style={{ color: "#22c55e" }}></i>
                                                    ) : (
                                                        <span style={{ 
                                                            fontSize: "0.7rem", padding: "0.25rem 0.6rem", borderRadius: "6px", 
                                                            backgroundColor: "#fee2e2", color: "#ef4444", fontWeight: "800" 
                                                        }}>PENDING</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Final Details Form */
                        <form id="end-surgery-form" onSubmit={handleEndSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#334155" }}>Drain Details</label>
                                    <div style={{ position: "relative" }}>
                                        <i className="fa-solid fa-droplet" style={{ position: "absolute", left: "1rem", top: "1rem", color: "#94a3b8" }}></i>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. JP drain placed"
                                            value={formData.drainDetails}
                                            onChange={(e) => setFormData({...formData, drainDetails: e.target.value})}
                                            required
                                            style={{ 
                                                width: "100%", padding: "0.875rem 1rem 0.875rem 2.75rem", borderRadius: "12px", border: "1px solid #e2e8f0",
                                                outline: "none", fontSize: "0.9375rem", fontWeight: "600", transition: "border-color 0.2s"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "var(--hospital-blue)"}
                                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#334155" }}>Dressing Details</label>
                                    <div style={{ position: "relative" }}>
                                        <i className="fa-solid fa-bandage" style={{ position: "absolute", left: "1rem", top: "1rem", color: "#94a3b8" }}></i>
                                        <input 
                                            type="text" 
                                            placeholder="Sterile dressing applied"
                                            value={formData.dressingDetails}
                                            onChange={(e) => setFormData({...formData, dressingDetails: e.target.value})}
                                            required
                                            style={{ 
                                                width: "100%", padding: "0.875rem 1rem 0.875rem 2.75rem", borderRadius: "12px", border: "1px solid #e2e8f0",
                                                outline: "none", fontSize: "0.9375rem", fontWeight: "600", transition: "border-color 0.2s"
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = "var(--hospital-blue)"}
                                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#334155" }}>Recovery Destination</label>
                                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                    {["PACU", "ICU", "WARD", "DAY_CARE"].map(loc => (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => setFormData({...formData, recoveryLocation: loc})}
                                            style={{ 
                                                padding: "0.75rem 1.5rem", borderRadius: "10px", border: "1px solid",
                                                borderColor: formData.recoveryLocation === loc ? "var(--hospital-blue)" : "#e2e8f0",
                                                backgroundColor: formData.recoveryLocation === loc ? "#eff6ff" : "#fff",
                                                color: formData.recoveryLocation === loc ? "var(--hospital-blue)" : "#64748b",
                                                fontWeight: "800", fontSize: "0.8125rem", cursor: "pointer", transition: "all 0.2s"
                                            }}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: "700", color: "#334155" }}>Immediate Post-Op Condition</label>
                                <textarea 
                                    placeholder="Patient is stable, responding to commands..."
                                    value={formData.immediatePostOpCondition}
                                    onChange={(e) => setFormData({...formData, immediatePostOpCondition: e.target.value})}
                                    required
                                    style={{ 
                                        width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0",
                                        outline: "none", fontSize: "0.9375rem", fontWeight: "600", minHeight: "120px", resize: "none",
                                        fontFamily: "inherit"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "var(--hospital-blue)"}
                                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "1rem", backgroundColor: "#f8fafc" }}>
                    <button 
                        onClick={step === 1 ? onClose : () => setStep(1)}
                        style={{ 
                            padding: "0.75rem 1.75rem", borderRadius: "12px", border: "1px solid #e2e8f0", 
                            backgroundColor: "#fff", color: "#64748b", fontWeight: "800", cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                    >
                        {step === 1 ? "Cancel" : "Back to Protocol"}
                    </button>
                    
                    {step === 1 ? (
                        <button 
                            onClick={() => setStep(2)}
                            disabled={!readiness?.canEnd}
                            style={{ 
                                padding: "0.75rem 2rem", borderRadius: "12px", border: "none", 
                                backgroundColor: readiness?.canEnd ? "var(--hospital-blue)" : "#cbd5e1", 
                                color: "white", fontWeight: "800", cursor: readiness?.canEnd ? "pointer" : "not-allowed",
                                opacity: readiness?.canEnd ? 1 : 0.7, boxShadow: readiness?.canEnd ? "0 10px 15px -3px rgba(2, 132, 199, 0.3)" : "none",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { if(readiness?.canEnd) e.currentTarget.style.transform = "translateY(-1px)" }}
                            onMouseOut={(e) => { if(readiness?.canEnd) e.currentTarget.style.transform = "translateY(0)" }}
                        >
                            Next Step <i className="fa-solid fa-arrow-right" style={{ marginLeft: "0.5rem" }}></i>
                        </button>
                    ) : (
                        <button 
                            form="end-surgery-form" 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                padding: "0.75rem 2.5rem", borderRadius: "12px", border: "none", 
                                backgroundColor: "#10b981", color: "white", fontWeight: "800", cursor: "pointer",
                                boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)", transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Finalize Protocol"}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader { margin: 0 auto; }
            `}</style>
        </div>
    );
};

export default SurgeryEndModal;
