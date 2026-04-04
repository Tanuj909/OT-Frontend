import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useIVFluids } from "../hooks/useIVFluids";
import { useCatalog } from "../../catalog/hooks/useCatalog";

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
    const { fetchByType, loading: catalogLoading } = useCatalog();

    const [fluids, setFluids] = useState([]);
    const [summary, setSummary] = useState(null);
    const [editingFluid, setEditingFluid] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const [catalogItems, setCatalogItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [formData, setFormData] = useState({
        catalogItemId: "",
        fluidType: "",
        ivFluidName: "",
        volume: 500,
        unit: "ML",
        startTime: new Date().toISOString().slice(0, 16),
        endTime: ""
    });

    const refreshData = useCallback(async () => {
        const [fluidsRes, summaryRes, catalogRes] = await Promise.all([
            getIVFluids(operationId),
            getIVFluidSummary(operationId),
            fetchByType("IV_FLUID") // CORRECTED from IVFLUID
        ]);
        
        if (fluidsRes.success) setFluids(fluidsRes.data || []);
        if (summaryRes.success) setSummary(summaryRes.data);
        if (catalogRes.success) setCatalogItems(catalogRes.data || []);
    }, [operationId, getIVFluids, getIVFluidSummary, fetchByType]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.catalogItemId) return alert("Please select a fluid from the catalog.");

        const res = editingFluid 
            ? await updateIVFluid(operationId, editingFluid.id, formData)
            : await addIVFluid(operationId, formData);
            
        if (res.success) {
            alert(editingFluid ? "Fluid record updated!" : "Fluid record added!");
            setIsFormOpen(false);
            setEditingFluid(null);
            setFormData({ catalogItemId: "", fluidType: "", ivFluidName: "", volume: 500, unit: "ML", startTime: new Date().toISOString().slice(0, 16), endTime: "" });
            refreshData();
        } else {
            alert(res.message);
        }
    };

    const handleEdit = (fluid) => {
        setEditingFluid(fluid);
        setFormData({
            catalogItemId: fluid.catalogItemId || "",
            fluidType: fluid.fluidType,
            ivFluidName: fluid.ivFluidName || "",
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

    const filteredCatalog = catalogItems.filter(item => 
        (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.itemCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 📊 Summary Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
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
                        onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) { setEditingFluid(null); setFormData({ catalogItemId: "", fluidType: "", ivFluidName: "", volume: 500, unit: "ML", startTime: new Date().toISOString().slice(0, 16), endTime: "" }); } }}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", fontWeight: "700", border: "none", borderRadius: "6px", backgroundColor: isFormOpen ? "#e2e8f0" : "var(--hospital-blue)", color: isFormOpen ? "#475569" : "white", cursor: "pointer" }}
                    >
                        {isFormOpen ? "Close Form" : "Add Entry"}
                    </button>
                </div>

                {isFormOpen && (
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
                        <div>
                            <label style={labelStyle}>Selected Fluid</label>
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                                <div style={{ 
                                    flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", 
                                    backgroundColor: editingFluid ? "#f1f5f9" : "white", fontWeight: "700", fontSize: "0.8rem", 
                                    color: formData.ivFluidName ? "#1e293b" : "#94a3b8",
                                    display: "flex", alignItems: "center", minHeight: "34px"
                                }}>
                                    {formData.ivFluidName || "Select from catalog..."}
                                </div>
                                {!editingFluid && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        style={{ padding: "0 0.6rem", fontSize: "0.7rem", fontWeight: "800", border: "1px solid var(--hospital-blue)", background: "white", color: "var(--hospital-blue)", borderRadius: "6px", cursor: "pointer" }}
                                    >
                                        Browse
                                    </button>
                                )}
                            </div>
                        </div>
                        <FormInput label="Volume (ML)" name="volume" type="number" value={formData.volume} onChange={handleInputChange} />
                        <FormInput label="Start Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleInputChange} />
                        {editingFluid && <FormInput label="End Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleInputChange} />}
                        <button type="submit" disabled={loading} style={{ padding: "0.75rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "1000", cursor: "pointer", gridColumn: "span 1" }}>
                            {loading ? "Processing..." : (editingFluid ? "Update" : "Save Record")}
                        </button>
                    </form>
                )}
            </div>

            {/* 📋 Records Table */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Fluid Name</th>
                            <th style={thStyle}>Volume</th>
                            <th style={thStyle}>Timing</th>
                            <th style={thStyle}>Status</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fluids.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700" }}>No IV fluids administered.</td></tr>
                        ) : (
                            fluids.map(fluid => (
                                <tr key={fluid.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "800", color: "#1e293b" }}>{fluid.ivFluidName}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#64748b" }}>{fluid.fluidType}</div>
                                    </td>
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
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                            {!fluid.endTime && <button onClick={() => handleComplete(fluid.id)} style={miniBtn("#10b981")} title="Complete"><i className="fa-solid fa-check"></i></button>}
                                            <button onClick={() => handleEdit(fluid)} style={miniBtn("#2563eb")} title="Edit"><i className="fa-solid fa-edit"></i></button>
                                            <button onClick={() => handleRemove(fluid.id)} style={miniBtn("#ef4444")} title="Remove"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🏥 Catalog Selection Modal */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>Select IV Fluid from Catalog</h3>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtnStyle}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        
                        <div style={{ padding: "1.25rem" }}>
                            <div style={{ position: "relative", marginBottom: "1rem" }}>
                                <i className="fa-solid fa-magnifying-glass" style={iconInsideStyle}></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by fluid name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: "100%", padding: "0.6rem 0.6rem 0.6rem 2.2rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.85rem" }}
                                />
                            </div>

                            <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1 }}>
                                        <tr>
                                            <th style={thStyleCompact}>Fluid Name</th>
                                            <th style={thStyleCompact}>Manufacturer</th>
                                            <th style={{ ...thStyleCompact, textAlign: "right" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCatalog.length === 0 ? (
                                            <tr><td colSpan="3" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontWeight: "700" }}>{catalogLoading ? "Searching..." : "No items found."}</td></tr>
                                        ) : (
                                            filteredCatalog.map(item => (
                                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={tdStyleCompact}><div style={{ fontWeight: "800" }}>{item.itemName}</div><div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{item.itemCode}</div></td>
                                                    <td style={tdStyleCompact}>{item.manufacturer}</td>
                                                    <td style={{ ...tdStyleCompact, textAlign: "right" }}>
                                                        <button 
                                                            onClick={() => {
                                                                setFormData(prev => ({ 
                                                                    ...prev, 
                                                                    catalogItemId: item.id,
                                                                    fluidType: item.category || "IV_FLUID", // CORRECTED
                                                                    ivFluidName: item.itemName
                                                                }));
                                                                setIsModalOpen(false);
                                                            }}
                                                            style={{ padding: "0.3rem 0.75rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "800", cursor: "pointer", fontSize: "0.7rem" }}
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔽 Fluid Summary Accordion */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", backgroundColor: "white" }}>
                <div onClick={() => setIsSummaryOpen(!isSummaryOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", backgroundColor: "#f8fafc", cursor: "pointer", borderBottom: isSummaryOpen ? "1px solid #e2e8f0" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><i className="fa-solid fa-chart-pie" style={{ color: "#3b82f6" }}></i><h4 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "#334155" }}>IV fluid Summary Details</h4></div>
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
                                        <div key={type} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: "700" }}><span>{type}:</span><span style={{ color: "#3b82f6" }}>{vol} ML</span></div>
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

const SmallSummaryCard = ({ label, value, icon, color }) => (
    <div style={{ padding: "0.75rem 1rem", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <i className={icon} style={{ color, fontSize: "1rem" }}></i>
        <div><div style={{ fontSize: "0.6rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b" }}>{value}</div></div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        <input type={type} name={name} value={value ?? ""} onChange={onChange} style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }} />
    </div>
);

const thStyle = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "0.75rem 1rem", fontSize: "0.8rem", fontWeight: "700" };
const miniBtn = (color) => ({ width: "24px", height: "24px", borderRadius: "5px", border: "none", backgroundColor: `${color}15`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" });
const thStyleCompact = { textAlign: "left", padding: "0.7rem 1rem", fontSize: "0.6rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyleCompact = { padding: "0.7rem 1rem", fontSize: "0.8rem" };
const labelStyle = { display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" };
const iconInsideStyle = { position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.9rem", zIndex: 1 };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modalContentStyle = { backgroundColor: "white", borderRadius: "20px", width: "95%", maxWidth: "550px", maxHeight: "90vh", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" };
const modalHeaderStyle = { padding: "1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white" };
const closeBtnStyle = { background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer" };

export default IVFluidSection;
