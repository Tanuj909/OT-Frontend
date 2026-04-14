import React, { useState, useEffect } from 'react';
import { useStaffFees } from '../hooks/useStaffFees';

const AddChargesModal = ({ staff, onClose }) => {
    const { getStaffFees, createStaffFees, updateStaffFees, loading } = useStaffFees();
    const [existingFees, setExistingFees] = useState(null);
    const [formData, setFormData] = useState({
        consultationFee: '',
        otFee: '',
        visitFee: '',
        emergencyFee: '',
        isActive: true
    });
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            const data = await getStaffFees(staff.id);
            if (data) {
                setExistingFees(data);
                setFormData({
                    consultationFee: data.consultationFee,
                    otFee: data.otFee,
                    visitFee: data.visitFee,
                    emergencyFee: data.emergencyFee,
                    isActive: data.isActive
                });
            }
            setFetching(false);
        };
        fetchFees();
    }, [staff.id, getStaffFees]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            staffId: staff.id,
            consultationFee: parseFloat(formData.consultationFee) || 0,
            otFee: parseFloat(formData.otFee) || 0,
            visitFee: parseFloat(formData.visitFee) || 0,
            emergencyFee: parseFloat(formData.emergencyFee) || 0,
            isActive: formData.isActive
        };

        let result;
        if (existingFees) {
            result = await updateStaffFees(staff.id, payload);
        } else {
            result = await createStaffFees(payload);
        }

        if (result) {
            onClose();
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "1rem" }}>
            <div className="login-card" style={{ maxWidth: "500px", width: "100%", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", margin: 0 }}>Configure Staff Charges</h2>
                        <p style={{ color: "var(--hospital-text-secondary)", fontSize: "0.85rem", margin: 0 }}>{staff.name}</p>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                {fetching ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>Loading current fees...</div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>CONSULTATION FEE</label>
                            <input 
                                type="number" 
                                name="consultationFee" 
                                style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} 
                                required 
                                value={formData.consultationFee} 
                                onChange={handleChange} 
                                placeholder="0" 
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>OT FEE</label>
                            <input 
                                type="number" 
                                name="otFee" 
                                style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} 
                                required 
                                value={formData.otFee} 
                                onChange={handleChange} 
                                placeholder="0" 
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>VISIT FEE</label>
                            <input 
                                type="number" 
                                name="visitFee" 
                                style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} 
                                required 
                                value={formData.visitFee} 
                                onChange={handleChange} 
                                placeholder="0" 
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>EMERGENCY FEE</label>
                            <input 
                                type="number" 
                                name="emergencyFee" 
                                style={{ width: "100%", padding: "0.7rem", border: "1px solid #cbd5e1", borderRadius: "6px" }} 
                                required 
                                value={formData.emergencyFee} 
                                onChange={handleChange} 
                                placeholder="0" 
                            />
                        </div>
                        {existingFees && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input 
                                    type="checkbox" 
                                    name="isActive" 
                                    id="isActive"
                                    checked={formData.isActive} 
                                    onChange={handleChange} 
                                />
                                <label htmlFor="isActive" style={{ fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>Active Configuration</label>
                            </div>
                        )}
                        
                        <div style={{ marginTop: "1rem" }}>
                            <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.8rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                                {loading ? 'Saving...' : existingFees ? "Update Charges" : "Create Charges"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddChargesModal;
