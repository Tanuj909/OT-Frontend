import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEquipment } from "../hooks/useEquipment";
import EquipmentPricing from "../components/EquipmentPricing";

const EquipmentStatus = {
    OPERATIONAL: "OPERATIONAL",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
    OUT_OF_SERVICE: "OUT_OF_SERVICE",
    CALIBRATION_REQUIRED: "CALIBRATION_REQUIRED",
    RETIRED: "RETIRED"
};

const EquipmentCategory = {
    SURGICAL: "SURGICAL",
    MONITORING: "MONITORING",
    ANESTHESIA: "ANESTHESIA",
    LIGHTING: "LIGHTING",
    IMAGING: "IMAGING",
    STERILIZATION: "STERILIZATION",
    SUPPORT: "SUPPORT"
};

const EquipmentManagement = () => {
    const navigate = useNavigate();
    const { 
        loading, 
        error, 
        equipmentList, 
        fetchAllEquipment, 
        addEquipment, 
        editEquipment, 
        updateStatus, 
        removeEquipment 
    } = useEquipment();

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ADD"); // ADD or EDIT
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Pricing States
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [pricingEquipment, setPricingEquipment] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        model: "",
        manufacturer: "",
        serialNumber: "",
        assetCode: "",
        status: EquipmentStatus.OPERATIONAL,
        category: EquipmentCategory.SURGICAL,
        purchaseDate: "",
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
        capabilities: "" // String, will convert to array
    });

    useEffect(() => {
        fetchAllEquipment();
    }, [fetchAllEquipment]);

    const displayEquipment = equipmentList.filter(e => {
        const matchesSearch = searchTerm.trim() === "" || 
            e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.assetCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === "" || e.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });

    const openModal = (mode, equipment = null) => {
        setModalMode(mode);
        if (mode === "EDIT" && equipment) {
            setSelectedId(equipment.id);
            // Format dates (YYYY-MM-DD for date inputs)
            const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : "";
            
            setFormData({
                name: equipment.name || "",
                model: equipment.model || "",
                manufacturer: equipment.manufacturer || "",
                serialNumber: equipment.serialNumber || "",
                assetCode: equipment.assetCode || "",
                status: equipment.status || EquipmentStatus.OPERATIONAL,
                category: equipment.category || EquipmentCategory.SURGICAL,
                purchaseDate: fmtDate(equipment.purchaseDate),
                lastMaintenanceDate: fmtDate(equipment.lastMaintenanceDate),
                nextMaintenanceDate: fmtDate(equipment.nextMaintenanceDate),
                capabilities: Array.isArray(equipment.capabilities) ? equipment.capabilities.join(", ") : ""
            });
        } else {
            setFormData({
                name: "",
                model: "",
                manufacturer: "",
                serialNumber: "",
                assetCode: "",
                status: EquipmentStatus.OPERATIONAL,
                category: EquipmentCategory.SURGICAL,
                purchaseDate: new Date().toISOString().split('T')[0],
                lastMaintenanceDate: "",
                nextMaintenanceDate: "",
                capabilities: ""
            });
        }
        setIsModalOpen(true);
    };

    const openPricingModal = (equipment) => {
        setPricingEquipment(equipment);
        setIsPricingModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert capabilities string to array
        const capsArray = formData.capabilities
            ? formData.capabilities.split(',').map(s => s.trim()).filter(s => s !== "")
            : [];
            
        // Append time to dates for API compatibility if needed (user provided ISO-like format in cURL)
        const submissionData = {
            ...formData,
            capabilities: capsArray,
            purchaseDate: formData.purchaseDate ? `${formData.purchaseDate}T00:00:00` : null,
            lastMaintenanceDate: formData.lastMaintenanceDate ? `${formData.lastMaintenanceDate}T00:00:00` : null,
            nextMaintenanceDate: formData.nextMaintenanceDate ? `${formData.nextMaintenanceDate}T00:00:00` : null
        };

        let res;
        if (modalMode === "ADD") {
            res = await addEquipment(submissionData);
        } else {
            res = await editEquipment(selectedId, submissionData);
        }

        if (res.success) {
            alert(`Equipment ${modalMode === "ADD" ? 'Registered' : 'Updated'} Successfully`);
            setIsModalOpen(false);
            fetchAllEquipment();
        } else {
            alert(res.message || "Operation failed.");
        }
    };

    const handleStatusUpdate = async (id, currentStatus) => {
        const statuses = Object.keys(EquipmentStatus);
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const nextStatus = statuses[nextIndex];
        
        const res = await updateStatus(id, nextStatus);
        if (res.success) fetchAllEquipment();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Permanent removal of medical asset from the registry. Confirm?")) {
            const res = await removeEquipment(id);
            if (res.success) fetchAllEquipment();
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case EquipmentStatus.OPERATIONAL: return { color: "#16a34a", bg: "#f0fdf4" };
            case EquipmentStatus.UNDER_MAINTENANCE: return { color: "#ea580c", bg: "#fff7ed" };
            case EquipmentStatus.CALIBRATION_REQUIRED: return { color: "#2563eb", bg: "#eff6ff" };
            case EquipmentStatus.OUT_OF_SERVICE: return { color: "#dc2626", bg: "#fef2f2" };
            case EquipmentStatus.RETIRED: return { color: "#64748b", bg: "#f8fafc" };
            default: return { color: "#1e293b", bg: "#f1f5f9" };
        }
    };

    return (
        <div style={{ padding: "1.5rem" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--hospital-text-primary)" }}>Medical Equipment Inventory</h1>
                    <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.875rem" }}>Monitor maintenance schedules and operational status of hospital assets</p>
                </div>
                <button 
                    onClick={() => openModal("ADD")}
                    style={{
                        padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", 
                        border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    <i className="fa-solid fa-plus"></i> Register Asset
                </button>
            </div>

            {/* Filter Section */}
            <div style={{ 
                display: "flex", gap: "1rem", marginBottom: "1.5rem", 
                backgroundColor: "white", padding: "1rem", borderRadius: "8px", 
                border: "1px solid var(--hospital-border)", flexWrap: "wrap", alignItems: "center"
            }}>
                <div style={{ position: "relative", flex: "1", minWidth: "250px" }}>
                    <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, asset code, or serial..." 
                        style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    style={{ padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "180px", color: "#64748b", fontWeight: "600" }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {Object.values(EquipmentCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {loading && !isModalOpen && <div style={{ textAlign: "center", padding: "3rem" }}>Scanning medical asset registry...</div>}
            {error && !isModalOpen && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

            {/* Table */}
            <div className="login-card" style={{ padding: 0, overflowX: "auto", border: "1px solid var(--hospital-border)", boxShadow: "none", maxWidth: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1100px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid var(--hospital-border)" }}>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Equipment Details</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Category</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Codes (Asset / Serial)</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Maintenance</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Operational Status</th>
                            <th style={{ padding: "1rem 1.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayEquipment.map((e) => {
                            const statusStyle = getStatusColor(e.status);
                            const nextMaint = e.nextMaintenanceDate ? new Date(e.nextMaintenanceDate) : null;
                            const isOverdue = nextMaint && nextMaint < new Date();
                            
                            return (
                                <tr key={e.id} style={{ borderBottom: "1px solid var(--hospital-border)" }}>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ fontWeight: "800", color: "#0f172a" }}>{e.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{e.manufacturer} | {e.model}</div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span style={{ fontSize: "0.7rem", fontWeight: "900", color: "var(--hospital-blue)", textTransform: "uppercase" }}>{e.category}</span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "#334155" }}>{e.assetCode}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>S/N: {e.serialNumber}</div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: "700", color: isOverdue ? "#dc2626" : "#64748b" }}>
                                            Next: {nextMaint ? nextMaint.toLocaleDateString() : "TBD"}
                                        </div>
                                        <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Last: {e.lastMaintenanceDate ? new Date(e.lastMaintenanceDate).toLocaleDateString() : "Never"}</div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span 
                                            onClick={() => handleStatusUpdate(e.id, e.status)}
                                            style={{ 
                                                fontSize: "0.65rem", fontWeight: "900", cursor: "pointer",
                                                color: statusStyle.color, backgroundColor: statusStyle.bg,
                                                padding: "0.3rem 0.6rem", borderRadius: "12px",
                                                border: `1px solid ${statusStyle.color}44`,
                                                textTransform: "uppercase", letterSpacing: "0.5px"
                                            }}
                                        >
                                            {e.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button 
                                                onClick={() => navigate(`/equipment-attributes/${e.id}`)}
                                                style={{ padding: "0.4rem 0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }} 
                                                title="Technical Attributes"
                                            >
                                                <i className="fa-solid fa-microscope"></i> Attributes
                                            </button>
                                            <button 
                                                onClick={() => openPricingModal(e)}
                                                style={{ 
                                                    padding: "0.4rem 0.8rem", backgroundColor: "#f0fdf4", color: "#16a34a", 
                                                    border: "1px solid #dcfce7", borderRadius: "4px", cursor: "pointer", 
                                                    fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" 
                                                }} 
                                                title="Manage Billing Rates"
                                            >
                                                <i className="fa-solid fa-indian-rupee-sign"></i> Pricing
                                            </button>
                                            <button onClick={() => openModal("EDIT", e)} style={{ padding: "0.4rem", backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#0f172a" }} title="Calibrate Specifications">
                                                <i className="fa-solid fa-gears"></i>
                                            </button>
                                            <button onClick={() => handleDelete(e.id)} style={{ padding: "0.4rem", backgroundColor: "#fff", border: "1px solid #fee2e2", borderRadius: "4px", cursor: "pointer", color: "#ef4444" }}>
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {displayEquipment.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: "5rem", textAlign: "center", color: "#94a3b8" }}>
                                    <i className="fa-solid fa-microscope" style={{ fontSize: "2.5rem", marginBottom: "1rem", display: "block", color: "#e2e8f0" }}></i>
                                    No medical equipment registered for the selected criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem", backdropFilter: "blur(4px)" }}>
                    <form onSubmit={handleSubmit} className="login-card" style={{ maxWidth: "800px", width: "100%", maxHeight: "95vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1, paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>{modalMode === "ADD" ? "Register Medical Asset" : "Calibrate Asset Specifications"}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#94a3b8" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>EQUIPMENT NAME</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required placeholder="e.g. Dräger Anesthesia Machine" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>CATEGORY</label>
                                <select style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", backgroundColor: "#fff" }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    {Object.values(EquipmentCategory).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>MANUFACTURER</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required placeholder="e.g. Dräger" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>MODEL</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required placeholder="Primus X2" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>SERIAL NUMBER</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required placeholder="DRG-XXXX" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>ASSET CODE</label>
                                <input style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required placeholder="EQ-XXX-001" value={formData.assetCode} onChange={e => setFormData({...formData, assetCode: e.target.value})} />
                            </div>
                             <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>STATUS</label>
                                <select style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", backgroundColor: "#fff" }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    {Object.values(EquipmentStatus).map(s => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ gridColumn: "span 2", height: "1px", backgroundColor: "#f1f5f9", margin: "0.5rem 0" }}></div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PURCHASE DATE</label>
                                <input type="date" style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} required value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>LAST MAINTENANCE</label>
                                <input type="date" style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} value={formData.lastMaintenanceDate} onChange={e => setFormData({...formData, lastMaintenanceDate: e.target.value})} />
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>NEXT MAINTENANCE</label>
                                <input type="date" style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600" }} value={formData.nextMaintenanceDate} onChange={e => setFormData({...formData, nextMaintenanceDate: e.target.value})} />
                            </div>
                            
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>EQUIPMENT CAPABILITIES (Comma separated)</label>
                                <textarea style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", height: "80px", resize: "none" }} placeholder="e.g. Ventilation, Patient Monitoring, Alarm System" value={formData.capabilities} onChange={e => setFormData({...formData, capabilities: e.target.value})} />
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                                <button type="submit" style={{ width: "100%", padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    {modalMode === "ADD" ? "Authorize Registry" : "Verification & Save Changes"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {isPricingModalOpen && pricingEquipment && (
                <EquipmentPricing
                    isOpen={isPricingModalOpen}
                    onClose={() => {
                        setIsPricingModalOpen(false);
                        setPricingEquipment(null);
                    }}
                    equipment={pricingEquipment}
                />
            )}
        </div>
    );
};

export default EquipmentManagement;
