import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useIVFluids } from "../hooks/useIVFluids";

const IVFluidSection = () => {
    const { operationId } = useParams();
    const { 
        loading, 
        addIVFluid, 
        getIVFluids, 
        updateIVFluid, 
        completeIVFluid, 
        removeIVFluid, 
        getIVFluidSummary 
    } = useIVFluids();

    const [fluids, setFluids] = useState([]);
    const [summary, setSummary] = useState(null);
    const [editingFluid, setEditingFluid] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        fluidType: "Normal Saline",
        volume: 500,
        unit: "ML",
        startTime: new Date().toISOString().slice(0, 16),
        endTime: ""
    });

    const refreshData = useCallback(async () => {
        const [fluidsRes, summaryRes] = await Promise.all([
            getIVFluids(operationId),
            getIVFluidSummary(operationId)
        ]);
        
        if (fluidsRes.success) setFluids(fluidsRes.data);
        if (summaryRes.success) setSummary(summaryRes.data);
    }, [operationId, getIVFluids, getIVFluidSummary]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = editingFluid 
            ? await updateIVFluid(operationId, editingFluid.id, formData)
            : await addIVFluid(operationId, formData);
            
        if (res.success) {
            alert(editingFluid ? "Fluid record updated!" : "Fluid record added!");
            setIsFormOpen(false);
            setEditingFluid(null);
            refreshData();
        } else {
            alert(res.message);
        }
    };

    const handleEdit = (fluid) => {
        setEditingFluid(fluid);
        setFormData({
            fluidType: fluid.fluidType,
            volume: fluid.volume,
            unit: fluid.unit,
            startTime: fluid.startTime ? fluid.startTime.slice(0, 16) : "",
            endTime: fluid.endTime ? fluid.endTime.slice(0, 16) : ""
        });
        setIsFormOpen(true);
    };

    const handleComplete = async (fluidId) => {
        const res = await completeIVFluid(operationId, fluidId);
        if (res.success) refreshData();
    };

    const handleRemove = async (fluidId) => {
        if (!window.confirm("Remove this entry?")) return;
        const res = await removeIVFluid(operationId, fluidId);
        if (res.success) refreshData();
    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 📊 Summary Grid (Optimized for Sidebar) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                <SmallSummaryCard label="Total Vol" value={`${summary?.totalVolumeML || 0}ML`} icon="fa-solid fa-droplet" color="#3b82f6" />
                <SmallSummaryCard label="Active" value={summary?.ongoingFluidsCount || 0} icon="fa-solid fa-sync fa-spin" color="#f59e0b" />
                <SmallSummaryCard label="Done" value={summary?.completedFluidsCount || 0} icon="fa-solid fa-check-double" color="#10b981" />
                <SmallSummaryCard label="Types" value={Object.keys(summary?.byFluidType || {}).length} icon="fa-solid fa-flask" color="#8b5cf6" />
            </div>

            {/* ➕ Entry Form Section */}
            <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "#334155", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-pen-to-square" style={{ color: "var(--hospital-blue)" }}></i>
                        {editingFluid ? "Edit Administration" : "New Administration Record"}
                    </h3>
                    <button 
                        onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) { setEditingFluid(null); setFormData({ fluidType: "Normal Saline", volume: 500, unit: "ML", startTime: new Date().toISOString().slice(0, 16), endTime: "" }); } }}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: "700", border: "none", borderRadius: "6px", backgroundColor: isFormOpen ? "#e2e8f0" : "var(--hospital-blue)", color: isFormOpen ? "#475569" : "white", cursor: "pointer" }}
                    >
                        {isFormOpen ? "Close Form" : "Add Entry"}
                    </button>
                </div>

                {isFormOpen && (
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
                        <FormInput label="Fluid Type" name="fluidType" type="select" options={["Normal Saline", "Ringer Lactate", "Dextrose 5%", "DNS", "Mannitol", "Albumin"]} value={formData.fluidType} onChange={handleInputChange} />
                        <FormInput label="Volume (Unit)" name="volume" type="number" value={formData.volume} onChange={handleInputChange} />
                        <FormInput label="Start Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleInputChange} />
                        {editingFluid && <FormInput label="End Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleInputChange} />}
                        <button type="submit" style={{ padding: "0.75rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                            {editingFluid ? "Update Entry" : "Save Record"}
                        </button>
                    </form>
                )}
            </div>

            {/* 📋 Records Table */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Volume</th>
                            <th style={thStyle}>Timing</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fluids.map(fluid => (
                            <tr key={fluid.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={tdStyle}><span style={{ fontWeight: "800", color: "#1e293b" }}>{fluid.fluidType}</span></td>
                                <td style={tdStyle}>{fluid.volume} {fluid.unit}</td>
                                <td style={tdStyle}>
                                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>S: {fluid.startTime?.slice(11, 16)}</div>
                                    <div style={{ fontSize: "0.7rem", color: "#ef4444" }}>E: {fluid.endTime?.slice(11, 16) || "--:--"}</div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: fluid.endTime ? "#dcfce7" : "#fef3c7", color: fluid.endTime ? "#166534" : "#92400e", fontWeight: "900" }}>
                                        {fluid.endTime ? "COMPLETED" : "ONGOING"}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                        {!fluid.endTime && <button onClick={() => handleComplete(fluid.id)} style={miniBtn("#10b981")}><i className="fa-solid fa-check"></i></button>}
                                        <button onClick={() => handleEdit(fluid)} style={miniBtn("#2563eb")}><i className="fa-solid fa-edit"></i></button>
                                        <button onClick={() => handleRemove(fluid.id)} style={miniBtn("#ef4444")}><i className="fa-solid fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔽 Fluid Summary (Accordion) */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", backgroundColor: "white" }}>
                <div 
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", 
                        backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isSummaryOpen ? "1px solid #e2e8f0" : "none"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-chart-pie" style={{ color: "#3b82f6" }}></i>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "#334155" }}>IV fluid Summary Details</h4>
                    </div>
                    <i className={`fa-solid fa-chevron-${isSummaryOpen ? "up" : "down"}`} style={{ color: "#64748b", fontSize: "0.8rem" }}></i>
                </div>
                {isSummaryOpen && (
                    <div style={{ padding: "1rem", backgroundColor: "white" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div style={{ padding: "1rem", backgroundColor: "#eff6ff", borderRadius: "8px" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#1e40af", marginBottom: "0.5rem" }}>TOTAL VOLUME INTAKE</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e3a8a" }}>{summary?.totalVolumeML || 0} <small style={{ fontSize: "0.8rem" }}>ML</small></div>
                            </div>
                            <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", marginBottom: "0.5rem" }}>BY FLUID TYPE</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                    {Object.entries(summary?.byFluidType || {}).map(([type, vol]) => (
                                        <div key={type} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "700" }}>
                                            <span>{type}:</span>
                                            <span style={{ color: "#3b82f6" }}>{vol} ML</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Local Helpers ---
const SmallSummaryCard = ({ label, value, icon, color }) => (
    <div style={{ padding: "0.75rem 1rem", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <i className={icon} style={{ color, fontSize: "1rem" }}></i>
        <div>
            <div style={{ fontSize: "0.6rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b" }}>{value}</div>
        </div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, options }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        {type === "select" ? (
            <select name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }} />
        )}
    </div>
);

const thStyle = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: "700" };
const miniBtn = (color) => ({ width: "24px", height: "24px", borderRadius: "5px", border: "none", backgroundColor: `${color}15`, color: color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" });

export default IVFluidSection;
