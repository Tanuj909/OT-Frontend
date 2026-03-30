import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAnesthesiaDrugs } from "../hooks/useAnesthesiaDrugs";
import { DRUG_TYPES, DRUG_ROUTES } from "../constants/anesthesiaDrug.endpoint";

const AnesthesiaDrugSection = () => {
    const { operationId } = useParams();
    const { 
        loading, 
        addDrug, 
        getDrugs, 
        updateDrug, 
        removeDrug, 
        getDrugSummary 
    } = useAnesthesiaDrugs();

    const [drugs, setDrugs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [editingDrug, setEditingDrug] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        drugName: "",
        dose: "",
        doseUnit: "mg",
        route: "IV",
        drugType: "INDUCTION",
        administeredAt: new Date().toISOString().slice(0, 16),
        endTime: "",
        notes: ""
    });

    const refreshData = useCallback(async () => {
        const [drugsRes, summaryRes] = await Promise.all([
            getDrugs(operationId),
            getDrugSummary(operationId)
        ]);
        
        if (drugsRes.success) {
            const drugsData = drugsRes.data;
            setDrugs(Array.isArray(drugsData) ? drugsData : []);
        }
        if (summaryRes.success) setSummary(summaryRes.data);
    }, [operationId, getDrugs, getDrugSummary]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = editingDrug 
            ? await updateDrug(operationId, editingDrug.id, formData)
            : await addDrug(operationId, formData);
            
        if (res.success) {
            setIsFormOpen(false);
            setEditingDrug(null);
            setFormData({
                drugName: "",
                dose: "",
                doseUnit: "mg",
                route: "IV",
                drugType: "INDUCTION",
                administeredAt: new Date().toISOString().slice(0, 16),
                endTime: "",
                notes: ""
            });
            refreshData();
        } else {
            alert(res.message);
        }
    };

    const handleEdit = (drug) => {
        setEditingDrug(drug);
        setFormData({
            drugName: drug.drugName,
            dose: drug.dose,
            doseUnit: drug.doseUnit,
            route: drug.route,
            drugType: drug.drugType,
            administeredAt: drug.administeredAt ? drug.administeredAt.slice(0, 16) : "",
            endTime: drug.endTime ? drug.endTime.slice(0, 16) : "",
            notes: drug.notes || ""
        });
        setIsFormOpen(true);
    };

    const handleRemove = async (drugId) => {
        if (!window.confirm("Remove this entry?")) return;
        const res = await removeDrug(operationId, drugId);
        if (res.success) refreshData();
    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 📊 Summary Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                <SmallSummaryCard label="Total Drugs" value={summary?.totalDrugs || 0} icon="fa-solid fa-pills" color="#8b5cf6" />
                <SmallSummaryCard label="Induction" value={safeCount(summary?.byDrugType?.INDUCTION)} icon="fa-solid fa-syringe" color="#3b82f6" />
                <SmallSummaryCard label="Analgesic" value={safeCount(summary?.byDrugType?.ANALGESIC)} icon="fa-solid fa-tablets" color="#ef4444" />
                <SmallSummaryCard label="Other" value={(summary?.totalDrugs || 0) - (safeCount(summary?.byDrugType?.INDUCTION) + safeCount(summary?.byDrugType?.ANALGESIC))} icon="fa-solid fa-flask" color="#64748b" />
            </div>

            {/* ➕ Entry Form Section */}
            <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "#334155", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-notes-medical" style={{ color: "var(--hospital-blue)" }}></i>
                        {editingDrug ? "Edit Medication" : "Log New Medication"}
                    </h3>
                    <button 
                        onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) { setEditingDrug(null); } }}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: "700", border: "none", borderRadius: "6px", backgroundColor: isFormOpen ? "#e2e8f0" : "var(--hospital-blue)", color: isFormOpen ? "#475569" : "white", cursor: "pointer" }}
                    >
                        {isFormOpen ? "Close Form" : "Add Medication"}
                    </button>
                </div>

                {isFormOpen && (
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
                        <FormInput label="Drug Name" name="drugName" value={formData.drugName} onChange={handleInputChange} placeholder="e.g. Propofol" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: "0.4rem" }}>
                            <FormInput label="Dose" name="dose" type="number" value={formData.dose} onChange={handleInputChange} />
                            <FormInput label="Unit" name="doseUnit" type="select" options={["mg", "mcg", "ml", "g"]} value={formData.doseUnit} onChange={handleInputChange} />
                        </div>
                        <FormInput label="Type" name="drugType" type="select" options={DRUG_TYPES} value={formData.drugType} onChange={handleInputChange} />
                        <FormInput label="Route" name="route" type="select" options={DRUG_ROUTES} value={formData.route} onChange={handleInputChange} />
                        <FormInput label="Start Time" name="administeredAt" type="datetime-local" value={formData.administeredAt} onChange={handleInputChange} />
                        <FormInput label="End Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleInputChange} />
                        <button type="submit" style={{ padding: "0.70rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                            {editingDrug ? "Update" : "Log Drug"}
                        </button>
                    </form>
                )}
            </div>

            {/* 📋 Drug Ledger */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Drug Name</th>
                            <th style={thStyle}>Dosage</th>
                             <th style={thStyle}>Type/Route</th>
                            <th style={thStyle}>Timeline</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drugs.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600" }}>No medications logged for this procedure.</td></tr>
                        ) : (
                            drugs.map(drug => (
                                <tr key={drug.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}><span style={{ fontWeight: "800", color: "#1e293b" }}>{drug.drugName}</span></td>
                                    <td style={tdStyle}>{drug.dose} {drug.doseUnit}</td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#3b82f6" }}>{drug.drugType}</div>
                                        <div style={{ fontSize: "0.6rem", color: "#64748b" }}>via {drug.route}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1e293b" }}>
                                            <i className="fa-solid fa-play" style={{ fontSize: "0.6rem", color: "#22c55e", marginRight: "0.3rem" }}></i>
                                            {drug.administeredAt?.replace("T", " ").slice(0, 16)}
                                        </div>
                                        {drug.endTime && (
                                            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginTop: "0.2rem" }}>
                                                <i className="fa-solid fa-stop" style={{ fontSize: "0.6rem", color: "#ef4444", marginRight: "0.3rem" }}></i>
                                                {drug.endTime.replace("T", " ").slice(0, 16)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            <button onClick={() => handleEdit(drug)} style={miniBtn("#2563eb")}><i className="fa-solid fa-edit"></i></button>
                                            <button onClick={() => handleRemove(drug.id)} style={miniBtn("#ef4444")}><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🔽 Anesthesia Summary (Accordion) */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", backgroundColor: "white" }}>
                <div 
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", 
                        backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isSummaryOpen ? "1px solid #e2e8f0" : "none"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: "var(--hospital-blue)" }}></i>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "#334155" }}>Medication Summary Details</h4>
                    </div>
                    <i className={`fa-solid fa-chevron-${isSummaryOpen ? "up" : "down"}`} style={{ color: "#64748b", fontSize: "0.8rem" }}></i>
                </div>
                {isSummaryOpen && (
                    <div style={{ padding: "1rem", backgroundColor: "white" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <div style={{ padding: "0.75rem", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#0369a1", textTransform: "uppercase" }}>Total Medications</div>
                                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0c4a6e" }}>{summary?.totalDrugs || 0} Records</div>
                                </div>
                                <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Breakdown by Type</div>
                                    {Object.entries(summary?.byDrugType || {}).map(([type, val]) => (
                                        <div key={type} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", padding: "0.2rem 0" }}>
                                            <span>{type}:</span>
                                            <span style={{ color: "var(--hospital-blue)" }}>{safeCount(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>Total Dosage by Drug</div>
                                {Object.entries(summary?.totalDoseByDrug || {}).map(([drug, dose]) => (
                                    <div key={drug} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", padding: "0.2rem 0", borderBottom: "1px dashed #e2e8f0" }}>
                                        <span>{drug}</span>
                                        <span style={{ color: "#ef4444" }}>{typeof dose === "object" ? (dose?.totalDose ?? JSON.stringify(dose)) : dose}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Safe count extractor: handles arrays (returns .length), numbers, or defaults to 0
const safeCount = (val) => {
    if (Array.isArray(val)) return val.length;
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) return Object.keys(val).length;
    return val || 0;
};

// --- Helpers ---
const SmallSummaryCard = ({ label, value, icon, color }) => (
    <div style={{ padding: "0.75rem 1rem", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <i className={icon} style={{ color, fontSize: "1rem" }}></i>
        <div>
            <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b" }}>{value}</div>
        </div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, options, placeholder }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        {type === "select" ? (
            <select name={name} value={value ?? ""} onChange={onChange} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.75rem" }}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input type={type} name={name} value={value ?? ""} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.75rem" }} />
        )}
    </div>
);

const thStyle = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: "700" };
const miniBtn = (color) => ({ width: "24px", height: "24px", borderRadius: "5px", border: "none", backgroundColor: `${color}15`, color: color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" });

export default AnesthesiaDrugSection;
