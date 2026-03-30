import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEquipment } from "../hooks/useEquipment";
import { useEquipment as useEquipmentList } from "../../equipment/hooks/useEquipment";

const EquipmentSection = () => {
    const { operationId } = useParams();
    const { loading, addEquipmentUsage, fetchUsedEquipment, updateEquipmentUsage, removeEquipment } = useEquipment();
    const { equipmentList, fetchAllEquipment, loading: listLoading } = useEquipmentList();

    const [usedEquipment, setUsedEquipment] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const getLocalISOString = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const formatToLocalForInput = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        equipmentId: "",
        equipmentName: "",
        quantityUsed: 1,
        isConsumable: false,
        usedFrom: getLocalISOString(),
        usedUntil: ""
    });

    const refreshData = useCallback(async () => {
        const usedRes = await fetchUsedEquipment(operationId);
        if (usedRes.success) setUsedEquipment(usedRes.data || []);
        fetchAllEquipment();
    }, [operationId, fetchUsedEquipment, fetchAllEquipment]);

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

    const resetForm = () => {
        setFormData({
            equipmentId: "",
            equipmentName: "",
            quantityUsed: 1,
            isConsumable: false,
            usedFrom: getLocalISOString(),
            usedUntil: ""
        });
        setSearchTerm("");
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            equipmentId: parseInt(formData.equipmentId),
            quantityUsed: parseInt(formData.quantityUsed),
            isConsumable: formData.isConsumable,
            usedFrom: formData.usedFrom + ":00",
            usedUntil: formData.usedUntil ? formData.usedUntil + ":00" : null
        };

        const res = editingId 
            ? await updateEquipmentUsage(operationId, editingId, payload)
            : await addEquipmentUsage(operationId, payload);

        if (res.success) {
            resetForm();
            refreshData();
        } else {
            alert(res.message || "Operation failed");
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            equipmentId: item.equipmentId,
            equipmentName: item.equipmentName,
            quantityUsed: item.quantityUsed,
            isConsumable: item.isConsumable || false,
            usedFrom: formatToLocalForInput(item.usedFrom),
            usedUntil: formatToLocalForInput(item.usedUntil)
        });
        setIsFormOpen(true);
    };

    const handleCompleteUsage = async (usageId) => {
        const usedUntil = new Date().toISOString();
        const res = await updateEquipmentUsage(operationId, usageId, { usedUntil });
        if (res.success) {
            refreshData();
        } else {
            alert(res.message || "Failed to update usage");
        }
    };

    const handleRemove = async (usageId) => {
        if (!window.confirm("Permanent remove this equipment from operation record?")) return;
        const res = await removeEquipment(operationId, usageId);
        if (res.success) {
            refreshData();
        } else {
            alert(res.message || "Failed to remove equipment");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Active";
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
    };

    const filteredCatalog = equipmentList.filter(item => 
        (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.assetCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Header & Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <i className="fa-solid fa-microscope" style={{ color: "var(--hospital-blue)" }}></i> Surgical Equipment & Instrumentation
                </h3>
                <button 
                    onClick={() => { if(isFormOpen) resetForm(); else setIsFormOpen(true); }}
                    style={{ 
                        padding: "0.6rem 1.25rem", fontSize: "0.8rem", fontWeight: "800", 
                        backgroundColor: isFormOpen ? "#f1f5f9" : "var(--hospital-blue)", 
                        color: isFormOpen ? "#64748b" : "white", 
                        border: "none", borderRadius: "10px", cursor: "pointer", 
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className={`fa-solid ${isFormOpen ? "fa-xmark" : "fa-laptop-medical"}`}></i>
                    {isFormOpen ? "Cancel" : "Track Equipment"}
                </button>
            </div>

            {/* ➕ Entry Form */}
            {isFormOpen && (
                <div style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "16px", border: "1.5px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#475569", marginTop: 0, marginBottom: "1.25rem", textTransform: "uppercase" }}>Register Equipment Deployment</h4>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 0.4fr 0.8fr 0.8fr", gap: "1rem" }}>
                        
                        {/* Equipment Selection */}
                        <div>
                            <label style={labelStyle}>Selected Equipment</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div style={{ 
                                    flex: 1, padding: "0.7rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", 
                                    backgroundColor: editingId ? "#f1f5f9" : "white", fontWeight: "700", fontSize: "0.85rem", color: formData.equipmentName ? "#1e293b" : "#94a3b8",
                                    display: "flex", alignItems: "center", minHeight: "42px"
                                }}>
                                    {formData.equipmentName || "No equipment selected"}
                                </div>
                                {!editingId && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        style={{ 
                                            padding: "0 1rem", backgroundColor: "white", color: "var(--hospital-blue)", 
                                            border: "1.5px solid var(--hospital-blue)", borderRadius: "10px", fontWeight: "800", 
                                            cursor: "pointer", transition: "all 0.2s"
                                        }}
                                    >
                                        Select
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Qty Units</label>
                            <input type="number" name="quantityUsed" value={formData.quantityUsed} onChange={handleInputChange} style={inputStyle()} />
                        </div>

                        <div>
                            <label style={labelStyle}>Start Time</label>
                            <input type="datetime-local" name="usedFrom" value={formData.usedFrom} onChange={handleInputChange} style={inputStyle()} />
                        </div>

                        <div>
                            <label style={labelStyle}>End Time (Opt)</label>
                            <input type="datetime-local" name="usedUntil" value={formData.usedUntil} onChange={handleInputChange} style={inputStyle()} />
                        </div>

                        <div style={{ gridColumn: "span 4", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", fontWeight: "700", color: "#475569", cursor: "pointer" }}>
                                <input type="checkbox" name="isConsumable" checked={formData.isConsumable} onChange={handleInputChange} style={{ width: "18px", height: "18px" }} />
                                Treat as Consumable Instrumentation
                            </label>
                            
                            <button 
                                type="submit" 
                                disabled={loading || !formData.equipmentId}
                                style={{ 
                                    marginLeft: "auto", padding: "0.8rem 2rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer",
                                    opacity: (loading || !formData.equipmentId) ? 0.7 : 1
                                }}
                            >
                                {loading ? "Saving..." : (editingId ? "Update Log" : "Log Usage")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 📋 Usage Registry */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1.5px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Equipment Profile</th>
                            <th style={thStyle}>Deployment Period</th>
                            <th style={thStyle}>Qty</th>
                            <th style={thStyle}>Status</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usedEquipment.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "#94a3b8", fontWeight: "700" }}>No equipment tracking recorded for this session.</td></tr>
                        ) : (
                            usedEquipment.map(item => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "900", color: "#1e293b", fontSize: "0.9rem" }}>{item.equipmentName}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            {item.assetCode} • <span style={{ color: "var(--hospital-blue)", fontWeight: "800" }}>{item.category}</span>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                            <div style={{ fontSize: "0.75rem", fontWeight: "800" }}>
                                                <i className="fa-solid fa-play" style={{ fontSize: "0.6rem", marginRight: "0.4rem", color: "#10b981" }}></i>
                                                {formatDate(item.usedFrom)}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: item.usedUntil ? "#64748b" : "#3b82f6" }}>
                                                <i className="fa-solid fa-stop" style={{ fontSize: "0.6rem", marginRight: "0.4rem" }}></i>
                                                {item.usedUntil ? formatDate(item.usedUntil) : "Currently in Use"}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b" }}>{item.quantityUsed} Units</span>
                                    </td>
                                    <td style={tdStyle}>
                                        {!item.usedUntil ? (
                                            <span style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: "900", border: "1px solid #dbeafe" }}>
                                                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: "0.3rem" }}></i> ACTIVE
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534", fontWeight: "900", border: "1px solid #dcfce7" }}>
                                                <i className="fa-solid fa-check-double" style={{ marginRight: "0.3rem" }}></i> COMPLETED
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            {!item.usedUntil && (
                                                <button 
                                                    onClick={() => handleCompleteUsage(item.id)}
                                                    style={actionBtn("#10b981")}
                                                    title="Mark as Usage Finished"
                                                >
                                                    <i className="fa-solid fa-power-off"></i>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                style={actionBtn("#3b82f6")}
                                                title="Edit Record"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleRemove(item.id)}
                                                style={actionBtn("#ef4444")}
                                                title="Remove Record"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🏥 Equipment Selection Modal */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800" }}>Select Hospital Equipment</h3>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtnStyle}><i className="fa-solid fa-xmark"></i></button>
                        </div>
                        
                        <div style={{ padding: "1.5rem" }}>
                            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                                <i className="fa-solid fa-magnifying-glass" style={iconInsideStyle}></i>
                                <input 
                                    type="text" 
                                    placeholder="Search by equipment name or asset code..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={inputStyle(true)}
                                />
                            </div>

                            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8fafc", zIndex: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                                        <tr>
                                            <th style={thStyleCompact}>Asset Details</th>
                                            <th style={thStyleCompact}>Category</th>
                                            <th style={{ ...thStyleCompact, textAlign: "right" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCatalog.length === 0 ? (
                                            <tr><td colSpan="3" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>No equipment found matching "{searchTerm}"</td></tr>
                                        ) : (
                                            filteredCatalog.map(item => (
                                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                    <td style={tdStyleCompact}>
                                                        <div style={{ fontWeight: "800", color: "#1e293b" }}>{item.name}</div>
                                                        <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{item.assetCode}</div>
                                                    </td>
                                                    <td style={tdStyleCompact}>
                                                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--hospital-blue)" }}>{item.category}</span>
                                                    </td>
                                                    <td style={{ ...tdStyleCompact, textAlign: "right" }}>
                                                        <button 
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, equipmentId: item.id, equipmentName: item.name }));
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
const inputStyle = (withIcon) => ({ width: "100%", padding: "0.7rem", paddingLeft: withIcon ? "2.5rem" : "0.7rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.85rem" });
const iconInsideStyle = { position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.9rem" };
const actionBtn = (color) => ({ width: "32px", height: "32px", borderRadius: "8px", border: "none", backgroundColor: `${color}15`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", transition: "all 0.2s" });

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const modalContentStyle = { backgroundColor: "white", borderRadius: "20px", width: "95%", maxWidth: "650px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden" };
const modalHeaderStyle = { padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white" };
const closeBtnStyle = { background: "none", border: "none", fontSize: "1.5rem", color: "#64748b", cursor: "pointer" };
const selectBtnStyle = { padding: "0.4rem 1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.75rem" };

export default EquipmentSection;
