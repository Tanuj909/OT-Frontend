import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useConsumables } from "../hooks/useConsumables";
import { useCatalog } from "../../catalog/hooks/useCatalog";
import { CONSUMABLE_CATEGORIES, UNIT_OPTIONS } from "../constants/consumables.endpoint";

const ConsumablesSection = () => {
    const { operationId } = useParams();
    const { 
        loading, 
        addConsumable, 
        getConsumables, 
        updateConsumable, 
        returnConsumable, 
        deleteConsumable, 
        getConsumableSummary 
    } = useConsumables();
    const { fetchCatalogItems, loading: catalogLoading } = useCatalog();

    const [consumables, setConsumables] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [catalogItems, setCatalogItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCatalogList, setShowCatalogList] = useState(false);

    const [formData, setFormData] = useState({
        consumableCode: "",
        consumableName: "",
        category: "SURGICAL",
        quantityUsed: "",
        quantityWasted: "0",
        unitOfMeasure: "PCS",
        batchNumber: "",
        expiryDate: "",
        isSterile: true,
        sterilizationDate: "",
        unitPrice: "",
        discountPercent: "",
        gstPercent: ""
    });

    const refreshData = useCallback(async () => {
        const [listRes, summaryRes, catalogRes] = await Promise.all([
            getConsumables(operationId),
            getConsumableSummary(operationId),
            fetchCatalogItems({ itemType: "CONSUMABLE", isActive: true })
        ]);

        if (listRes.success) setConsumables(listRes.data || []);
        if (summaryRes.success) setSummary(summaryRes.data);
        if (catalogRes.success) setCatalogItems(catalogRes.data || []);
    }, [operationId, getConsumables, getConsumableSummary, fetchCatalogItems]);

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
            consumableCode: "",
            consumableName: "",
            category: "SURGICAL",
            quantityUsed: "",
            quantityWasted: "0",
            unitOfMeasure: "PCS",
            batchNumber: "",
            expiryDate: "",
            isSterile: true,
            sterilizationDate: "",
            unitPrice: "",
            discountPercent: "",
            gstPercent: ""
        });
        setEditingItem(null);
        setSearchTerm("");
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            quantityUsed: Number(formData.quantityUsed),
            quantityWasted: Number(formData.quantityWasted),
            unitPrice: Number(formData.unitPrice),
            discountPercent: Number(formData.discountPercent),
            gstPercent: Number(formData.gstPercent),
            expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
            sterilizationDate: formData.sterilizationDate ? new Date(formData.sterilizationDate).toISOString() : null
        };

        const res = editingItem 
            ? await updateConsumable(operationId, editingItem.id, payload)
            : await addConsumable(operationId, payload);
        
        if (res.success) {
            alert(res.message || "Consumable successful!");
            resetForm();
            refreshData();
        } else {
            alert(res.message || "Operation failed");
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setSearchTerm(item.consumableName);
        setFormData({
            consumableCode: item.consumableCode,
            consumableName: item.consumableName,
            category: item.category,
            quantityUsed: item.quantityUsed.toString(),
            quantityWasted: item.quantityWasted.toString(),
            unitOfMeasure: item.unitOfMeasure,
            batchNumber: item.batchNumber || "",
            expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
            isSterile: item.isSterile,
            sterilizationDate: item.sterilizationDate ? item.sterilizationDate.slice(0, 10) : "",
            unitPrice: item.unitPrice?.toString() || "",
            discountPercent: item.discountPercent?.toString() || "",
            gstPercent: item.gstPercent?.toString() || ""
        });
        setIsFormOpen(true);
    };

    const handleReturn = async (itemId) => {
        if (!window.confirm("Mark this consumable as returned?")) return;
        const res = await returnConsumable(operationId, itemId);
        if (res.success) {
            alert("Marked as returned!");
            refreshData();
        } else {
            alert(res.message || "Return failed");
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Permanent delete this consumable log?")) return;
        const res = await deleteConsumable(operationId, itemId);
        if (res.success) {
            refreshData();
        } else {
            alert(res.message || "Delete failed");
        }
    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 📊 Summary Section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                <SummaryCard label="Total Items" value={summary?.totalItemsUsed || 0} icon="fa-solid fa-box-open" color="#3b82f6" />
                <SummaryCard label="Sterile Items" value={summary?.sterileItems || 0} icon="fa-solid fa-shield-virus" color="#10b981" />
                <SummaryCard label="Wasted Items" value={summary?.totalItemsWasted || 0} icon="fa-solid fa-trash-can" color="#ef4444" />
                <SummaryCard label="Unique Types" value={summary?.totalConsumables || 0} icon="fa-solid fa-layer-group" color="#8b5cf6" />
                <SummaryCard label="Non-Sterile" value={summary?.nonSterileItems || 0} icon="fa-solid fa-circle-exclamation" color="#64748b" />
            </div>

            {/* Header & Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-box-archive" style={{ color: "var(--hospital-blue)" }}></i> Usage Manifest
                </h3>
                <button 
                    onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) setEditingItem(null); }}
                    style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: "800", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                    <i className={`fa-solid ${isFormOpen ? "fa-xmark" : "fa-plus"}`}></i>
                    {isFormOpen ? "Close" : "Add Consumable"}
                </button>
            </div>

            {/* ➕ Entry/Edit Form */}
            {isFormOpen && (
                <div style={{ backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#475569", marginTop: 0, marginBottom: "1rem" }}>
                        {editingItem ? "Update Consumable Usage" : "Register Item Usage"}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                        {/* Catalog Item Selector */}
                        <div style={{ gridColumn: "span 2", position: "relative" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>Select Item from Catalog (Search Name or Code)</label>
                            <div style={{ position: "relative" }}>
                                <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.8rem" }}></i>
                                <input 
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={searchTerm || (editingItem ? formData.consumableName : "")}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowCatalogList(true);
                                    }}
                                    onFocus={() => setShowCatalogList(true)}
                                    style={{ width: "100%", padding: "0.55rem 0.55rem 0.55rem 2.2rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }}
                                />
                                {showCatalogList && (
                                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", maxHeight: "200px", overflowY: "auto", marginTop: "4px" }}>
                                        {catalogItems.filter(item => 
                                            item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length === 0 ? (
                                            <div style={{ padding: "0.75rem", fontSize: "0.7rem", color: "#94a3b8", textAlign: "center" }}>No catalog matches</div>
                                        ) : (
                                            catalogItems.filter(item => 
                                                item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
                                            ).map(item => (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => {
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            consumableName: item.itemName, 
                                                            consumableCode: item.itemCode,
                                                            unitOfMeasure: item.unit || "PCS",
                                                            unitPrice: item.basePrice?.toString() || "0",
                                                            discountPercent: item.discountPercent?.toString() || "0",
                                                            gstPercent: item.gstPercent?.toString() || "0"
                                                        }));
                                                        setSearchTerm(item.itemName);
                                                        setShowCatalogList(false);
                                                    }}
                                                    style={{ padding: "0.75rem", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "all 0.2s" }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                                                >
                                                    <div style={{ fontWeight: "800", fontSize: "0.75rem", color: "#1e293b" }}>{item.itemName}</div>
                                                    <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{item.itemCode} • {item.category}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <FormSelect label="Category" name="category" value={formData.category} options={CONSUMABLE_CATEGORIES} onChange={handleInputChange} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <FormInput label="Qty Used *" name="quantityUsed" type="number" value={formData.quantityUsed} onChange={handleInputChange} placeholder="10" required />
                            <FormSelect label="Unit" name="unitOfMeasure" value={formData.unitOfMeasure} options={UNIT_OPTIONS} onChange={handleInputChange} />
                        </div>
                        
                        <FormInput label="Batch Number" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} placeholder="BATCH-123" />
                        {/* <FormInput label="Expiry Date" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} /> */}
                        <FormInput label="Qty Wasted" name="quantityWasted" type="number" value={formData.quantityWasted} onChange={handleInputChange} placeholder="0" />
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <FormInput label="Sterilization Date" name="sterilizationDate" type="date" value={formData.sterilizationDate} onChange={handleInputChange} disabled={!formData.isSterile} />
                            <div style={{ paddingBottom: "0.5rem" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", cursor: "pointer", marginTop: "1.2rem" }}>
                                    <input type="checkbox" name="isSterile" checked={formData.isSterile} onChange={handleInputChange} />
                                    Sterile Item
                                </label>
                            </div>
                        </div>

                        {/* Pricing Row (Read-only) */}
                        <FormInput label="Unit Price (₹)" name="unitPrice" type="number" value={formData.unitPrice} onChange={handleInputChange} placeholder="0.00" disabled={true} />
                        <FormInput label="Disc. %" name="discountPercent" type="number" value={formData.discountPercent} onChange={handleInputChange} placeholder="0" disabled={true} />
                        <FormInput label="GST %" name="gstPercent" type="number" value={formData.gstPercent} onChange={handleInputChange} placeholder="0" disabled={true} />

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ gridColumn: "span 4", padding: "0.85rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "10px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase", fontSize: "0.8rem", marginTop: "0.5rem" }}
                        >
                            {loading ? "Processing..." : (editingItem ? "Update Record" : "Log Consumable")}
                        </button>
                    </form>
                </div>
            )}

            {/* 📋 Usage Log Table */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>Item Manifest</th>
                            <th style={thStyle}>Stock Profile</th>
                            <th style={thStyle}>Metrics</th>
                            <th style={thStyle}>Custody</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consumables.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", fontWeight: "700" }}>No consumables tracked for this operation session.</td></tr>
                        ) : (
                            consumables.map(item => (
                                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: "900", color: "#1e293b" }}>{item.consumableName}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            {item.consumableCode} • <span style={{ color: "var(--hospital-blue)", fontWeight: "800" }}>{item.category}</span>
                                            {item.isSterile && (
                                                <span style={{ fontSize: "0.55rem", padding: "0.1rem 0.4rem", backgroundColor: "#ecfdf5", color: "#059669", borderRadius: "4px", fontWeight: "900", border: "1px solid #d1fae5" }}>
                                                    <i className="fa-solid fa-certificate" style={{ fontSize: "0.5rem" }}></i> STERILE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: "700" }}>Batch: {item.batchNumber || "N/A"}</div>
                                        {/* Removed redundant sterile label */}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "800" }}>Used: {item.quantityUsed} {item.unitOfMeasure}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "700" }}>₹{item.unitPrice || 0} / unit</div>
                                        <div style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "700" }}>Wasted: {item.quantityWasted}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: "700" }}>Issued: {item.issuedBy || "System"}</div>
                                        <div style={{ fontSize: "0.65rem", color: "#3b82f6", fontWeight: "700" }}>Returned: {item.returnedBy || "Pending"}</div>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                            {!item.returnedBy && (
                                                <button onClick={() => handleReturn(item.id)} style={miniBtn("#3b82f6")} title="Mark as Returned"><i className="fa-solid fa-rotate-left"></i></button>
                                            )}
                                            <button onClick={() => handleEdit(item)} style={miniBtn("#2563eb")} title="Edit Log"><i className="fa-solid fa-pen-to-square"></i></button>
                                            <button onClick={() => handleDelete(item.id)} style={miniBtn("#ef4444")} title="Delete Item"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Helper Components ---
const SummaryCard = ({ label, value, icon, color }) => (
    <div style={{ padding: "0.75rem", backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.6rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={icon} style={{ color, fontSize: "0.8rem" }}></i>
        </div>
        <div>
            <div style={{ fontSize: "0.55rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1e293b" }}>{value}</div>
        </div>
    </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, placeholder, required = false, disabled = false }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        <input 
            type={type} 
            name={name} 
            value={value ?? ""} 
            onChange={onChange} 
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem", opacity: disabled ? 0.6 : 1 }}
        />
    </div>
);

const FormSelect = ({ label, name, value, options, onChange }) => (
    <div>
        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", marginBottom: "0.3rem", color: "#64748b" }}>{label}</label>
        <select 
            name={name} 
            value={value} 
            onChange={onChange}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.8rem" }}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const thStyle = { textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.65rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: "700" };
const miniBtn = (color) => ({ width: "26px", height: "26px", borderRadius: "6px", border: "none", backgroundColor: `${color}15`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" });

export default ConsumablesSection;
