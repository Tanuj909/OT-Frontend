import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePreop } from "../hooks/usePreop";
import { ASA_GRADES, NPO_STATUSES, ASSESSMENT_STATUS } from "../constants/preop.endpoint";

const PreOpSection = ({ onStatusUpdate }) => {
    const { operationId } = useParams();
    const { loading, fetchPreop, savePreop, updatePreopStatus } = usePreop();
    const [assessment, setAssessment] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [reassessmentReason, setReassessmentReason] = useState("");
    const [showReassessmentInput, setShowReassessmentInput] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        height: "", weight: "", bloodGroup: "",
        allergies: "", currentMedications: "",
        pastMedicalHistory: "", pastSurgicalHistory: "",
        physicalExamination: "", fitForSurgery: false,
        clearanceRemarks: "", airwayAssessment: "",
        consentTaken: false, highRisk: false,
        checklistCompleted: false, ecgFindings: "",
        labResults: "", radiologyFindings: "",
        asaGrade: "ASA1", npoStatus: "NOT_NPO",
        anesthesiaPlan: "", specialInstructions: ""
    });

    useEffect(() => {
        const loadAssessment = async () => {
            const res = await fetchPreop(operationId);
            if (res.success && res.data) {
                setAssessment(res.data);
                setIsUpdate(true);
                // Map existing data to form
                setFormData(prev => ({
                    ...prev,
                    ...res.data
                }));
            }
        };
        loadAssessment();
    }, [operationId, fetchPreop]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await savePreop(operationId, formData, isUpdate);
        if (res.success) {
            alert("Assessment saved successfully!");
            if (onStatusUpdate) onStatusUpdate();
            // Optionally refresh or update state
        } else {
            alert(res.message || "Failed to save assessment");
        }
    };

    const handleStatusUpdate = async (newStatus, reason = "") => {
        const payload = { status: newStatus };
        if (reason) payload.reason = reason;

        const res = await updatePreopStatus(operationId, payload);
        if (res.success) {
            alert(`Status updated to ${newStatus}`);
            setShowReassessmentInput(false);
            setReassessmentReason("");
            if (onStatusUpdate) onStatusUpdate();
            // Refresh assessment data
            const refreshed = await fetchPreop(operationId);
            if (refreshed.success) setAssessment(refreshed.data);
        } else {
            alert(res.message || "Failed to update status");
        }
    };

    if (loading && !assessment) return <div style={{ textAlign: "center", padding: "2rem" }}><i className="fa-solid fa-spinner fa-spin"></i> Loading Assessment...</div>;



    return (
        <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.75rem", margin: 0 }}>
                    <i className="fa-solid fa-clipboard-check" style={{ color: "var(--hospital-blue)" }}></i> Pre-Operative Assessment
                </h2>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {assessment?.status && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "#64748b" }}>Status:</span>
                            <span style={{ 
                                fontSize: "0.75rem", fontWeight: "800", padding: "0.3rem 0.7rem", borderRadius: "20px",
                                backgroundColor: assessment.status === "COMPLETED" ? "#dcfce7" : "#fef9c3",
                                color: assessment.status === "COMPLETED" ? "#166534" : "#854d0e",
                                border: `1px solid ${assessment.status === "COMPLETED" ? "#86efac" : "#fde047"}`
                            }}>
                                {assessment.status.replace("_", " ")}
                            </span>
                        </div>
                    )}

                    {isUpdate && (
                        <div style={{ display: "flex", gap: "0.5rem", borderLeft: "1px solid #e2e8f0", paddingLeft: "1rem" }}>
                            <button 
                                type="button" 
                                onClick={() => handleStatusUpdate("COMPLETED")}
                                disabled={loading || assessment?.status === "COMPLETED"}
                                title="Mark as Completed"
                                style={{ 
                                    padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white", 
                                    border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                                    fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem",
                                    opacity: (loading || assessment?.status === "COMPLETED") ? 0.6 : 1
                                }}
                            >
                                <i className="fa-solid fa-check-circle"></i> Complete
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowReassessmentInput(true)}
                                disabled={loading}
                                title="Request Reassessment"
                                style={{ 
                                    padding: "0.5rem 1rem", backgroundColor: "#f59e0b", color: "white", 
                                    border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                                    fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem"
                                }}
                            >
                                <i className="fa-solid fa-rotate-left"></i> Reassess
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reassessment Reason Modal Overlay */}
            {showReassessmentInput && (
                <div style={{ 
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", 
                    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 
                }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", width: "400px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem", color: "#1e293b" }}>Request Reassessment</h3>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>Please provide a reason for requiring a reassessment.</p>
                        <textarea 
                            autoFocus
                            placeholder="Reason for reassessment..."
                            value={reassessmentReason}
                            onChange={(e) => setReassessmentReason(e.target.value)}
                            style={{ 
                                width: "100%", padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0", 
                                marginBottom: "1.5rem", height: "100px", resize: "none", fontWeight: "600" 
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button 
                                onClick={() => handleStatusUpdate("REASSESSMENT_REQUIRED", reassessmentReason)}
                                style={{ flex: 1, padding: "0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                            >
                                Submit Request
                            </button>
                            <button 
                                onClick={() => setShowReassessmentInput(false)}
                                style={{ flex: 1, padding: "0.75rem", backgroundColor: "#94a3b8", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <InputSection title="Vitals & Basic Metrics" icon="fa-solid fa-weight-scale">
                    <FormInput label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleInputChange} />
                    <FormInput label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} />
                    <FormInput label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} />
                    <FormInput label="Allergies" name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="e.g. Penicillin, Latex" />
                </InputSection>

                <InputSection title="Clinical History" icon="fa-solid fa-book-medical">
                    <FormInput label="Past Medical History" name="pastMedicalHistory" type="textarea" value={formData.pastMedicalHistory} onChange={handleInputChange} placeholder="Diabetes, Hypertension, etc." />
                    <FormInput label="Past Surgical History" name="pastSurgicalHistory" type="textarea" value={formData.pastSurgicalHistory} onChange={handleInputChange} />
                    <FormInput label="Current Medications" name="currentMedications" type="textarea" value={formData.currentMedications} onChange={handleInputChange} />
                    <FormInput label="Physical Examination" name="physicalExamination" type="textarea" value={formData.physicalExamination} onChange={handleInputChange} />
                </InputSection>

                <InputSection title="Investigations" icon="fa-solid fa-microscope">
                    <FormInput label="ECG Findings" name="ecgFindings" type="textarea" value={formData.ecgFindings} onChange={handleInputChange} />
                    <FormInput label="Lab Results" name="labResults" type="textarea" value={formData.labResults} onChange={handleInputChange} />
                    <FormInput label="Radiology Findings" name="radiologyFindings" type="textarea" value={formData.radiologyFindings} onChange={handleInputChange} />
                </InputSection>

                <InputSection title="Surgical Clearance" icon="fa-solid fa-check-double">
                    <FormInput label="ASA Grade" name="asaGrade" type="select" options={ASA_GRADES} value={formData.asaGrade} onChange={handleInputChange} />
                    <FormInput label="NPO Status" name="npoStatus" type="select" options={NPO_STATUSES} value={formData.npoStatus} onChange={handleInputChange} />
                    <FormInput label="Airway Assessment" name="airwayAssessment" value={formData.airwayAssessment} onChange={handleInputChange} placeholder="Mallampati Grade" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <FormInput label="Consent Taken" name="consentTaken" type="checkbox" value={formData.consentTaken} onChange={handleInputChange} />
                        <FormInput label="High Risk" name="highRisk" type="checkbox" value={formData.highRisk} onChange={handleInputChange} />
                        <FormInput label="Checklist Completed" name="checklistCompleted" type="checkbox" value={formData.checklistCompleted} onChange={handleInputChange} />
                        <FormInput label="Fit For Surgery" name="fitForSurgery" type="checkbox" value={formData.fitForSurgery} onChange={handleInputChange} />
                    </div>
                </InputSection>

                <InputSection title="Anesthesia Plan" icon="fa-solid fa-syringe">
                    <FormInput label="Anesthesia Plan" name="anesthesiaPlan" type="textarea" value={formData.anesthesiaPlan} onChange={handleInputChange} placeholder="General, Local, Spinal..." />
                    <FormInput label="Special Instructions" name="specialInstructions" type="textarea" value={formData.specialInstructions} onChange={handleInputChange} />
                    <FormInput label="Clearance Remarks" name="clearanceRemarks" type="textarea" value={formData.clearanceRemarks} onChange={handleInputChange} />
                </InputSection>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            flex: 1, padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                            border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer",
                            fontSize: "1rem", textTransform: "uppercase", boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
                        }}
                    >
                        {loading ? "Saving..." : (isUpdate ? "Update Pre-Op Assessment" : "Save Pre-Op Assessment")}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Sub-components (defined outside to prevent re-creation on render) ---
const InputSection = ({ title, children, icon }) => (
    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "1.25rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className={icon} style={{ color: "var(--hospital-blue)" }}></i> {title}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {children}
        </div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, placeholder, options }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", marginBottom: "0.4rem", color: "#64748b" }}>{label}</label>
        {type === "select" ? (
            <select name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}>
                {options.map(opt => (
                    <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
                ))}
            </select>
        ) : type === "textarea" ? (
            <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", height: "80px", resize: "none", fontWeight: "600" }} />
        ) : type === "checkbox" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
                <input type="checkbox" name={name} checked={value} onChange={onChange} style={{ width: "20px", height: "20px" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#334155" }}>{label}</span>
            </div>
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }} />
        )}
    </div>
);

export default PreOpSection;
