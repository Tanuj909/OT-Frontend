import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCatalogPrice } from "../hooks/catalogPrice/useCatalogPrice";
import { useCatalog } from "../hooks/useCatalog";

const CatalogPricePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { 
        loading: priceLoading, 
        error: priceError, 
        selectedPrice, 
        fetchPriceById, 
        fetchPriceByCatalogItemId,
        addPrice,
        editPrice, 
        togglePriceStatus 
    } = useCatalogPrice();

    const { fetchItemById } = useCatalog();
    const [catalogItem, setCatalogItem] = useState(null);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        hsnCode: "",
        basePrice: 0,
        discountPercent: 0,
        gstPercent: 18,
        isActive: true
    });

    const loadData = useCallback(async () => {
        setIsNotFound(false);
        const resById = await fetchPriceById(id);
        
        if (!resById.success) {
            const resByItem = await fetchPriceByCatalogItemId(id);
            if (!resByItem.success) {
                setIsNotFound(true);
                setIsModalOpen(true); // Automatically open modal to "match" the request to show form
                const resItem = await fetchItemById(id);
                if (resItem.success) {
                    setCatalogItem(resItem.data);
                }
            }
        }
    }, [id, fetchPriceById, fetchPriceByCatalogItemId, fetchItemById]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

    useEffect(() => {
        if (selectedPrice) {
            setFormData({
                hsnCode: selectedPrice.hsnCode || "",
                basePrice: selectedPrice.basePrice || 0,
                discountPercent: selectedPrice.discountPercent || 0,
                gstPercent: selectedPrice.gstPercent || 18,
                isActive: selectedPrice.isActive ?? true
            });
        }
    }, [selectedPrice]);

    const handleSave = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            catalogItemId: parseInt(id),
            basePrice: parseFloat(formData.basePrice),
            discountPercent: parseFloat(formData.discountPercent),
            gstPercent: parseFloat(formData.gstPercent)
        };

        let res;
        if (isNotFound) {
            res = await addPrice(submissionData);
        } else {
            res = await editPrice(selectedPrice.id, formData);
        }

        if (res.success) {
            alert(`Financial records ${isNotFound ? 'initialized' : 'updated'} successfully`);
            setIsModalOpen(false);
            setIsNotFound(false);
            loadData();
        } else {
            alert(res.message || "Failed to process record.");
        }
    };

    const handleStatusToggle = async () => {
        const res = await togglePriceStatus(selectedPrice.id, selectedPrice.isActive);
        if (res.success) loadData();
    };

    if (priceLoading && !selectedPrice && !catalogItem && !isNotFound) {
        return <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Auditing financial records...</div>;
    }

    const itemTitle = selectedPrice?.itemName || catalogItem?.itemName || "Item Details";
    const itemCode = selectedPrice?.itemCode || catalogItem?.itemCode || "N/A";
    const itemType = selectedPrice?.itemType || catalogItem?.itemType || "CLINICAL";

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section - Matched with CatalogManagement */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>
                        {isNotFound ? "Uninitialized Pricing Strategy" : "Financial Specifications"}
                    </h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>
                        {itemTitle} ({itemCode}) — Clinical ID: #{id}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => navigate("/ot-item-catalog")}
                        style={{ padding: "0.75rem 1.2rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.875rem", color: "#64748b" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Exit
                    </button>
                    {!isNotFound && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                                border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "0.5rem"
                            }}
                        >
                            <i className="fa-solid fa-pen-to-square"></i> Update Rate
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            {!isNotFound && selectedPrice ? (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                    {/* Detailed Data Table container - styled like CatalogManagement repository */}
                    <div className="login-card" style={{ padding: 0, border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--hospital-border)", backgroundColor: "#f8fafc" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fa-solid fa-file-invoice-dollar text-hospital-blue"></i> Rate Analysis
                            </h3>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <tbody>
                                <tr style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1.25rem", color: "#64748b", fontWeight: "600", fontSize: "0.875rem", width: "40%" }}>HSN CLASSIFICATION</th>
                                    <td style={{ padding: "1.25rem", fontWeight: "700" }}>{selectedPrice.hsnCode}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1.25rem", color: "#64748b", fontWeight: "600", fontSize: "0.875rem" }}>BASE PROCUREMENT COST</th>
                                    <td style={{ padding: "1.25rem", fontWeight: "700" }}>₹{selectedPrice.basePrice?.toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1.25rem", color: "#64748b", fontWeight: "600", fontSize: "0.875rem" }}>HOSPITAL DISCOUNT ({selectedPrice.discountPercent}%)</th>
                                    <td style={{ padding: "1.25rem", fontWeight: "700", color: "#dc2626" }}>- ₹{selectedPrice.discountAmount?.toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1.25rem", color: "#64748b", fontWeight: "600", fontSize: "0.875rem" }}>SUBTOTAL (PRE-TAX)</th>
                                    <td style={{ padding: "1.25rem", fontWeight: "700" }}>₹{selectedPrice.priceAfterDiscount?.toLocaleString()}</td>
                                </tr>
                                <tr style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <th style={{ padding: "1.25rem", color: "#64748b", fontWeight: "600", fontSize: "0.875rem" }}>GST TAXATION ({selectedPrice.gstPercent}%)</th>
                                    <td style={{ padding: "1.25rem", fontWeight: "700", color: "#16a34a" }}>+ ₹{selectedPrice.gstAmount?.toLocaleString()}</td>
                                </tr>
                                <tr style={{ backgroundColor: "#f0f9ff" }}>
                                    <th style={{ padding: "1.5rem 1.25rem", color: "var(--hospital-blue)", fontWeight: "800", fontSize: "1rem" }}>NET BILLABLE AMOUNT</th>
                                    <td style={{ padding: "1.5rem 1.25rem", fontWeight: "900", fontSize: "1.5rem", color: "var(--hospital-blue)" }}>₹{selectedPrice.totalPrice?.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Metadata column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="login-card" style={{ padding: "1.5rem", border: "1px solid var(--hospital-border)" }}>
                            <h4 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "1rem", textTransform: "uppercase" }}>System Audit</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>STATUS</p>
                                    <span style={{ 
                                        fontSize: "0.75rem", fontWeight: "800", 
                                        color: selectedPrice.isActive ? "#10b981" : "#ef4444",
                                        backgroundColor: selectedPrice.isActive ? "#f0fdf4" : "#fef2f2",
                                        padding: "0.2rem 0.5rem", borderRadius: "4px", display: "inline-block", marginTop: "0.25rem"
                                    }}>
                                        {selectedPrice.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                                <button 
                                    onClick={handleStatusToggle}
                                    style={{ 
                                        width: "100%", padding: "0.6rem", fontSize: "0.875rem", fontWeight: "700",
                                        backgroundColor: selectedPrice.isActive ? "#fef2f2" : "#f0fdf4",
                                        color: selectedPrice.isActive ? "#ef4444" : "#16a34a",
                                        border: "1px solid currentColor", borderRadius: "6px", cursor: "pointer"
                                    }}
                                >
                                    {selectedPrice.isActive ? "Disable Trading" : "Enable Trading"}
                                </button>
                                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginTop: "0.5rem" }}>
                                    <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>ITEM REGISTRY TYPE</p>
                                    <p style={{ fontWeight: "700", color: "var(--hospital-text-primary)" }}>{selectedPrice.itemType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="login-card" style={{ padding: "1.5rem", border: "1px solid var(--hospital-border)", backgroundColor: "#f8fafc" }}>
                             <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>AUTHORIZED INITIALIZATION</p>
                             <p style={{ fontWeight: "700", fontSize: "0.875rem" }}>{selectedPrice.createdBy}</p>
                             <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "1rem" }}>LAST SYSTEM VERIFICATION</p>
                             <p style={{ fontWeight: "600", fontSize: "0.8125rem" }}>
                                 {new Date(selectedPrice.updatedAt || selectedPrice.createdAt).toLocaleDateString()}
                             </p>
                        </div>
                    </div>
                </div>
            ) : isNotFound && (
                <div style={{ textAlign: "center", padding: "5rem", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--hospital-border)" }}>
                    <div style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "1.5rem" }}>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#334155" }}>Pricing Record Not Initialized</h3>
                    <p style={{ color: "#64748b", maxWidth: "400px", margin: "1rem auto" }}>
                        No financial specifications found for this clinical item. Access the registration form to define base rates and taxation.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: "0.75rem 2rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                    >
                        Initialize Item Pricing
                    </button>
                </div>
            )}

            {/* Modal Form - Perfect match with CatalogManagement UX */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form onSubmit={handleSave} className="login-card" style={{ maxWidth: "600px", width: "100%", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>
                                {isNotFound ? "Initialize Pricing Record" : "Update Financial Specs"}
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>HSN CLASSIFICATION CODE</label>
                                <input style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value})} placeholder="e.g. HSN1234" />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>BASE PROCUREMENT PRICE (₹)</label>
                                <input type="number" step="0.01" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>HOSPITAL DISCOUNT (%)</label>
                                <input type="number" step="0.1" style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} required value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>GST TAXATION (%)</label>
                                <select style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} value={formData.gstPercent} onChange={e => setFormData({...formData, gstPercent: e.target.value})}>
                                    {[0, 5, 12, 18, 28].map(rate => <option key={rate} value={rate}>{rate}% GST</option>)}
                                </select>
                            </div>
                            <div style={{ alignSelf: "flex-end" }}>
                                <div style={{ border: "1px dashed #cbd5e1", borderRadius: "6px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#64748b" }}>
                                    System calculated values
                                </div>
                            </div>
                            
                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                    {isNotFound ? "Register Pricing Specs" : "Save Updated Specs"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CatalogPricePage;
