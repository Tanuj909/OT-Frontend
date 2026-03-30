import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useImplants } from "../hooks/useImplants";
import { useCatalog } from "../../catalog/hooks/useCatalog";

const ImplantSection = () => {
    const { operationId } = useParams();
    const { loading, addImplantUsage, fetchUsedImplants, updateImplantUsage, removeImplantUsage } = useImplants();
    const { fetchByType, loading: catalogLoading } = useCatalog();

    const [usedImplants, setUsedImplants] = useState([]);
    const [implantCatalog, setImplantCatalog] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImplant, setEditingImplant] = useState(null);

    const [formData, setFormData] = useState({
        catalogItemId: "",
        itemName: "",
        serialNumber: "",
        batchNumber: "",
        quantity: 1,
        bodyLocation: "",
        notes: ""
    });

    const refreshImplants = useCallback(async () => {
        const [usedRes, catalogRes] = await Promise.all([
            fetchUsedImplants(operationId),
            fetchByType("IMPLANT")
        ]);

        if (usedRes.success) setUsedImplants(usedRes.data || []);
        if (catalogRes.success) setImplantCatalog(catalogRes.data || []);
    }, [operationId, fetchUsedImplants, fetchByType]);

    useEffect(() => {
        refreshImplants();
    }, [refreshImplants]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            catalogItemId: "",
            itemName: "",
            serialNumber: "",
            batchNumber: "",
            quantity: 1,
            bodyLocation: "",
            notes: ""
        });
        setEditingImplant(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editingImplant) {
            const res = await updateImplantUsage(operationId, editingImplant.id, {
                bodyLocation: formData.bodyLocation,
                notes: formData.notes
            });
            if (res.success) {
                resetForm();
                refreshImplants();
            } else {
                alert(res.message || "Update failed");
            }
            return;
        }

        if (!formData.catalogItemId) return alert("Select an implant from the catalog");

        const payload = {
            catalogItemId: parseInt(formData.catalogItemId),
            serialNumber: formData.serialNumber,
            batchNumber: formData.batchNumber,
            quantity: parseInt(formData.quantity),
            bodyLocation: formData.bodyLocation,
            notes: formData.notes
        };

        const res = await addImplantUsage(operationId, payload);
        if (res.success) {
            resetForm();
            refreshImplants();
        } else {
            alert(res.message || "Failed to add implant usage");
        }
    };

    const handleEdit = (implant) => {
        setEditingImplant(implant);
        setFormData({
            catalogItemId: implant.catalogItemId,
            itemName: implant.itemName,
            serialNumber: implant.serialNumber,
            batchNumber: implant.batchNumber,
            quantity: implant.quantity,
            bodyLocation: implant.bodyLocation,
            notes: implant.notes
        });
        setIsFormOpen(true);
    };

    const handleRemove = async (implantId) => {
        if (!window.confirm("Remove this implant from the surgical record?")) return;
        const res = await removeImplantUsage(operationId, implantId);
        if (res.success) {
            refreshImplants();
        } else {
            alert(res.message || "Removal failed");
        }
    };

    const filteredCatalog = implantCatalog.filter(item => 
        (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.itemCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <i className="fa-solid fa-bone" style={{ color: "#8b5cf6" }}></i> Implanted Devices & Prosthesis
                </h3>
                <button 
                    onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) setEditingImplant(null); }}
                    style={{ 
                        padding: "0.6rem 1.25rem", fontSize: "0.8rem", fontWeight: "800", 
                        backgroundColor: isFormOpen ? "#f1f5f9" : "#8b5cf6", 
                        color: isFormOpen ? "#64748b" : "white", 
                        border: "none", borderRadius: "10px", cursor: "pointer", 
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className={`fa-solid ${isFormOpen ? "fa-xmark" : "fa-plus"}`}></i>
                    {isFormOpen ? "Cancel" : "Add Implant Log"}
                </button>
            </div>

            {/* ➕ Entry Form */}
            {isFormOpen && (
                <div style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "16px", border: "1.5px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#475569", marginTop: 0, marginBottom: "1.25rem", textTransform: "uppercase" }}>
                        {editingImplant ? "Update Implant Record" : "Register Implant Usage"}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1.25rem" }}>
                        
                        {/* Device Selection */}
                        <div>
                            <label style={labelStyle}>Selected Device</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div style={{ 
                                    flex: 1, padding: "0.75rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", 
                                    backgroundColor: editingImplant ? "#f1f5f9" : "white", fontWeight: "700", fontSize: "0.85rem", 
                                    color: formData.itemName ? "#1e293b" : "#94a3b8",
                                    display: "flex", alignItems: "center", minHeight: "44px"
                                }}>
                                    {formData.itemName || "Browse catalog..."}
                                </div>
                                {!editingImplant && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        style={secondaryBtnStyle}
                                    >
                                        Select
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Serial / Lot Number</label>
                            <input name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} disabled={!!editingImplant} style={inputStyle(!!editingImplant)} placeholder="SN-12345" />
                        </div>

                        <div>
                            <label style={labelStyle}>Quantity Units</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} disabled={!!editingImplant} style={inputStyle(!!editingImplant)} placeholder="1" />
                        </div>

                        <div>
                            <label style={labelStyle}>Batch / Manufacturing ID</label>
                            <input name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} disabled={!!editingImplant} style={inputStyle(!!editingImplant)} placeholder="B-2024" />
                        </div>

                        <div>
                            <label style={labelStyle}>Body Anatomy Location</label>
                            <input name="bodyLocation" value={formData.bodyLocation} onChange={handleInputChange} style={inputStyle()} placeholder="e.g. Left Knee" />
                        </div>

                        <div style={{ gridColumn: "span 3" }}>
                            <label style={labelStyle}>Surgical Notes & Clinical Indications</label>
                            <textarea name="notes" value={formData.notes} onChange={handleInputChange} style={{ ...inputStyle(), height: "80px", resize: "none" }} placeholder="Document fixation type, alignment, or observations..." />
                        </div>

                        <div style={{ gridColumn: "span 3", display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                            <button type="submit" disabled={loading} style={primaryBtnStyle}>
                                {loading ? "Saving Record..." : (editingImplant ? "Update Clinical Entry" : "Commit Implant Log")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 📋 Implant Log */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Implant Specifications</th>
                            <th style={thStyle}>Identification</th>
                            <th style={thStyle}>Location & Notes</th>
                            <th style={thStyle}>Custody</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usedImplants.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontWeight: "700" }}>No implanted devices recorded for this surgical session.</td></tr>
                        ) : (
                            usedImplants.map(imp => (
                                <tr key={imp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "900", color: "#1e293b", fontSize: "0.95rem" }}>{imp.itemName}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "800", textTransform: "uppercase" }}>{imp.manufacturer}</div>
                                        <span style={{ fontSize: "0.65rem", fontWeight: "800", padding: "0.1rem 0.4rem", borderRadius: "4px", backgroundColor: "#f3f4f6", color: "#4b5563" }}>{imp.itemCode}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>SN: <span style={{ color: "#1e293b" }}>{imp.serialNumber || "N/A"}</span></div>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#475569" }}>Batch: <span style={{ color: "#1e293b" }}>{imp.batchNumber || "N/A"}</span></div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.85rem" }}><i className="fa-solid fa-location-crosshairs" style={{ marginRight: "0.4rem", color: "#ef4444" }}></i>{imp.bodyLocation}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "500", marginTop: "0.2rem" }}>{imp.notes || "No clinical notes."}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#1e293b" }}>{imp.usedBy}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700" }}>{new Date(imp.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleEdit(imp)} style={miniBtn("#6366f1")}><i className="fa-solid fa-pen-to-square"></i></button>
                                            <button onClick={() => handleRemove(imp.id)} style={miniBtn("#ef4444")}><i className="fa-solid fa-trash-can"></i></button>
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
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800" }}>Implant Selection Catalog</h3>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtnStyle}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                                <i className="fa-solid fa-magnifying-glass" style={iconInsideStyle}></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by device name, manufacturer or code..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={inputStyle()}
                                />
                            </div>

                            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                                        <tr>
                                            <th style={thStyleCompact}>Device Specifications</th>
                                            <th style={thStyleCompact}>Category</th>
                                            <th style={{ ...thStyleCompact, textAlign: "right" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCatalog.length === 0 ? (
                                            <tr><td colSpan="3" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>{catalogLoading ? "Indexing catalog..." : `No implants matching "${searchTerm}"`}</td></tr>
                                        ) : (
                                            filteredCatalog.map(item => (
                                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={tdStyleCompact}>
                                                        <div style={{ fontWeight: "800", color: "#1e293b" }}>{item.itemName}</div>
                                                        <div style={{ fontSize: "0.65rem", color: "#6366f1", fontWeight: "700", textTransform: "uppercase" }}>{item.manufacturer} • {item.itemCode}</div>
                                                    </td>
                                                    <td style={tdStyleCompact}>
                                                        <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#475569" }}>{item.category}</span>
                                                    </td>
                                                    <td style={{ ...tdStyleCompact, textAlign: "right" }}>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFormData(prev => ({ ...prev, catalogItemId: item.id, itemName: item.itemName }));
                                                                setIsModalOpen(false);
                                                            }}
                                                            style={selectBtnStyle}
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
        </div>
    );
};

// --- Styles ---
const thStyle = { textAlign: "left", padding: "1rem 1.25rem", fontSize: "0.7rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" };
const tdStyle = { padding: "1rem 1.25rem", verticalAlign: "middle" };
const thStyleCompact = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyleCompact = { padding: "0.75rem 1rem", fontSize: "0.8rem" };
const labelStyle = { display: "block", fontSize: "0.75rem", fontWeight: "800", marginBottom: "0.4rem", color: "#64748b" };

const inputStyle = (disabled) => ({ 
    width: "100%", padding: "0.75rem", borderRadius: "10px", 
    border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.85rem",
    backgroundColor: disabled ? "#f1f5f9" : "white"
});

const iconInsideStyle = { position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.9rem", zIndex: 1 };

const primaryBtnStyle = { 
    width: "100%", padding: "0.9rem", backgroundColor: "#8b5cf6", 
    color: "white", border: "none", borderRadius: "10px", 
    fontWeight: "900", cursor: "pointer", textTransform: "uppercase", fontSize: "0.85rem" 
};

const secondaryBtnStyle = { 
    padding: "0 1.25rem", backgroundColor: "white", color: "#8b5cf6", 
    border: "1.5px solid #8b5cf6", borderRadius: "10px", fontWeight: "800", 
    cursor: "pointer", transition: "all 0.2s" 
};

const miniBtn = (color) => ({ width: "32px", height: "32px", borderRadius: "8px", border: "none", backgroundColor: `${color}15`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" });

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modalContentStyle = { backgroundColor: "white", borderRadius: "20px", width: "95%", maxWidth: "600px", maxHeight: "90vh", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" };
const modalHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white" };
const closeBtnStyle = { background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer" };
const selectBtnStyle = { padding: "0.4rem 1rem", backgroundColor: "#8b5cf6", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.75rem" };

export default ImplantSection;
