import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useVitals } from "../hooks/useVitals";
import { CONSCIOUSNESS_OPTIONS, SEDATION_OPTIONS } from "../constants/vitals.endpoint";

const VitalsSection = () => {
    const { operationId } = useParams();
    const { loading, createVitals, getAllVitals, getLatestVitals, deleteVitals } = useVitals();

    const [vitalsHistory, setVitalsHistory] = useState([]);
    const [latestVitals, setLatestVitals] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const [formData, setFormData] = useState({
        heartRate: "",
        systolicBp: "",
        diastolicBp: "",
        meanBp: "",
        respiratoryRate: "",
        temperature: "",
        oxygenSaturation: "",
        etco2: "",
        painScale: "",
        consciousness: "Alert",
        sedationScore: "",
        additionalNotes: "",
        phase: "INTRA_OP",
        isStable: true
    });

    const refreshData = useCallback(async () => {
        const [allRes, latestRes] = await Promise.all([
            getAllVitals(operationId),
            getLatestVitals(operationId)
        ]);

        if (allRes.success) {
            const data = allRes.data;
            setVitalsHistory(Array.isArray(data) ? data : []);
        }
        if (latestRes.success) setLatestVitals(latestRes.data);
    }, [operationId, getAllVitals, getLatestVitals]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === "checkbox" ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Build payload — convert numeric fields
        const payload = {
            ...formData,
            heartRate: formData.heartRate ? Number(formData.heartRate) : null,
            systolicBp: formData.systolicBp ? Number(formData.systolicBp) : null,
            diastolicBp: formData.diastolicBp ? Number(formData.diastolicBp) : null,
            meanBp: formData.meanBp ? Number(formData.meanBp) : null,
            respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : null,
            temperature: formData.temperature ? Number(formData.temperature) : null,
            oxygenSaturation: formData.oxygenSaturation ? Number(formData.oxygenSaturation) : null,
            etco2: formData.etco2 ? Number(formData.etco2) : null,
            painScale: formData.painScale ? Number(formData.painScale) : null,
            sedationScore: formData.sedationScore || null,
            additionalNotes: formData.additionalNotes || null,
            phase: formData.phase,
            isStable: formData.isStable
        };

        const res = await createVitals(operationId, payload);
        if (res.success) {
            alert("Vitals recorded successfully!");
            setIsFormOpen(false);
            setFormData({
                heartRate: "", systolicBp: "", diastolicBp: "", meanBp: "",
                respiratoryRate: "", temperature: "", oxygenSaturation: "", etco2: "",
                painScale: "", consciousness: "Alert", sedationScore: "", additionalNotes: "",
                phase: "INTRA_OP", isStable: true
            });
            refreshData();
        } else {
            alert(res.message || "Failed to record vitals");
        }
    };

    const handleDelete = async (vitalId) => {
        if (!window.confirm("Delete this vitals record?")) return;
        const res = await deleteVitals(operationId, vitalId);
        if (res.success) refreshData();
        else alert(res.message || "Failed to delete");
    };

    // Vital card configs for the live monitor grid
    const vitalCards = [
        { key: "heartRate", label: "Heart Rate", unit: "bpm", icon: "fa-solid fa-heart-pulse", color: "#22c55e", range: "60-100" },
        { key: "systolicBp", label: "Systolic BP", unit: "mmHg", icon: "fa-solid fa-arrow-up", color: "#ef4444", range: "90-140", secondary: { key: "diastolicBp", label: "Diastolic", unit: "mmHg" } },
        { key: "oxygenSaturation", label: "SpO₂", unit: "%", icon: "fa-solid fa-lungs", color: "#06b6d4", range: "95-100" },
        { key: "temperature", label: "Temp", unit: "°C", icon: "fa-solid fa-temperature-half", color: "#f59e0b", range: "36.0-37.5" },
        { key: "respiratoryRate", label: "Resp. Rate", unit: "/min", icon: "fa-solid fa-wind", color: "#8b5cf6", range: "12-20" },
        { key: "meanBp", label: "MAP", unit: "mmHg", icon: "fa-solid fa-gauge-high", color: "#6366f1", range: "70-105" },
        { key: "etco2", label: "EtCO₂", unit: "mmHg", icon: "fa-solid fa-cloud", color: "#14b8a6", range: "35-45" },
        { key: "painScale", label: "Pain", unit: "/10", icon: "fa-solid fa-face-grimace", color: "#64748b", range: "0-10" }
    ];

    const formatTime = (isoStr) => {
        if (!isoStr) return "N/A";
        const d = new Date(isoStr);
        return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.75rem", margin: 0 }}>
                    <i className="fa-solid fa-gauge-high" style={{ color: "var(--hospital-blue)" }}></i> Physiological Monitoring
                </h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={refreshData}
                        disabled={loading}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: "700", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        <i className={`fa-solid fa-rotate ${loading ? "fa-spin" : ""}`}></i> Refresh
                    </button>
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: "700", border: "none", borderRadius: "8px", backgroundColor: isFormOpen ? "#e2e8f0" : "var(--hospital-blue)", color: isFormOpen ? "#475569" : "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        <i className={`fa-solid ${isFormOpen ? "fa-xmark" : "fa-plus"}`}></i>
                        {isFormOpen ? "Close" : "Record Vitals"}
                    </button>
                </div>
            </div>

            {/* Record Vitals Form (Accordion) - MOVED TO TOP */}
            {isFormOpen && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ padding: "1rem 1.25rem", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: "var(--hospital-blue)" }}></i>
                        <h3 style={{ fontSize: "0.9rem", fontWeight: "800", margin: 0, color: "#334155" }}>Record New Vitals</h3>
                    </div>
                    <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                            <FormInput label="Heart Rate (bpm)" name="heartRate" type="number" value={formData.heartRate} onChange={handleInputChange} placeholder="72" />
                            <FormInput label="Systolic BP (mmHg)" name="systolicBp" type="number" value={formData.systolicBp} onChange={handleInputChange} placeholder="120" />
                            <FormInput label="Diastolic BP (mmHg)" name="diastolicBp" type="number" value={formData.diastolicBp} onChange={handleInputChange} placeholder="80" />
                            <FormInput label="MAP (mmHg)" name="meanBp" type="number" value={formData.meanBp} onChange={handleInputChange} placeholder="93" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                            <FormInput label="Resp. Rate (/min)" name="respiratoryRate" type="number" value={formData.respiratoryRate} onChange={handleInputChange} placeholder="16" />
                            <FormInput label="Temp. (°C)" name="temperature" type="number" value={formData.temperature} onChange={handleInputChange} placeholder="36.7" step="0.1" />
                            <FormInput label="SpO₂ (%)" name="oxygenSaturation" type="number" value={formData.oxygenSaturation} onChange={handleInputChange} placeholder="98" />
                            <FormInput label="EtCO₂ (mmHg)" name="etco2" type="number" value={formData.etco2} onChange={handleInputChange} placeholder="35" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <FormInput label="Pain Scale (0-10)" name="painScale" type="number" value={formData.painScale} onChange={handleInputChange} placeholder="3" min="0" max="10" />
                            <FormSelect label="Consciousness" name="consciousness" value={formData.consciousness} onChange={handleInputChange} options={CONSCIOUSNESS_OPTIONS} />
                            <FormSelect label="Sedation Score" name="sedationScore" value={formData.sedationScore} onChange={handleInputChange} options={["", ...SEDATION_OPTIONS]} />
                            <FormSelect label="Phase" name="phase" value={formData.phase} onChange={handleInputChange} options={["INTRA_OP", "POST_OP"]} />
                            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.4rem" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: "800", color: "#334155", cursor: "pointer" }}>
                                    <input 
                                        type="checkbox" 
                                        name="isStable" 
                                        checked={formData.isStable} 
                                        onChange={handleInputChange} 
                                        style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }} 
                                    />
                                    Mark Patient as Stable
                                </label>
                            </div>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>Additional Notes</label>
                            <textarea
                                name="additionalNotes"
                                value={formData.additionalNotes}
                                onChange={handleInputChange}
                                placeholder="Clinical observations..."
                                style={{ width: "100%", padding: "0.6rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", height: "60px", resize: "none", fontWeight: "600", fontSize: "0.8rem" }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "0.85rem", backgroundColor: "var(--hospital-blue)", color: "white",
                                border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.9rem",
                                textTransform: "uppercase", opacity: loading ? 0.7 : 1,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                            }}
                        >
                            <i className="fa-solid fa-heart-pulse"></i>
                            {loading ? "Saving..." : "Record Vitals"}
                        </button>
                    </form>
                </div>
            )}

            {/* Latest vitals timestamp */}
            {latestVitals && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 1rem", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: "0.5rem", animation: "pulse 2s infinite" }}></i>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#166534" }}>
                            Last recorded: {formatTime(latestVitals.recordedTime)} by <strong>{latestVitals.recordedBy}</strong>
                        </span>
                    </div>
                    {latestVitals.phase && (
                        <span style={{ 
                            fontSize: "0.65rem", fontWeight: "900", padding: "0.2rem 0.6rem", borderRadius: "6px",
                            backgroundColor: latestVitals.phase === "INTRA_OP" ? "#fee2e2" : "#e0f2fe",
                            color: latestVitals.phase === "INTRA_OP" ? "#991b1b" : "#075985",
                            border: "1px solid currentColor"
                        }}>
                            {latestVitals.phase === "INTRA_OP" ? "INTRA-OPERATIVE PHASE" : "POST-OPERATIVE PHASE"}
                        </span>
                    )}
                </div>
            )}

            {/* Live Monitor Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {vitalCards.map(card => {
                    const val = latestVitals?.[card.key];
                    return (
                        <div key={card.key} style={{
                            backgroundColor: "white", padding: "0.8rem", borderRadius: "10px",
                            border: `1px solid ${card.color}25`, textAlign: "left",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)", position: "relative",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                                    <i className={card.icon} style={{ color: card.color, fontSize: "0.7rem" }}></i>
                                    <span style={{ fontSize: "0.65rem", fontWeight: "900", color: "#475569", textTransform: "uppercase", letterSpacing: "0.02em" }}>{card.label}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                                    <div style={{ fontSize: "1.7rem", fontWeight: "900", color: val != null ? card.color : "#cbd5e1", lineHeight: 1 }}>
                                        {val != null ? val : "—"}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800" }}>{card.unit}</div>
                                </div>
                                {card.secondary && latestVitals?.[card.secondary.key] != null && (
                                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#0f172a", marginTop: "0.2rem" }}>
                                        {card.secondary.label}: <span style={{ color: card.color }}>{latestVitals[card.secondary.key]}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ 
                                padding: "0.3rem 0.5rem", 
                                backgroundColor: "#f8fafc", 
                                borderRadius: "6px",
                                textAlign: "right",
                                border: "1px solid #f1f5f9"
                            }}>
                                <div style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.1rem" }}>Normal</div>
                                <div style={{ fontSize: "0.7rem", color: "#0f172a", fontWeight: "900" }}>{card.range}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Extra Info Cards: Consciousness, Sedation, Notes */}
            {latestVitals && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                    <InfoCard icon="fa-solid fa-brain" label="Consciousness" value={latestVitals.consciousness} color="#8b5cf6" />
                    <InfoCard icon="fa-solid fa-bed" label="Sedation" value={latestVitals.sedationScore || "None"} color="#6366f1" />
                    <InfoCard 
                        icon={latestVitals.isStable ? "fa-solid fa-check-circle" : "fa-solid fa-triangle-exclamation"} 
                        label="Patient State" 
                        value={latestVitals.isStable ? "STABLE" : "INSTABILITY DETECTED"} 
                        color={latestVitals.isStable ? "#10b981" : "#ef4444"} 
                    />
                    <InfoCard icon="fa-solid fa-note-sticky" label="Notes" value={latestVitals.additionalNotes || "No notes"} color="#64748b" />
                </div>
            )}


            {/* Vitals History Accordion */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem",
                        backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isHistoryOpen ? "1px solid #e2e8f0" : "none"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--hospital-blue)" }}></i>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "#334155" }}>
                            Vitals History
                        </h4>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", padding: "0.15rem 0.5rem", borderRadius: "20px", backgroundColor: "#eff6ff", color: "var(--hospital-blue)" }}>
                            {vitalsHistory.length} records
                        </span>
                    </div>
                    <i className={`fa-solid fa-chevron-${isHistoryOpen ? "up" : "down"}`} style={{ color: "#64748b", fontSize: "0.8rem" }}></i>
                </div>

                {isHistoryOpen && (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={thStyle}>Time</th>
                                    <th style={thStyle}>HR</th>
                                    <th style={thStyle}>BP</th>
                                    <th style={thStyle}>MAP</th>
                                    <th style={thStyle}>SpO₂</th>
                                    <th style={thStyle}>Temp</th>
                                    <th style={thStyle}>RR</th>
                                    <th style={thStyle}>EtCO₂</th>
                                    <th style={thStyle}>Pain</th>
                                    <th style={thStyle}>Consciousness</th>
                                    <th style={thStyle}>Sedation</th>
                                    <th style={thStyle}>Staff</th>
                                    <th style={thStyle}>Phase</th>
                                    <th style={thStyle}>Stability</th>
                                    <th style={thStyle}>Notes</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vitalsHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="14" style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: "600" }}>
                                            <i className="fa-solid fa-chart-line" style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.75rem", color: "#e2e8f0" }}></i>
                                            No vitals recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    [...vitalsHistory].reverse().map(v => (
                                        <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>{formatTime(v.recordedTime)}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.heartRate} unit="bpm" color="#ef4444" />
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: "800", fontSize: "0.8rem" }}>{v.systolicBp ?? "—"}/{v.diastolicBp ?? "—"}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.meanBp} unit="" color="#6366f1" />
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.oxygenSaturation} unit="%" color="#10b981" />
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.temperature} unit="°C" color="#f59e0b" />
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.respiratoryRate} unit="" color="#8b5cf6" />
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.etco2} unit="" color="#0ea5e9" />
                                            </td>
                                            <td style={tdStyle}>
                                                <VitalBadge value={v.painScale} unit="/10" color="#dc2626" />
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>{v.consciousness || "—"}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#475569" }}>{v.sedationScore || "—"}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#64748b" }}>{v.recordedBy || "—"}</span>
                                            </td>
                                            <td style={tdStyle}>
                                                {v.phase ? (
                                                    <span style={{ 
                                                        fontSize: "0.65rem", fontWeight: "900", padding: "0.15rem 0.4rem", borderRadius: "4px",
                                                        backgroundColor: v.phase === "INTRA_OP" ? "#fdf2f2" : "#f0f9ff",
                                                        color: v.phase === "INTRA_OP" ? "#991b1b" : "#075985"
                                                    }}>
                                                        {v.phase === "INTRA_OP" ? "INTRA" : "POST"}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td style={tdStyle}>
                                                {v.isStable !== null ? (
                                                    <i className={`fa-solid ${v.isStable ? "fa-circle-check" : "fa-circle-exclamation"}`} 
                                                       style={{ color: v.isStable ? "#10b981" : "#ef4444" }}></i>
                                                ) : "—"}
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ fontSize: "0.65rem", fontWeight: "600", color: "#94a3b8", maxWidth: "120px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={v.additionalNotes || ""}>
                                                    {v.additionalNotes || "—"}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    style={{
                                                        width: "26px", height: "26px", borderRadius: "6px", border: "none",
                                                        backgroundColor: "#fef2f2", color: "#ef4444", cursor: "pointer",
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem"
                                                    }}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Helper Components ---

const InfoCard = ({ icon, label, value, color }) => (
    <div style={{ padding: "0.8rem 1rem", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.8rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={icon} style={{ color, fontSize: "0.9rem" }}></i>
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#475569", textTransform: "uppercase", letterSpacing: "0.02em" }}>{label}</div>
            <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={value}>{value ?? "N/A"}</div>
        </div>
    </div>
);

const VitalBadge = ({ value, unit, color }) => (
    <span style={{ fontSize: "0.8rem", fontWeight: "800", color: value != null ? color : "#cbd5e1" }}>
        {value != null ? `${value}${unit}` : "—"}
    </span>
);

const FormInput = ({ label, name, type = "text", value, onChange, placeholder, step, min, max }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        <input
            type={type}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }}
        />
    </div>
);

const FormSelect = ({ label, name, value, onChange, options }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }}
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{opt || "— Select —"}</option>
            ))}
        </select>
    </div>
);

const thStyle = { textAlign: "left", padding: "0.6rem 0.75rem", fontSize: "0.6rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" };
const tdStyle = { padding: "0.6rem 0.75rem", fontSize: "0.8rem", fontWeight: "700" };

export default VitalsSection;
