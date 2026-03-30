import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useIntraOp } from "../hooks/useIntraOp";
import { INTRAOP_STATUS } from "../constants/intraop.endpoint";
import { useIVFluids } from "../hooks/useIVFluids";
import { useAnesthesiaDrugs } from "../hooks/useAnesthesiaDrugs";
import IVFluidSection from "./IVFluidSection";

const IntraOpSection = () => {
    const { operationId } = useParams();
    const { 
        loading, 
        fetchIntraOp, 
        createIntraOp, 
        updateIntraOp, 
        updateIntraOpStatus, 
        updateAnesthesiaTime,
        fetchIntraOpSummary 
    } = useIntraOp();
    
    const { getIVFluidSummary } = useIVFluids();
    const { getDrugSummary } = useAnesthesiaDrugs();

    const [record, setRecord] = useState(null);
    const [fluidSummary, setFluidSummary] = useState(null);
    const [drugSummary, setDrugSummary] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [showAbortInput, setShowAbortInput] = useState(false);
    const [abortReason, setAbortReason] = useState("");
    const [summaryData, setSummaryData] = useState(null);

    // Accordion UI State
    const [isMonitorOpen, setIsMonitorOpen] = useState(true);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        procedurePerformed: "",
        incisionType: "",
        woundClosure: "",
        bloodLoss: 0,
        bloodLossUnit: "ML",
        urineOutput: "",
        drainOutput: "",
        intraOpFindings: "",
        specimensCollected: "",
        implantsUsed: "",
        complications: "",
        interventions: "",
        anesthesiaStartTime: "",
        anesthesiaEndTime: ""
    });

    useEffect(() => {
        const loadIntraOp = async () => {
            const res = await fetchIntraOp(operationId);
            if (res.success && res.data) {
                setRecord(res.data);
                setIsUpdate(true);
                setFormData(prev => ({
                    ...prev,
                    ...res.data,
                    // Format dates for input[type="datetime-local"]
                    anesthesiaStartTime: res.data.anesthesiaStartTime ? res.data.anesthesiaStartTime.slice(0, 16) : "",
                    anesthesiaEndTime: res.data.anesthesiaEndTime ? res.data.anesthesiaEndTime.slice(0, 16) : ""
                }));

                if (res.data.status === "COMPLETED") {
                    loadSummary();
                    setIsMonitorOpen(false); // Default to summary if completed
                    setIsSummaryOpen(true);
                }
            }
        };
        loadIntraOp();
    }, [operationId, fetchIntraOp]);

    const loadSummary = async () => {
        const [intraRes, fluidRes, drugRes] = await Promise.all([
            fetchIntraOpSummary(operationId),
            getIVFluidSummary(operationId),
            getDrugSummary(operationId)
        ]);
        
        if (intraRes.success) setSummaryData(intraRes.data);
        if (fluidRes.success) setFluidSummary(fluidRes.data);
        if (drugRes.success) setDrugSummary(drugRes.data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = isUpdate 
            ? await updateIntraOp(operationId, formData) 
            : await createIntraOp(operationId, formData);
        
        if (res.success) {
            alert("Intra-OP record saved successfully!");
            setRecord(res.data);
            setIsUpdate(true);
        } else {
            alert(res.message || "Failed to save record");
        }
    };

    const handleStatusUpdate = async (status, reason = "") => {
        const res = await updateIntraOpStatus(operationId, { status, reason });
        if (res.success) {
            alert(`Surgery status updated to ${status}`);
            setShowAbortInput(false);
            if (status === "COMPLETED") {
                loadSummary();
                setIsMonitorOpen(false);
                setIsSummaryOpen(true);
            }
            // Refresh record
            const refreshed = await fetchIntraOp(operationId);
            if (refreshed.success) setRecord(refreshed.data);
        } else {
            alert(res.message || "Failed to update status");
        }
    };

    const handleAnesthesiaUpdate = async () => {
        const data = {
            anesthesiaStartTime: formData.anesthesiaStartTime,
            anesthesiaEndTime: formData.anesthesiaEndTime
        };
        const res = await updateAnesthesiaTime(operationId, data);
        if (res.success) {
            alert("Anesthesia timing updated!");
        } else {
            alert(res.message || "Failed to update anesthesia time");
        }
    };

    if (loading && !record && !summaryData) return <div style={{ textAlign: "center", padding: "2rem" }}><i className="fa-solid fa-spinner fa-spin"></i> Loading Intra-OP...</div>;

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {/* 🔽 Section 1: Intra-Operative Monitor (Accordion) */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div 
                    onClick={() => setIsMonitorOpen(!isMonitorOpen)}
                    style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", 
                        backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isMonitorOpen ? "1px solid #e2e8f0" : "none" 
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-heart-pulse" style={{ color: "#ef4444", fontSize: "1.2rem" }}></i>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0 }}>Intra-Operative Monitor</h2>
                        {record?.status && (
                            <span style={{ 
                                fontSize: "0.65rem", fontWeight: "900", padding: "0.2rem 0.6rem", borderRadius: "20px",
                                backgroundColor: record.status === "COMPLETED" ? "#dcfce7" : "#eff6ff",
                                color: record.status === "COMPLETED" ? "#166534" : "#1e40af",
                                marginLeft: "0.5rem", textTransform: "uppercase"
                            }}>
                                {record.status}
                            </span>
                        )}
                    </div>
                    <i className={`fa-solid fa-chevron-${isMonitorOpen ? "up" : "down"}`} style={{ color: "#64748b" }}></i>
                </div>

                {isMonitorOpen && (
                    <div style={{ padding: "1.5rem" }}>
                        {isUpdate && (
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                <button type="button" onClick={() => handleStatusUpdate(INTRAOP_STATUS.COMPLETED)} disabled={loading || record?.status === "COMPLETED"} style={{ padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <i className="fa-solid fa-flag-checkered"></i> Complete Intra-OP
                                </button>
                                <button type="button" onClick={() => setShowAbortInput(true)} disabled={loading || record?.status === "ABORTED"} style={{ padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <i className="fa-solid fa-circle-xmark"></i> Abort
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <InputSection title="Procedure Details" icon="fa-solid fa-stethoscope">
                                        <FormInput label="Procedure Performed" name="procedurePerformed" value={formData.procedurePerformed} onChange={handleInputChange} />
                                        <FormInput label="Incision Type" name="incisionType" value={formData.incisionType} onChange={handleInputChange} />
                                        <FormInput label="Wound Closure" name="woundClosure" value={formData.woundClosure} onChange={handleInputChange} />
                                    </InputSection>
                                    <InputSection title="Findings & Specimens" icon="fa-solid fa-vial-circle-check">
                                        <FormInput label="Intra-OP Findings" name="intraOpFindings" type="textarea" value={formData.intraOpFindings} onChange={handleInputChange} />
                                        <FormInput label="Specimens Collected" name="specimensCollected" type="textarea" value={formData.specimensCollected} onChange={handleInputChange} />
                                    </InputSection>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <InputSection title="Fluid Balance" icon="fa-solid fa-droplet">
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                                            <FormInput label="Blood Loss" name="bloodLoss" type="number" value={formData.bloodLoss} onChange={handleInputChange} />
                                            <FormInput label="Unit" name="bloodLossUnit" type="select" options={["ML", "CC"]} value={formData.bloodLossUnit} onChange={handleInputChange} />
                                        </div>
                                        <FormInput label="Urine Output" name="urineOutput" value={formData.urineOutput} onChange={handleInputChange} />
                                    </InputSection>
                                    <InputSection title="Anesthesia Timing" icon="fa-solid fa-clock">
                                        <FormInput label="Anesthesia Start" name="anesthesiaStartTime" type="datetime-local" value={formData.anesthesiaStartTime} onChange={handleInputChange} />
                                        <FormInput label="Anesthesia End" name="anesthesiaEndTime" type="datetime-local" value={formData.anesthesiaEndTime} onChange={handleInputChange} />
                                    </InputSection>
                                </div>
                            </div>

                            <button type="submit" disabled={loading || record?.status === "COMPLETED"} style={{ width: "100%", marginTop: "1.5rem", padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "1rem", textTransform: "uppercase", opacity: (record?.status === "COMPLETED") ? 0.6 : 1 }}>
                                {loading ? "Saving..." : (isUpdate ? "Update Record" : "Create Record")}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* 🔽 Section 3: Intra-OP Summary (Accordion) */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div 
                    onClick={() => {
                        if (summaryData) setIsSummaryOpen(!isSummaryOpen);
                        else alert("Summary available after surgery completion.");
                    }}
                    style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", 
                        backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isSummaryOpen ? "1px solid #e2e8f0" : "none",
                        opacity: summaryData ? 1 : 0.6
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-file-invoice" style={{ color: "var(--hospital-blue)", fontSize: "1.2rem" }}></i>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0 }}>Intra-OP Summary Report</h2>
                        {summaryData && <i className="fa-solid fa-circle-check" style={{ color: "#10b981", fontSize: "0.8rem" }}></i>}
                    </div>
                    <i className={`fa-solid fa-chevron-${isSummaryOpen ? "up" : "down"}`} style={{ color: "#64748b" }}></i>
                </div>

                    {isSummaryOpen && summaryData && (
                        <div style={{ padding: "1.5rem" }}>
                            <SummaryView data={summaryData} fluidSummary={fluidSummary} drugSummary={drugSummary} onEdit={() => setIsMonitorOpen(true)} />
                        </div>
                    )}
            </div>

            {/* Abort Modal */}
            {showAbortInput && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "16px", width: "400px" }}>
                        <h3 style={{ fontWeight: "800", marginBottom: "1rem" }}>Abort Surgery</h3>
                        <textarea placeholder="Specify reason..." value={abortReason} onChange={(e) => setAbortReason(e.target.value)} style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", marginBottom: "1rem" }} />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => handleStatusUpdate(INTRAOP_STATUS.ABORTED, abortReason)} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "700" }}>Confirm ABORT</button>
                            <button onClick={() => setShowAbortInput(false)} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#94a3b8", color: "white", border: "none", borderRadius: "8px", fontWeight: "700" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Summary View ---
const SummaryView = ({ data, fluidSummary, drugSummary, onEdit }) => (
    <div style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                <i className="fa-solid fa-file-invoice" style={{ color: "var(--hospital-blue)", marginRight: "0.75rem" }}></i> Intra-Operative Summary
            </h2>
            <button onClick={onEdit} style={{ padding: "0.6rem 1.25rem", backgroundColor: "#f1f5f9", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Back to Monitoring</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <SummaryCard title="Basic Info" icon="fa-solid fa-id-card">
                <SummaryItem label="Patient Name" value={data.patientName} />
                <SummaryItem label="Reference" value={data.operationReference} />
                <SummaryItem label="Status" value={data.status} isBadge />
            </SummaryCard>

            <SummaryCard title="Timings" icon="fa-solid fa-hourglass-half">
                <SummaryItem label="Surgery Start" value={data.surgeryStartTime?.replace("T", " ")} />
                <SummaryItem label="Surgery Duration" value={`${data.surgeryDurationMinutes} min`} />
                <SummaryItem label="Anesthesia Duration" value={`${data.anesthesiaDurationMinutes} min`} />
            </SummaryCard>

            <SummaryCard title="Surgical Details" icon="fa-solid fa-scissors">
                <SummaryItem label="Procedure" value={data.procedurePerformed} />
                <SummaryItem label="Incision" value={data.incisionType} />
                <SummaryItem label="Wound Closure" value={data.woundClosure} />
            </SummaryCard>

            <SummaryCard title="Clinical Outcome" icon="fa-solid fa-notes-medical">
                <SummaryItem label="Findings" value={data.intraOpFindings} />
                <SummaryItem label="Blood Loss" value={`${data.totalBloodLoss} ${data.bloodLossUnit}`} />
                <SummaryItem label="Urine Output" value={data.urineOutput} />
            </SummaryCard>

            <SummaryCard title="Fluid Administration" icon="fa-solid fa-droplet">
                <SummaryItem label="Total Intake" value={`${fluidSummary?.totalVolumeML || 0} ML`} />
                <SummaryItem label="Fluid Types" value={Object.keys(fluidSummary?.byFluidType || {}).join(", ") || "None"} />
                <SummaryItem label="Avg Bolus" value={fluidSummary ? `${(fluidSummary.totalVolumeML / (fluidSummary.completedFluidsCount + fluidSummary.ongoingFluidsCount || 1)).toFixed(0)} ML` : "0 ML"} />
            </SummaryCard>

            <SummaryCard title="Medication Summary" icon="fa-solid fa-syringe">
                <SummaryItem label="Total Drugs" value={drugSummary?.totalDrugs || 0} />
                <SummaryItem label="Induction Agent" value={drugSummary?.byDrugType?.INDUCTION ? "Yes" : "None"} />
                <SummaryItem label="Analgesics" value={drugSummary?.byDrugType?.ANALGESIC || 0} />
            </SummaryCard>
        </div>
    </div>
);

const SummaryCard = ({ title, children, icon }) => (
    <div style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "1.25rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <i className={icon} style={{ color: "var(--hospital-blue)" }}></i> {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>
    </div>
);

const SummaryItem = ({ label, value, isBadge }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>{label}:</span>
        {isBadge ? (
            <span style={{ fontSize: "0.7rem", fontWeight: "900", padding: "0.2rem 0.6rem", borderRadius: "20px", backgroundColor: "#10b98120", color: "#10b981", textTransform: "uppercase" }}>{value}</span>
        ) : (
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1e293b", textAlign: "right", maxWidth: "200px" }}>{value || "N/A"}</span>
        )}
    </div>
);

// --- Form Helpers ---
const InputSection = ({ title, children, icon }) => (
    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: "800", marginBottom: "1.25rem", color: "#334155", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className={icon} style={{ color: "var(--hospital-blue)" }}></i> {title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{children}</div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, placeholder, options }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", marginBottom: "0.4rem", color: "#64748b" }}>{label}</label>
        {type === "select" ? (
            <select name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : type === "textarea" ? (
            <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", height: "80px", resize: "none", fontWeight: "600" }} />
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700" }} />
        )}
    </div>
);

export default IntraOpSection;
