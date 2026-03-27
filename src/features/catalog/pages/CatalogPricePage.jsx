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
                // Only auto-open modal if item exists but price doesn't
                const resItem = await fetchItemById(id);
                if (resItem.success) {
                    setCatalogItem(resItem.data);
                    setIsModalOpen(true);
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
        return (
            <div style={{ height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", border: "3px solid #f1f5f9", borderTopColor: "var(--hospital-blue)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "#64748b", fontWeight: "600", fontSize: "0.875rem" }}>Auditing financial records...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const itemTitle = selectedPrice?.itemName || catalogItem?.itemName || "Item Details";
    const itemCode = selectedPrice?.itemCode || catalogItem?.itemCode || "N/A";

    return (
        <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                         <span style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--hospital-blue)", backgroundColor: "#eff6ff", padding: "0.2rem 0.6rem", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Catalog Price Feed</span>
                         <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>ID: #{id}</span>
                    </div>
                    <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "#0f172a", lineHeight: "1.1", marginBottom: "0.5rem" }}>
                        {itemTitle}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>
                            <i className="fa-solid fa-barcode"></i> {itemCode}
                        </div>
                        <div style={{ width: "4px", height: "4px", backgroundColor: "#cbd5e1", borderRadius: "50%" }}></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.875rem", fontWeight: "600" }}>
                            <i className="fa-solid fa-tag"></i> {isNotFound ? "Uninitialized" : "Price Confirmed"}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => navigate("/ot-item-catalog")}
                        style={{ padding: "0.75rem 1.25rem", backgroundColor: "white", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "0.875rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Catalog
                    </button>
                    {!isNotFound && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
                        >
                            <i className="fa-solid fa-pen-to-square"></i> Modify Rates
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            {!isNotFound && selectedPrice ? (
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
                    {/* Financial Summary Card */}
                    <div style={{ backgroundColor: "white", borderRadius: "24px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <div style={{ padding: "1.75rem", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(to right, #f8fafc, white)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.75rem", color: "#1e293b" }}>
                                <i className="fa-solid fa-file-invoice-dollar" style={{ color: "var(--hospital-blue)" }}></i> Pricing Breakdown
                            </h3>
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", backgroundColor: "#f1f5f9", padding: "0.3rem 0.75rem", borderRadius: "6px" }}>
                                HSN: {selectedPrice.hsnCode}
                            </div>
                        </div>

                        <div style={{ padding: "1.75rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem" }}>Base Procurement Cost</span>
                                    <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#334155" }}>₹ {selectedPrice.basePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem" }}>Hospital Discount ({selectedPrice.discountPercent}%)</span>
                                    <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#ef4444" }}>- ₹ {selectedPrice.discountAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "0.5rem 0" }}></div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem" }}>Subtotal (Pre-Tax)</span>
                                    <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#334155" }}>₹ {selectedPrice.priceAfterDiscount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "0.95rem" }}>GST Taxation ({selectedPrice.gstPercent}%)</span>
                                    <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#10b981" }}>+ ₹ {selectedPrice.gstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "2rem 1.75rem", backgroundColor: "#f0f9ff", borderTop: "2px dashed #bae6fd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <p style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Total Billable Amount</p>
                                <p style={{ fontSize: "0.875rem", color: "#0c4a6e", fontWeight: "600" }}>Final rate calculated for billing cycles</p>
                            </div>
                            <div style={{ textAlign: "right", backgroundColor: "white", padding: "0.75rem 1.5rem", borderRadius: "30px", border: "2px solid #bae6fd" }}>
                                <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--hospital-blue)", letterSpacing: "-1px" }}>₹ {selectedPrice.totalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* Status Card */}
                        <div style={{ backgroundColor: "white", borderRadius: "24px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Clinical Status</h4>
                                <span style={{ 
                                    fontSize: "0.7rem", fontWeight: "900", 
                                    color: selectedPrice.isActive ? "#16a34a" : "#dc2626",
                                    backgroundColor: selectedPrice.isActive ? "#f0fdf4" : "#fef2f2",
                                    padding: "0.3rem 0.75rem", borderRadius: "20px", border: `1px solid ${selectedPrice.isActive ? "#bcf0da" : "#fecaca"}`
                                }}>
                                    {selectedPrice.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </div>
                            
                            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem", fontWeight: "500" }}>
                                Items marked as inactive will be restricted from new surgical billing cycles and intra-op consumption logs.
                            </p>

                            <button 
                                onClick={handleStatusToggle}
                                style={{ 
                                    width: "100%", padding: "0.8rem", fontSize: "0.875rem", fontWeight: "800",
                                    backgroundColor: selectedPrice.isActive ? "#fef2f2" : "#f0fdf4",
                                    color: selectedPrice.isActive ? "#dc2626" : "#16a34a",
                                    border: "none", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                                }}
                            >
                                <i className={`fa-solid ${selectedPrice.isActive ? 'fa-ban' : 'fa-circle-check'}`}></i>
                                {selectedPrice.isActive ? "Deactivate Pricing" : "Re-activate Pricing"}
                            </button>
                        </div>

                        {/* Audit Details */}
                        <div style={{ backgroundColor: "#f8fafc", borderRadius: "24px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                             <div style={{ marginBottom: "1.25rem" }}>
                                 <p style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Initialization Authority</p>
                                 <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                     <div style={{ width: "32px", height: "32px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#64748b", fontSize: "0.75rem" }}>
                                         {selectedPrice.createdBy?.charAt(0).toUpperCase() || "S"}
                                     </div>
                                     <span style={{ fontWeight: "700", color: "#334155", fontSize: "0.95rem" }}>{selectedPrice.createdBy || "System Admin"}</span>
                                 </div>
                             </div>
                             <div>
                                 <p style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.5rem" }}>Last Verified</p>
                                 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#334155", fontWeight: "700" }}>
                                     <i className="fa-regular fa-calendar-check" style={{ color: "var(--hospital-blue)" }}></i>
                                     {new Date(selectedPrice.updatedAt || selectedPrice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            ) : isNotFound && (
                <div style={{ textAlign: "center", padding: "6rem 2rem", backgroundColor: "white", borderRadius: "32px", border: "2px dashed #e2e8f0", marginTop: "1rem" }}>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#cbd5e1", fontSize: "2rem" }}>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1e293b", marginBottom: "0.75rem" }}>Financial Profile Pending</h3>
                    <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto 2rem", fontWeight: "500", lineHeight: "1.6" }}>
                        No pricing strategy has been defined for this clinical item. Please initialize the pricing record to enable inventory tracking and surgical billing.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: "1rem 2.5rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "14px", fontWeight: "800", cursor: "pointer", fontSize: "1rem", boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)" }}
                    >
                        Initialize Item Pricing
                    </button>
                </div>
            )}

            {/* Premium Modal Form */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
                    <form 
                        onSubmit={handleSave} 
                        style={{ backgroundColor: "white", maxWidth: "600px", width: "100%", borderRadius: "28px", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}
                    >
                        {/* Modal Accent */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(to right, var(--hospital-blue), #60a5fa)" }}></div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "0.25rem" }}>
                                    {isNotFound ? "Initialize Record" : "Update Specifications"}
                                </h2>
                                <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>Configure financial attributes for surgical items</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", color: "#475569", transition: "all 0.2s" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.5rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>HSN Classification Code</label>
                                <div style={{ position: "relative" }}>
                                    <i className="fa-solid fa-hashtag" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                                    <input style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.5rem", border: "2px solid #f1f5f9", borderRadius: "12px", fontWeight: "700", fontSize: "1rem" }} required value={formData.hsnCode} onChange={e => setFormData({...formData, hsnCode: e.target.value.toUpperCase()})} placeholder="HSN-8421" />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.5rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Price (₹)</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontWeight: "800" }}>₹</span>
                                    <input type="number" step="0.01" style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.3rem", border: "2px solid #f1f5f9", borderRadius: "12px", fontWeight: "700", fontSize: "1rem" }} required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.5rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Discount (%)</label>
                                <div style={{ position: "relative" }}>
                                    <i className="fa-solid fa-percent" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.75rem" }}></i>
                                    <input type="number" step="0.1" style={{ width: "100%", padding: "0.85rem 2.3rem 0.85rem 1rem", border: "2px solid #f1f5f9", borderRadius: "12px", fontWeight: "700", fontSize: "1rem" }} required value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.5rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>GST Taxation Level</label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                                    {[0, 5, 12, 18, 28].map(rate => (
                                        <div 
                                            key={rate} 
                                            onClick={() => setFormData({...formData, gstPercent: rate})}
                                            style={{ 
                                                padding: "0.75rem 0.5rem", textAlign: "center", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem",
                                                backgroundColor: formData.gstPercent == rate ? "var(--hospital-blue)" : "#f8fafc",
                                                color: formData.gstPercent == rate ? "white" : "#475569",
                                                border: formData.gstPercent == rate ? "none" : "2px solid #f1f5f9",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {rate}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "1.1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "16px", fontWeight: "900", cursor: "pointer", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 15px 30px -5px rgba(37, 99, 235, 0.4)" }}>
                                    {isNotFound ? "Confirm & Register Specs" : "Update Financial Records"}
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
