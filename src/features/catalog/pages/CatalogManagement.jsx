import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";

const CatalogManagement = () => {
    const navigate = useNavigate();
    const { loading, error, items, fetchAllItems, addItem, editItem, toggleItemStatus, removeItem } = useCatalog();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD");
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ itemType: "", isActive: "" });

    // Component States
    const [formData, setFormData] = useState({
        itemCode: "",
        itemName: "",
        itemType: "CONSUMABLE",
        category: "",
        subCategory: "",
        manufacturer: "",
        modelNumber: "",
        description: "",
        unit: ""
    });

    useEffect(() => {
        fetchAllItems(filters);
    }, [filters, fetchAllItems]);

    const itemTypes = ["IMPLANT", "EQUIPMENT", "CONSUMABLE", "ANESTHESIA_DRUG", "IV_FLUID", "MEDICATION","OT_PACKAGE", "OTHER"];

    // Client-side filtering logic as requested (Only using GET_ALL result)
    const displayItems = items.filter(item => {
        const matchesSearch = searchTerm.trim() === "" || 
            item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && item) {
            setSelectedId(item.id);
            setFormData({
                itemCode: item.itemCode || "",
                itemName: item.itemName || "",
                itemType: item.itemType || "CONSUMABLE",
                category: item.category || "",
                subCategory: item.subCategory || "",
                manufacturer: item.manufacturer || "",
                modelNumber: item.modelNumber || "",
                description: item.description || "",
                unit: item.unit || ""
            });
        } else {
            setFormData({ itemCode: "", itemName: "", itemType: "CONSUMABLE", category: "", subCategory: "", manufacturer: "", modelNumber: "", description: "", unit: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (modalMode === "ADD") {
            res = await addItem(formData);
        } else {
            res = await editItem(selectedId, formData);
        }

        if (res.success) {
            alert(`Item ${modalMode === "ADD" ? 'Created' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchAllItems(filters);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Permanently delete this entry from the medical catalog?")) {
            const res = await removeItem(id);
            if (!res.success) alert(res.message || "Failed to delete.");
        }
    };

    const handleStatusToggle = async (id, status) => {
        const res = await toggleItemStatus(id, status);
        if (res.success) fetchAllItems(filters);
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'EQUIPMENT': return '#3b82f6';
            case 'CONSUMABLE': return '#10b981';
            case 'ANESTHESIA_DRUG': return '#ef4444';
            case 'IMPLANT': return '#8b5cf6';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Clinical Item Catalog</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>Standardized repository for OT inventory and medical devices</p>
                </div>
                <button 
                    onClick={() => openModal("ADD")}
                    style={{
                        padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Register Item
                </button>
            </div>

            {/* Filter Controls — now focusing on the single GET_ALL integration */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", 
                backgroundColor: "white", padding: "1rem", borderRadius: "8px", 
                border: "1px solid var(--hospital-border)", flexWrap: "wrap", alignItems: "center"
            }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search current catalog (name, code, manufacturer)..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                    value={filters.itemType}
                    onChange={(e) => setFilters({...filters, itemType: e.target.value})}
                >
                    <option value="">All Types</option>
                    {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                    value={filters.isActive}
                    onChange={(e) => setFilters({...filters, isActive: e.target.value})}
                >
                    <option value="">Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>

            {loading && !isModalOpen && <div style={{ textAlign: "center", padding: "3rem" }}>Loading technical catalog...</div>}
            {error && !isModalOpen && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1100px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Item Identifier</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Type & Category</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>UOM (Unit)</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Manufacturer</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayItems.length > 0 ? displayItems.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                <td style={{ padding: "1rem 1.5rem", maxWidth: "300px" }}>
                                    <div style={{ fontWeight: "700", fontSize: "0.9375rem", color: "var(--hospital-text-primary)" }}>{item.itemName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{item.itemCode || 'N/A'}</div>
                                    {item.description && (
                                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical" }}>
                                            {item.description}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ 
                                        fontSize: "0.65rem", fontWeight: "800", padding: "0.2rem 0.5rem", 
                                        backgroundColor: `${getTypeColor(item.itemType)}15`, color: getTypeColor(item.itemType),
                                        borderRadius: "4px", border: `1px solid ${getTypeColor(item.itemType)}30`,
                                        display: "inline-block", marginBottom: "0.25rem"
                                    }}>
                                        {item.itemType}
                                    </span>
                                    <div style={{ fontSize: "0.8125rem", fontWeight: "600" }}>{item.category}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.subCategory}</div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ fontSize: "0.875rem", color: "var(--hospital-text-primary)", fontWeight: "500" }}>{item.unit || "N/A"}</div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ fontSize: "0.8125rem", fontWeight: "500" }}>{item.manufacturer || "N/A"}</div>
                                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{item.modelNumber}</div>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ 
                                        fontSize: "0.75rem", fontWeight: "700", 
                                        color: item.isActive ? "#10b981" : "#ef4444",
                                        backgroundColor: item.isActive ? "#f0fdf4" : "#fef2f2",
                                        padding: "0.25rem 0.5rem", borderRadius: "4px"
                                    }}>
                                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button 
                                            onClick={() => navigate(`/ot-price-catalog/${item.id}`)} 
                                            style={{ 
                                                padding: "0.4rem 0.6rem", backgroundColor: "#f0f9ff", 
                                                border: "1px solid #7dd3fc", color: "#0369a1", 
                                                borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700",
                                                display: "flex", alignItems: "center", gap: "0.3rem"
                                            }} 
                                            title="Financial Specifications"
                                        >
                                            <i className="fa-solid fa-tags"></i> Pricing
                                        </button>
                                        <button onClick={() => openModal("EDIT", item)} style={{ padding: "0.4rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }} title="Edit Entry">
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleStatusToggle(item.id, item.isActive)}
                                            style={{ 
                                                padding: "0.4rem 0.8rem", 
                                                backgroundColor: item.isActive ? "#fef2f2" : "#f0fdf4", 
                                                color: item.isActive ? "#dc2626" : "#16a34a", 
                                                border: `1px solid ${item.isActive ? "#fecaca" : "#bbf7d0"}`,
                                                borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700"
                                            }}
                                        >
                                            {item.isActive ? "Disable" : "Enable"}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} style={{ padding: "0.4rem", backgroundColor: "white", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "4px", cursor: "pointer" }} title="Permanently Delete">
                                            <i className="fa-solid fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    No entries found in the clinical repository.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "700px", width: "100%", maxHeight: "95vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{modalMode === "ADD" ? "Register Item in Catalog" : "Update Entry Specs"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ITEM NAME</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} placeholder="e.g. Surgical Gloves (Sterile)" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ITEM CODE</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.itemCode} onChange={e => setFormData({...formData, itemCode: e.target.value})} placeholder="e.g. ITEM-101" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>CLASSIFICATION</label>
                                <select style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.itemType} onChange={e => setFormData({...formData, itemType: e.target.value})}>
                                    {itemTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>CATEGORY</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Surgery/Anesthesia" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>SUB-CATEGORY</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} placeholder="Gloves/Drugs" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>MANUFACTURER</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} placeholder="Company Name" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>MODEL / PART NUMBER</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.modelNumber} onChange={e => setFormData({...formData, modelNumber: e.target.value})} placeholder="Version/Model No." />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>UNIT OF MEASURE (UOM)</label>
                                <input style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Box (100 Pieces) / per piece" />
                            </div>
                            
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>TECHNICAL DESCRIPTION</label>
                                <textarea style={{ width: "100%", padding: "0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", height: "80px", resize: "none" }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Clinical specifications and usage notes..." />
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    {modalMode === "ADD" ? "Initialize Item Record" : "Save Updated Specs"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CatalogManagement;
