import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEquipmentAttribute } from "../hooks/useEquipmentAttribute";
import { useEquipment } from "../hooks/useEquipment";

const ATTRIBUTE_TYPES = ["STRING", "INTEGER", "DECIMAL", "BOOLEAN", "DATE", "JSON"];

const EquipmentAttributePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { 
        loading: attrLoading, 
        error: attrError, 
        attributes, 
        fetchAttributes, 
        addAttribute, 
        editAttribute, 
        removeAttribute 
    } = useEquipmentAttribute();

    const { selectedEquipment, fetchEquipmentById } = useEquipment();
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
    const [editId, setEditId] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        attributeName: "",
        attributeValue: "",
        attributeType: "STRING",
        required: false,
        system: false
    });

    const initData = useCallback(async () => {
        await fetchEquipmentById(id);
        await fetchAttributes(id);
    }, [id, fetchEquipmentById, fetchAttributes]);

    useEffect(() => {
        if (id) {
            initData();
        }
    }, [id, initData]);

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && item) {
            setEditId(item.id);
            setFormData({
                attributeName: item.attributeName || "",
                attributeValue: item.attributeValue || "",
                attributeType: item.attributeType || "STRING",
                required: item.required || false,
                system: item.system || false
            });
        } else {
            setEditId(null);
            setFormData({
                attributeName: "",
                attributeValue: "",
                attributeType: "STRING",
                required: false,
                system: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let res;
        
        if (modalMode === "ADD") {
            res = await addAttribute(id, formData);
        } else {
            res = await editAttribute(id, editId, formData);
        }

        if (res.success) {
            alert(`Attribute ${modalMode === "ADD" ? 'Added' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchAttributes(id);
        } else {
            alert(res.message || "Operation failed.");
        }
    };

    const handleDelete = async (attrId) => {
        if (window.confirm("Are you sure you want to delete this attribute?")) {
            const res = await removeAttribute(id, attrId);
            if (res.success) fetchAttributes(id);
        }
    };

    if (attrLoading && !attributes.length) {
        return <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading attributes...</div>;
    }

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Equipment Attributes</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>
                        Manage extra details for {selectedEquipment?.name || `Asset #${id}`}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => navigate("/equipment-management")}
                        style={{ padding: "0.75rem 1.2rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.875rem", color: "#64748b" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Inventory
                    </button>
                    <button 
                        onClick={() => openModal("ADD")}
                        style={{
                            padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                            border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "0.5rem"
                        }}
                    >
                        <i className="fa-solid fa-plus"></i> Add Attribute
                    </button>
                </div>
            </div>

            {attrError && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{attrError}</div>}

            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Attribute Name</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Value</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Type</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attributes.length > 0 ? attributes.map((a) => (
                            <tr key={a.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{a.attributeName}</div>
                                    {a.system && <span style={{ fontSize: "0.6rem", backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.1rem 0.3rem", borderRadius: "2px", fontWeight: "900" }}>SYSTEM</span>}
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <code style={{ backgroundColor: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "700", fontSize: "0.875rem" }}>{a.attributeValue}</code>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b" }}>{a.attributeType}</span>
                                </td>
                                <td style={{ padding: "1rem 1.5rem" }}>
                                    {a.required ? (
                                        <span style={{ color: "#dc2626", fontSize: "0.7rem", fontWeight: "700" }}>Required</span>
                                    ) : (
                                        <span style={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: "600" }}>Optional</span>
                                    )}
                                </td>
                                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        <button onClick={() => openModal("EDIT", a)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(a.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fff", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "var(--hospital-text-secondary)" }}>
                                    <i className="fa-solid fa-sliders" style={{ fontSize: "2rem", color: "#e2e8f0", marginBottom: "1rem", display: "block" }}></i>
                                    No attributes defined.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "500px", width: "100%", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{modalMode === "ADD" ? "Add Attribute" : "Edit Attribute"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>ATTRIBUTE NAME</label>
                                <input style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} required placeholder="e.g. Weight Capacity" value={formData.attributeName} onChange={e => setFormData({...formData, attributeName: e.target.value})} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>VALUE</label>
                                <input style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "600" }} required placeholder="e.g. 250kg" value={formData.attributeValue} onChange={e => setFormData({...formData, attributeValue: e.target.value})} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>TYPE</label>
                                <select style={{ width: "100%", padding: "0.7rem", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", backgroundColor: "#fff" }} value={formData.attributeType} onChange={e => setFormData({...formData, attributeType: e.target.value})}>
                                    {ATTRIBUTE_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600" }}>
                                    <input type="checkbox" style={{ width: "18px", height: "18px" }} checked={formData.required} onChange={e => setFormData({...formData, required: e.target.checked})} />
                                    Required
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600" }}>
                                    <input type="checkbox" style={{ width: "18px", height: "18px" }} checked={formData.system} onChange={e => setFormData({...formData, system: e.target.checked})} />
                                    System
                                </label>
                            </div>
                            
                            <div style={{ marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.9rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase" }}>
                                    {modalMode === "ADD" ? "Add Attribute" : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EquipmentAttributePage;
