import React, { useEffect, useState, useCallback } from 'react';
import { useWardAdmission } from '../../admin/hooks/useWardAdmission';
import { useWardVitals } from '../hooks/useWardVitals';
import { useMedicationUsage } from '../hooks/useMedicationUsage';
import { useCatalog } from '../../catalog/hooks/useCatalog';
import { toast } from 'react-hot-toast';

const RecoveryDetailsModal = ({ operationId, onClose }) => {
    const { fetchActiveAdmission, loading: admissionLoading } = useWardAdmission();
    const { 
        recordVitals, 
        fetchAllVitals, 
        fetchLatestVital, 
        checkPatientStability,
        loading: vitalsLoading 
    } = useWardVitals();

    const {
        recordMedication,
        updateMedicationQuantity,
        fetchMedicationUsageByOperation,
        deleteMedicationUsage,
        loading: medUsageLoading
    } = useMedicationUsage();

    const { fetchByType: fetchCatalogByType } = useCatalog();

    const [admission, setAdmission] = useState(null);
    const [activeTab, setActiveTab] = useState('vitals');
    const [vitalsHistory, setVitalsHistory] = useState([]);
    const [latestVital, setLatestVital] = useState(null);
    const [isStable, setIsStable] = useState(null);
    const [showVitalsForm, setShowVitalsForm] = useState(false);

    // Medication State
    const [medicationUsage, setMedicationUsage] = useState([]);
    const [medicationCatalog, setMedicationCatalog] = useState([]);
    const [showMedForm, setShowMedForm] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null);
    const [medFormData, setMedFormData] = useState({
        catalogId: '',
        batchNumber: '',
        quantity: 1
    });

    // Form state for new vitals
    const [formData, setFormData] = useState({
        heartRate: '',
        systolicBp: '',
        diastolicBp: '',
        meanBp: '',
        respiratoryRate: '',
        temperature: '',
        oxygenSaturation: '',
        etco2: '',
        painScale: 0,
        consciousness: 'Alert',
        sedationScore: '0',
        isStable: true,
        additionalNotes: ''
    });

    const loadAdmission = useCallback(async () => {
        const res = await fetchActiveAdmission(operationId);
        if (res.success) {
            setAdmission(res.data);
        }
    }, [operationId, fetchActiveAdmission]);

    const loadVitalsHistory = useCallback(async () => {
        const data = await fetchAllVitals(operationId);
        if (data) setVitalsHistory(data);
    }, [operationId, fetchAllVitals]);

    const loadLatestVital = useCallback(async () => {
        const data = await fetchLatestVital(operationId);
        if (data) setLatestVital(data);
    }, [operationId, fetchLatestVital]);

    const loadStability = useCallback(async () => {
        const data = await checkPatientStability(operationId);
        setIsStable(data);
    }, [operationId, checkPatientStability]);

    const loadMedicationUsage = useCallback(async () => {
        const data = await fetchMedicationUsageByOperation(operationId);
        if (data) setMedicationUsage(data);
    }, [operationId, fetchMedicationUsageByOperation]);

    const loadMedicationCatalog = useCallback(async () => {
        const res = await fetchCatalogByType('MEDICATION');
        if (res.success) setMedicationCatalog(res.data);
    }, [fetchCatalogByType]);

    useEffect(() => {
        loadAdmission();
        loadVitalsHistory();
        loadLatestVital();
        loadStability();
        loadMedicationUsage();
        loadMedicationCatalog();
    }, [loadAdmission, loadVitalsHistory, loadLatestVital, loadStability, loadMedicationUsage, loadMedicationCatalog]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        }));
    };

    const handleMedInputChange = (e) => {
        const { name, value } = e.target;
        setMedFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'catalogId' ? parseInt(value) : value
        }));
    };

    const handleSubmitVitals = async (e) => {
        e.preventDefault();
        if (!admission) return;

        const res = await recordVitals(
            operationId, 
            admission.wardRoomId || 0,
            admission.wardBedId || 0, 
            formData
        );

        if (res) {
            setShowVitalsForm(false);
            loadVitalsHistory();
            loadLatestVital();
            loadStability();
            // Reset form
            setFormData({
                heartRate: '', systolicBp: '', diastolicBp: '', meanBp: '',
                respiratoryRate: '', temperature: '', oxygenSaturation: '', etco2: '',
                painScale: 0, consciousness: 'Alert', sedationScore: '0',
                isStable: true, additionalNotes: ''
            });
        }
    };

    const handleMedSubmit = async (e) => {
        e.preventDefault();
        if (!admission) return;

        const payload = {
            ...medFormData,
            operationId: parseInt(operationId),
            wardRoomId: admission.wardRoomId || 0,
            wardBedId: admission.wardBedId || 0
        };

        const res = await recordMedication(payload);
        if (res) {
            setShowMedForm(false);
            loadMedicationUsage();
            setMedFormData({ catalogId: '', batchNumber: '', quantity: 1 });
        }
    };

    const handleDeleteMed = async (id) => {
        if (window.confirm('Delete this medication usage?')) {
            const success = await deleteMedicationUsage(id);
            if (success) loadMedicationUsage();
        }
    };

    const handleUpdateMedQuantity = async (id, currentQty) => {
        const newQty = window.prompt('Enter new quantity:', currentQty);
        if (newQty !== null && !isNaN(newQty)) {
            const res = await updateMedicationQuantity(id, parseInt(newQty));
            if (res) loadMedicationUsage();
        }
    };

    const [medSearchQuery, setMedSearchQuery] = useState('');

    const filteredMedCatalog = medicationCatalog.filter(item => 
        (item.name?.toLowerCase() || "").includes(medSearchQuery.toLowerCase()) || 
        (item.itemCode?.toLowerCase() || "").includes(medSearchQuery.toLowerCase())
    );

    const StatusBadge = ({ stable }) => (
        <span style={{
            padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800",
            backgroundColor: stable === true ? "#ecfdf5" : (stable === false ? "#fef2f2" : "#f1f5f9"),
            color: stable === true ? "#10b981" : (stable === false ? "#ef4444" : "#64748b"),
            display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid" + (stable === true ? "#d1fae5" : (stable === false ? "#fee2e2" : "#e2e8f0"))
        }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }}></span>
            {stable === true ? "Patient Stable" : (stable === false ? "Needs Attention" : "Checking Status...")}
        </span>
    );

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(2, 6, 23, 0.8)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            zIndex: 1600, padding: "2rem", backdropFilter: "blur(12px)"
        }}>
            <div style={{
                backgroundColor: "#ffffff", width: "95%", maxWidth: "1600px", height: "90vh",
                borderRadius: "32px", overflow: "hidden", 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)"
            }}>
                {/* Header */}
                <div style={{ 
                    padding: "1.5rem 2.5rem", 
                    borderBottom: "1px solid #f1f5f9", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: "linear-gradient(to right, #ffffff, #f8fafc)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>Recovery Management</h2>
                            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>Post-Operative Care & Monitoring</div>
                        </div>
                        {admission && (
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingLeft: "1.5rem", borderLeft: "2px solid #e2e8f0" }}>
                                <div style={{ 
                                    width: "48px", height: "48px", borderRadius: "16px", 
                                    backgroundColor: "#f0f9ff", color: "#0ea5e9",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem"
                                }}>
                                    <i className="fa-solid fa-user-injured"></i>
                                </div>
                                <div>
                                    <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1e293b" }}>{admission.patientName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>MRN: {admission.patientMrn} • {admission.roomName} (Bed {admission.bedNumber})</div>
                                </div>
                                <StatusBadge stable={isStable} />
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} style={{ 
                        background: "#f1f5f9", border: "none", cursor: "pointer", 
                        width: "40px", height: "40px", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#64748b", transition: "all 0.2s"
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    {/* Sidebar Nav */}
                    <div style={{ 
                        width: "280px", 
                        backgroundColor: "#f8fafc", 
                        borderRight: "1px solid #f1f5f9",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                    }}>
                        <div style={{ padding: "0 0.75rem 0.5rem", fontSize: "0.7rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Main Sections</div>
                        {[
                            { id: 'overview', icon: 'fa-chart-pie', label: 'Admission Overview' },
                            { id: 'vitals', icon: 'fa-heart-pulse', label: 'Ward/Recovery Vitals' },
                            { id: 'medications', icon: 'fa-pills', label: 'Medications Usage' },
                            { id: 'orders', icon: 'fa-file-invoice', label: 'Post-Op Orders' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.875rem 1rem", borderRadius: "14px", border: "none",
                                    backgroundColor: activeTab === tab.id ? "#ffffff" : "transparent",
                                    color: activeTab === tab.id ? "var(--hospital-blue)" : "#64748b",
                                    fontWeight: activeTab === tab.id ? "800" : "600",
                                    cursor: "pointer", textAlign: "left", fontSize: "0.9rem",
                                    boxShadow: activeTab === tab.id ? "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)" : "none",
                                    transition: "all 0.2s"
                                }}
                            >
                                <i className={`fa-solid ${tab.icon}`} style={{ width: "20px", opacity: activeTab === tab.id ? 1 : 0.7 }}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "2.5rem", backgroundColor: "#ffffff" }}>
                        {activeTab === 'overview' && admission && (
                            <div style={{ maxWidth: "1000px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                                    <div style={{ backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "24px", border: "1px solid #f1f5f9" }}>
                                        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.1rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <i className="fa-solid fa-hospital-user" style={{ color: "var(--hospital-blue)" }}></i>
                                            Admission Details
                                        </h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                            {[
                                                { label: 'Ward', value: admission.roomName },
                                                { label: 'Room Number', value: admission.roomNumber },
                                                { label: 'Bed Assignment', value: `Bed ${admission.bedNumber}`, color: "#10b981" },
                                                { label: 'Admission Date', value: new Date(admission.admissionTime).toLocaleDateString() },
                                                { label: 'Admission Time', value: new Date(admission.admissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                                { label: 'Primary Nurse', value: admission.admittedBy }
                                            ].map((item, idx) => (
                                                <div key={idx}>
                                                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>{item.label}</div>
                                                    <div style={{ fontWeight: "800", color: item.color || "#1e293b", fontSize: "1rem", marginTop: "4px" }}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                        <div style={{ backgroundColor: "#eff6ff", padding: "1.5rem", borderRadius: "20px", border: "1px solid #dbeafe" }}>
                                            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                                    <i className="fa-solid fa-clipboard-check"></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "800", color: "#1e40af" }}>Clinical Status</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#3b82f6", marginTop: "2px" }}>Patient is currently under observation in the recovery ward.</div>
                                                </div>
                                            </div>
                                        </div>
                                        {latestVital && (
                                            <div style={{ backgroundColor: "#f0fdf4", padding: "1.5rem", borderRadius: "20px", border: "1px solid #dcfce7" }}>
                                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                                                        <i className="fa-solid fa-heart-pulse"></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: "800", color: "#166534" }}>Latest Vitals (at {new Date(latestVital.recordedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</div>
                                                        <div style={{ fontSize: "0.85rem", color: "#15803d", marginTop: "4px" }}>
                                                            HR: {latestVital.heartRate} bpm • BP: {latestVital.systolicBp}/{latestVital.diastolicBp} • SpO2: {latestVital.oxygenSaturation}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'vitals' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>Patient Vitals Log</h3>
                                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>Record and monitor recovery progress vitals</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowVitalsForm(!showVitalsForm)}
                                        style={{
                                            padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white",
                                            border: "none", borderRadius: "14px", fontWeight: "800", cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 15px -3px rgba(30, 64, 175, 0.2)"
                                        }}
                                    >
                                        <i className={`fa-solid ${showVitalsForm ? 'fa-minus' : 'fa-plus'}`}></i>
                                        {showVitalsForm ? 'Cancel Recording' : 'Record New Vitals'}
                                    </button>
                                </div>

                                {showVitalsForm && (
                                    <form onSubmit={handleSubmitVitals} style={{ 
                                        backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "24px", border: "1px solid #e2e8f0",
                                        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem"
                                    }}>
                                        <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "0.5rem" }}>
                                            <div style={{ fontWeight: "800", color: "#1e293b" }}>Enter New Data Points</div>
                                        </div>
                                        
                                        {[
                                            { name: 'heartRate', label: 'Heart Rate (bpm)', icon: 'fa-heart-pulse' },
                                            { name: 'systolicBp', label: 'Systolic BP', icon: 'fa-gauge-high' },
                                            { name: 'diastolicBp', label: 'Diastolic BP', icon: 'fa-gauge' },
                                            { name: 'respiratoryRate', label: 'Resp. Rate', icon: 'fa-lungs' },
                                            { name: 'temperature', label: 'Temp (°F)', icon: 'fa-temperature-half' },
                                            { name: 'oxygenSaturation', label: 'SpO2 (%)', icon: 'fa-droplet' },
                                            { name: 'etco2', label: 'EtCO2', icon: 'fa-wind' },
                                            { name: 'meanBp', label: 'Mean BP', icon: 'fa-equals' }
                                        ].map(field => (
                                            <div key={field.name}>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>
                                                    {field.label}
                                                </label>
                                                <div style={{ position: "relative" }}>
                                                    <i className={`fa-solid ${field.icon}`} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.8rem" }}></i>
                                                    <input 
                                                        type="number" step="0.1" name={field.name} value={formData[field.name]} onChange={handleInputChange} required
                                                        style={{ 
                                                            width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px", border: "1px solid #cbd5e1",
                                                            fontSize: "0.9rem", fontWeight: "700", color: "#1e293b"
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Consciousness</label>
                                                <select name="consciousness" value={formData.consciousness} onChange={handleInputChange} 
                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                                                    <option>Alert</option>
                                                    <option>Verbal</option>
                                                    <option>Pain</option>
                                                    <option>Unresponsive</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Sedation Score</label>
                                                <input type="text" name="sedationScore" value={formData.sedationScore} onChange={handleInputChange}
                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Pain Scale (0-10)</label>
                                                <input type="number" name="painScale" min="0" max="10" value={formData.painScale} onChange={handleInputChange}
                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Additional Notes</label>
                                            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2"
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "600" }}></textarea>
                                        </div>

                                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                                            <button type="submit" disabled={vitalsLoading} style={{
                                                padding: "0.875rem 2.5rem", backgroundColor: "#1e293b", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer"
                                            }}>
                                                {vitalsLoading ? 'Saving...' : 'Save Vitals Entry'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div style={{ 
                                    border: "1px solid #f1f5f9", borderRadius: "24px", overflow: "hidden", 
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Time</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>HR</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>BP</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>SpO2</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Temp</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Pain</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Nurse</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vitalsHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                                                        No vitals recorded yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                vitalsHistory.map((v, i) => (
                                                    <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700", color: "#1e293b", fontSize: "0.85rem" }}>
                                                            {new Date(v.recordedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(v.recordedTime).toLocaleDateString()}</div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "800", color: v.heartRate > 100 || v.heartRate < 60 ? "#ef4444" : "#1e293b" }}>{v.heartRate}</td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700" }}>{v.systolicBp}/{v.diastolicBp}</td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "800", color: v.oxygenSaturation < 95 ? "#ef4444" : "#10b981" }}>{v.oxygenSaturation}%</td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "600" }}>{v.temperature}°F</td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <span style={{ 
                                                                padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800",
                                                                backgroundColor: v.painScale > 5 ? "#fef2f2" : "#f0f9ff",
                                                                color: v.painScale > 5 ? "#ef4444" : "#2563eb"
                                                            }}>
                                                                {v.painScale}/10
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <span style={{ 
                                                                padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800",
                                                                backgroundColor: v.isStable ? "#ecfdf5" : "#fef2f2",
                                                                color: v.isStable ? "#10b981" : "#ef4444"
                                                            }}>
                                                                {v.isStable ? 'Stable' : 'Critical'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700", color: "#64748b" }}>{v.recordedBy}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'medications' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>Medication Administration</h3>
                                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>Track medicines given during recovery phase</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowMedForm(!showMedForm)}
                                        style={{
                                            padding: "0.75rem 1.5rem", backgroundColor: "#0ea5e9", color: "white",
                                            border: "none", borderRadius: "14px", fontWeight: "800", cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.2)"
                                        }}
                                    >
                                        <i className={`fa-solid ${showMedForm ? 'fa-minus' : 'fa-plus'}`}></i>
                                        {showMedForm ? 'Close Picker' : 'Open Med Picker'}
                                    </button>
                                </div>

                                {showMedForm && (
                                    <div style={{ 
                                        backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "24px", border: "1px solid #e2e8f0",
                                        display: "flex", flexDirection: "column", gap: "1.5rem"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ fontWeight: "800", color: "#0369a1", fontSize: "1rem" }}>Select Medication from Catalog</div>
                                            <div style={{ position: "relative", width: "300px" }}>
                                                <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                                                <input 
                                                    type="text" placeholder="Search catalog..." 
                                                    value={medSearchQuery}
                                                    onChange={(e) => setMedSearchQuery(e.target.value)}
                                                    style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Scrollable Catalog Picker */}
                                        <div style={{ 
                                            maxHeight: "250px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem",
                                            padding: "0.5rem", backgroundColor: "white", borderRadius: "16px", border: "1px solid #f1f5f9"
                                        }}>
                                            {filteredMedCatalog.length > 0 ? filteredMedCatalog.map(item => (
                                                <div 
                                                    key={item.id}
                                                    onClick={() => setMedFormData(prev => ({ ...prev, catalogId: item.id }))}
                                                    style={{ 
                                                        padding: "1rem", borderRadius: "14px", border: "2px solid " + (medFormData.catalogId === item.id ? "#0ea5e9" : "#f1f5f9"),
                                                        backgroundColor: medFormData.catalogId === item.id ? "#f0f9ff" : "white", cursor: "pointer", transition: "all 0.2s"
                                                    }}
                                                >
                                                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.9rem" }}>{item.name}</div>
                                                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>{item?.itemName}</div>
                                                </div>
                                            )) : (
                                                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No medications found matching your search.</div>
                                            )}
                                        </div>

                                        {medFormData.catalogId && (
                                            <form onSubmit={handleMedSubmit} style={{ 
                                                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", padding: "1.5rem", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0f2fe"
                                            }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#0369a1", marginBottom: "6px" }}>Quantity</label>
                                                    <input 
                                                        type="number" name="quantity" min="1" value={medFormData.quantity} onChange={handleMedInputChange} required
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #bae6fd", fontWeight: "700" }} 
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#0369a1", marginBottom: "6px" }}>Batch Number</label>
                                                    <input 
                                                        type="text" name="batchNumber" value={medFormData.batchNumber} onChange={handleMedInputChange} placeholder="e.g. B-901"
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #bae6fd", fontWeight: "700" }} 
                                                    />
                                                </div>
                                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                                    <button type="submit" disabled={medUsageLoading} style={{
                                                        width: "100%", padding: "0.875rem", backgroundColor: "#0369a1", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer"
                                                    }}>
                                                        {medUsageLoading ? 'Recording...' : 'Record Distribution'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}

                                <div style={{ 
                                    border: "1px solid #f1f5f9", borderRadius: "24px", overflow: "hidden", 
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Medicine Name</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Batch</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Qty</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Administered By</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Time</th>
                                                <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicationUsage.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                                                        No medications administered yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                medicationUsage.map((m) => (
                                                    <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <div style={{ fontWeight: "800", color: "#1e293b" }}>{m.name}</div>
                                                            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{m.itemCode} • {m.category}</div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700", color: "#64748b" }}>{m.batchNumber || 'N/A'}</td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                <span style={{ fontWeight: "900", color: "var(--hospital-blue)", fontSize: "1.1rem" }}>{m.quantity}</span>
                                                                <button onClick={() => handleUpdateMedQuantity(m.id, m.quantity)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}>
                                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700", color: "#1e293b" }}>{m.givenBy}</td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <button onClick={() => handleDeleteMed(m.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                                                <i className="fa-solid fa-trash-can"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'orders' && (
                            <div style={{ textAlign: "center", padding: "5rem" }}>
                                <i className="fa-solid fa-file-medical" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
                                <h3 style={{ marginTop: "1.5rem", color: "#64748b" }}>Clinical orders module coming soon</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecoveryDetailsModal;

