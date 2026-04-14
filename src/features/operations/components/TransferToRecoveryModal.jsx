import React, { useState, useEffect } from 'react';
import { useWard } from '../../admin/hooks/useWard';
import { useWardRoom } from '../../admin/hooks/useWardRoom';
import { useWardBed } from '../../admin/hooks/useWardBed';
import { useWardAdmission } from '../../admin/hooks/useWardAdmission';

const TransferToRecoveryModal = ({ operation, onClose, onSuccess }) => {
    const { wards, fetchAllWards } = useWard();
    const { fetchAvailableRoomsByWard } = useWardRoom();
    const { beds, fetchBedsByRoom } = useWardBed();
    const { assignToWard, loading: assigning } = useWardAdmission();

    const [selectedWard, setSelectedWard] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedBed, setSelectedBed] = useState(null);
    const [step, setStep] = useState(1); // 1: Ward, 2: Room, 3: Bed, 4: Confirm
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingBeds, setLoadingBeds] = useState(false);

    useEffect(() => {
        fetchAllWards({ isActive: true });
    }, [fetchAllWards]);

    const handleSelectWard = async (ward) => {
        setSelectedWard(ward);
        setLoadingRooms(true);
        const res = await fetchAvailableRoomsByWard(ward.id);
        if (res.success) {
            setRooms(res.data || []);
            setStep(2);
        } else {
            alert("No available rooms in this ward.");
        }
        setLoadingRooms(false);
    };

    const handleSelectRoom = async (room) => {
        setSelectedRoom(room);
        setLoadingBeds(true);
        const res = await fetchBedsByRoom(room.id, { isActive: true, status: 'AVAILABLE' });
        if (res.success) {
            setStep(3);
        } else {
            alert("No available beds in this room.");
        }
        setLoadingBeds(false);
    };

    const handleSelectBed = (bed) => {
        setSelectedBed(bed);
        setStep(4);
    };

    const handleFinalize = async () => {
        const res = await assignToWard({
            operationId: operation.operationId,
            wardRoomId: selectedRoom.id,
            wardBedId: selectedBed.id
        });

        if (res.success) {
            alert("Patient successfully transferred to recovery.");
            onSuccess();
            onClose();
        } else {
            alert(res.message || "Failed to transfer patient.");
        }
    };

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            zIndex: 1500, padding: "2rem", backdropFilter: "blur(4px)"
        }}>
            <div style={{
                backgroundColor: "#f8fafc", width: "100%", maxWidth: "700px", 
                borderRadius: "24px", display: "flex", flexDirection: "column", 
                overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
                <div style={{ padding: "1.5rem 2rem", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#1e293b", margin: 0 }}>Transfer to Recovery</h2>
                        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>{operation.patientName} • MRN: {operation.patientMrn}</p>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{ padding: "1rem 2rem", backgroundColor: "white", display: "flex", gap: "0.5rem" }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{ 
                            flex: 1, height: "4px", borderRadius: "2px", 
                            backgroundColor: step >= s ? "var(--hospital-blue)" : "#e2e8f0",
                            transition: "all 0.3s"
                        }}></div>
                    ))}
                </div>

                <div style={{ padding: "2rem", maxHeight: "60vh", overflowY: "auto" }}>
                    {step === 1 && (
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#334155", marginBottom: "1.5rem" }}>Step 1: Select Ward</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                {wards.map(ward => (
                                    <button 
                                        key={ward.id} 
                                        onClick={() => handleSelectWard(ward)}
                                        style={{
                                            padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0",
                                            backgroundColor: "white", textAlign: "left", cursor: "pointer",
                                            transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "0.5rem"
                                        }}
                                        className="ward-select-card"
                                    >
                                        <div style={{ color: "var(--hospital-blue)", fontWeight: "800" }}>{ward.wardName}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{ward.wardNumber} • {ward.availableBeds} Available Beds</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#334155", margin: 0 }}>Step 2: Select Room in {selectedWard.wardName}</h3>
                                <button onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--hospital-blue)", fontWeight: "700", cursor: "pointer" }}>Back</button>
                            </div>
                            {loadingRooms ? <div style={{ textAlign: "center", padding: "2rem" }}>Searching available rooms...</div> : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                                    {rooms.length > 0 ? rooms.map(room => (
                                        <button 
                                            key={room.id} 
                                            onClick={() => handleSelectRoom(room)}
                                            style={{
                                                padding: "1.25rem", borderRadius: "16px", border: "1px solid #e2e8f0",
                                                backgroundColor: "white", textAlign: "left", cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            <div style={{ fontWeight: "800", color: "#1e293b" }}>{room.roomName}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--hospital-blue)", fontWeight: "600" }}>{room.roomNumber} ({room.roomType})</div>
                                            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.5rem" }}>{room.availableBeds} Beds Available</div>
                                        </button>
                                    )) : <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b" }}>No available rooms in this ward.</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#334155", margin: 0 }}>Step 3: Select Bed in {selectedRoom.roomName}</h3>
                                <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "var(--hospital-blue)", fontWeight: "700", cursor: "pointer" }}>Back</button>
                            </div>
                            {loadingBeds ? <div style={{ textAlign: "center", padding: "2rem" }}>Locating available beds...</div> : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "1rem" }}>
                                    {beds.length > 0 ? beds.map(bed => (
                                        <button 
                                            key={bed.id} 
                                            onClick={() => handleSelectBed(bed)}
                                            style={{
                                                padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0",
                                                backgroundColor: "white", textAlign: "center", cursor: "pointer"
                                            }}
                                        >
                                            <i className="fa-solid fa-bed" style={{ fontSize: "1.2rem", color: "#10b981", marginBottom: "0.5rem", display: "block" }}></i>
                                            <div style={{ fontWeight: "800", fontSize: "0.9rem" }}>{bed.bedNumber}</div>
                                        </button>
                                    )) : <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b" }}>No available beds in this room.</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ textAlign: "center", padding: "1rem" }}>
                            <div style={{ 
                                width: "64px", height: "64px", backgroundColor: "#ecfdf5", color: "#10b981", 
                                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                                fontSize: "1.5rem", margin: "0 auto 1.5rem"
                            }}>
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#1e293b", marginBottom: "1rem" }}>Confirm Transfer</h3>
                            <div style={{ backgroundColor: "#f1f5f9", padding: "1.5rem", borderRadius: "16px", textAlign: "left", marginBottom: "2rem" }}>
                                <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Ward:</span>
                                    <span style={{ fontWeight: "800", color: "#1e293b" }}>{selectedWard?.wardName}</span>
                                </div>
                                <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Room:</span>
                                    <span style={{ fontWeight: "800", color: "#1e293b" }}>{selectedRoom?.roomName} ({selectedRoom?.roomNumber})</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Bed:</span>
                                    <span style={{ fontWeight: "800", color: "#1e293b" }}>{selectedBed?.bedNumber}</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button onClick={() => setStep(3)} style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid #cbd5e1", backgroundColor: "white", fontWeight: "700", cursor: "pointer" }}>Change Selection</button>
                                <button 
                                    onClick={handleFinalize} 
                                    disabled={assigning}
                                    style={{ 
                                        flex: 2, padding: "1rem", borderRadius: "12px", border: "none", 
                                        backgroundColor: "var(--hospital-blue)", color: "white", fontWeight: "800", 
                                        cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(30, 64, 175, 0.3)" 
                                    }}
                                >
                                    {assigning ? "Assigning..." : "Finalize Admission"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransferToRecoveryModal;
