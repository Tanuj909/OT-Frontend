import React, { useEffect, useState } from 'react';
import { useWardAdmission } from '../../admin/hooks/useWardAdmission';

const AdmissionStatusButton = ({ operationId, onTransferClick, onViewRecovery }) => {
    const { checkAdmissionStatus } = useWardAdmission();
    const [isAdmitted, setIsAdmitted] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchStatus = async () => {
            const res = await checkAdmissionStatus(operationId);
            if (isMounted) {
                if (res.success) {
                    setIsAdmitted(res.data);
                }
                setLoading(false);
            }
        };
        fetchStatus();
        return () => { isMounted = false; };
    }, [operationId, checkAdmissionStatus]);

    if (loading) return <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Checking...</div>;

    if (isAdmitted) {
        return (
            <button 
                onClick={onViewRecovery}
                style={{ 
                    padding: "0.4rem 0.8rem", 
                    backgroundColor: "#ecfdf5", 
                    color: "#059669",
                    border: "1px solid #d1fae5", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700",
                    display: "flex", alignItems: "center", gap: "0.4rem"
                }}
            >
                <i className="fa-solid fa-bed-pulse"></i> View Recovery
            </button>
        );
    }

    return (
        <button 
            onClick={onTransferClick}
            style={{ 
                padding: "0.4rem 0.8rem", 
                backgroundColor: "#fff7ed", 
                color: "#c2410c",
                border: "1px solid #ffedd5", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700",
                display: "flex", alignItems: "center", gap: "0.4rem"
            }}
        >
            <i className="fa-solid fa-truck-medical"></i> Transfer to Recovery
        </button>
    );
};

export default AdmissionStatusButton;
