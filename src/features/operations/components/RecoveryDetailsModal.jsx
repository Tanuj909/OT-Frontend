import React, { useEffect, useState, useCallback } from 'react';
import { useWardAdmission } from '../../admin/hooks/useWardAdmission';
import { useWardVitals } from '../hooks/useWardVitals';
import { useMedicationUsage } from '../hooks/useMedicationUsage';
import { useCatalog } from '../../catalog/hooks/useCatalog';
import { useWardTasks } from '../hooks/useWardTasks';
import { useDoctorVisits } from '../hooks/useDoctorVisits';
import { useStaff } from '../../staff/hooks/useStaff';
import { useAuth } from '../../auth/useAuth';
import { useOperations } from '../hooks/useOperations';
import { ROLES } from '../../../shared/constants/roles';
import { toast } from 'react-hot-toast';

const RecoveryDetailsModal = ({ operationId, onClose }) => {
    const { fetchActiveAdmission, dischargePatient, loading: admissionLoading } = useWardAdmission();
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
    const { 
        createTask, 
        completeTask, 
        cancelTask, 
        fetchTasksByAdmission,
        fetchTasksByOperationStatus,
        loading: tasksLoading 
    } = useWardTasks();
    const {
        createVisit,
        fetchVisitsByAdmission,
        cancelVisit,
        completeVisit,
        fetchLatestVisit,
        fetchVisitsByStatus,
        loading: visitLoading
    } = useDoctorVisits();
    const { staffList, fetchAllStaff } = useStaff();
    const { user } = useAuth();
    const isDoctor = user?.role === ROLES.DOCTOR || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.SURGEON;
    const { readyForIpdTransfer, fetchOperationStatus, loading: transferLoading } = useOperations();
    const [operationStatus, setOperationStatus] = useState(null);

    const [admission, setAdmission] = useState(null);
    const [activeTab, setActiveTab] = useState('vitals');
    const [vitalsHistory, setVitalsHistory] = useState([]);
    const [latestVital, setLatestVital] = useState(null);
    const [isStable, setIsStable] = useState(null);
    const [showVitalsForm, setShowVitalsForm] = useState(false);
    const [showDischargeConfirm, setShowDischargeConfirm] = useState(false);
    const [dischargeLoading, setDischargeLoading] = useState(false);
    const [isTransferRequested, setIsTransferRequested] = useState(false);
    const [showRoomDetails, setShowRoomDetails] = useState(false);

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

    // Task State
    const [tasks, setTasks] = useState([]);
    const [taskSubTab, setTaskSubTab] = useState('assigned'); // 'assign' or 'assigned'
    const [taskFormData, setTaskFormData] = useState({
        taskType: 'MEDICATION',
        taskDescription: '',
        taskNotes: '',
        scheduledTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        isRecurring: false,
        intervalHours: '',
        recurringEndTime: ''
    });
    const [showCompleteForm, setShowCompleteForm] = useState(null); // taskId
    const [completeTaskFormData, setCompleteTaskFormData] = useState({
        completionNotes: '',
        readingValue: '',
        readingUnit: ''
    });
    const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');

    // Doctor Visit State
    const [visits, setVisits] = useState([]);
    const [latestVisitDetail, setLatestVisitDetail] = useState(null);
    const [visitSubTab, setVisitSubTab] = useState('list'); // 'log', 'latest', 'scheduled', 'list'
    const [visitStatusFilter, setVisitStatusFilter] = useState('ALL');
    const [visitFormData, setVisitFormData] = useState({
        doctorId: '',
        doctorName: '',
        doctorSpecialization: '',
        visitTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        clinicalObservations: '',
        diagnosis: '',
        treatmentPlan: '',
        hasMedicationChange: false,
        medicationsAdded: '',
        medicationsDiscontinued: '',
        medicationNotes: '',
        nextVisitScheduled: '',
        nextVisitInstructions: '',
        dischargeRecommended: false,
        dischargeNotes: '',
        expectedDischargeDate: '',
        status: 'COMPLETED'
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

    const loadOperationStatus = useCallback(async () => {
        const res = await fetchOperationStatus(operationId);
        if (res.success) {
            setOperationStatus(res.data);
            // If there's any active transfer status, mark as requested to disable the button
            const activeStatuses = ['READY_FOR_IPD_TRANSFER', 'PENDING', 'ACCEPTED_BY_IPD', 'IN_TRANSIT'];
            if (activeStatuses.includes(res.data.transferStatus)) {
                setIsTransferRequested(true);
            }
        }
    }, [operationId, fetchOperationStatus]);

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

    const loadVisits = useCallback(async () => {
        if (!admission?.id) return;
        
        if (visitSubTab === 'latest') {
            const data = await fetchLatestVisit(operationId);
            setLatestVisitDetail(data);
        } else if (visitSubTab === 'scheduled') {
            const data = await fetchVisitsByStatus(operationId, 'SCHEDULED');
            setVisits(data);
        } else if (visitSubTab === 'list') {
            let data;
            if (visitStatusFilter === 'ALL') {
                data = await fetchVisitsByAdmission(admission.id);
            } else {
                data = await fetchVisitsByStatus(operationId, visitStatusFilter);
            }
            if (data) setVisits(data);
        }
    }, [admission?.id, operationId, visitSubTab, visitStatusFilter, fetchVisitsByAdmission, fetchLatestVisit, fetchVisitsByStatus]);

    const loadTasks = useCallback(async () => {
        if (!admission?.id) return;
        
        let data;
        if (taskStatusFilter === 'ALL') {
            data = await fetchTasksByAdmission(admission.id);
        } else {
            data = await fetchTasksByOperationStatus(operationId, taskStatusFilter);
        }
        
        if (data) {
            setTasks(data.data || data);
        }
    }, [admission?.id, operationId, taskStatusFilter, fetchTasksByAdmission, fetchTasksByOperationStatus]);

    useEffect(() => {
        loadAdmission();
        loadOperationStatus();
        loadVitalsHistory();
        loadLatestVital();
        loadStability();
        loadMedicationUsage();
        loadMedicationCatalog();
        fetchAllStaff();
    }, [loadAdmission, loadOperationStatus, loadVitalsHistory, loadLatestVital, loadStability, loadMedicationUsage, loadMedicationCatalog, fetchAllStaff]);

    useEffect(() => {
        if (admission) {
            loadTasks();
            loadVisits();
        }
    }, [admission, loadTasks, loadVisits, visitSubTab, visitStatusFilter]);

    useEffect(() => {
        // Auto-select doctor if current user is a doctor/surgeon
        if ((user?.role === ROLES.DOCTOR || user?.role === ROLES.SURGEON) && staffList.length > 0) {
            // Find current user in staff list if possible, or use user info directly
            const currentStaff = staffList.find(s => s.email === user.email || s.userName === user.userName);
            if (currentStaff) {
                setVisitFormData(prev => ({
                    ...prev,
                    doctorId: currentStaff.id,
                    doctorName: `${currentStaff.name} ${currentStaff.lastName}`,
                    doctorSpecialization: currentStaff.specialization || 'Attending Physician'
                }));
            }
        }
    }, [user, staffList, setVisitFormData]);

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
    const handleTaskInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaskFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCompleteInputChange = (e) => {
        const { name, value } = e.target;
        setCompleteTaskFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVisitInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVisitFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDoctorSelect = (doc) => {
        setVisitFormData(prev => ({
            ...prev,
            doctorId: doc.id,
            doctorName: `${doc.firstName} ${doc.lastName}`,
            doctorSpecialization: doc.specialization || 'Clinical Specialist'
        }));
    };

    const handleVisitSubmit = async (e) => {
        e.preventDefault();
        if (!admission) return;

        const payload = {
            ...visitFormData,
            operationId: parseInt(operationId),
            wardAdmissionId: admission.id
        };

        const res = await createVisit(payload);
        if (res) {
            setVisitSubTab('list');
            loadVisits();
            // Reset form
            setVisitFormData({
                doctorId: '', doctorName: '', doctorSpecialization: '',
                visitTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                clinicalObservations: '', diagnosis: '', treatmentPlan: '',
                hasMedicationChange: false, medicationsAdded: '', medicationsDiscontinued: '', medicationNotes: '',
                nextVisitScheduled: '', nextVisitInstructions: '',
                dischargeRecommended: false, dischargeNotes: '', expectedDischargeDate: '',
                status: 'COMPLETED'
            });
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!admission) return;

        const payload = {
            ...taskFormData,
            operationId: parseInt(operationId),
            wardAdmissionId: admission.id,
            intervalHours: taskFormData.isRecurring ? parseInt(taskFormData.intervalHours) : null,
            recurringEndTime: taskFormData.isRecurring ? taskFormData.recurringEndTime : null
        };

        const res = await createTask(payload);
        if (res) {
            setTaskSubTab('assigned');
            loadTasks();
            setTaskFormData({
                taskType: 'MEDICATION',
                taskDescription: '',
                taskNotes: '',
                scheduledTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                isRecurring: false,
                intervalHours: '',
                recurringEndTime: ''
            });
        }
    };

    const handleCompleteTask = async (taskId) => {
        const res = await completeTask(taskId, completeTaskFormData);
        if (res) {
            setShowCompleteForm(null);
            loadTasks();
            setCompleteTaskFormData({ completionNotes: '', readingValue: '', readingUnit: '' });
        }
    };

    const handleCancelTask = async (taskId) => {
        if (window.confirm('Are you sure you want to cancel this task?')) {
            const res = await cancelTask(taskId);
            if (res) loadTasks();
        }
    };

    const handleCompleteVisit = async (visitId) => {
        if (window.confirm('Mark this doctor visit as completed?')) {
            const res = await completeVisit(visitId);
            if (res) loadVisits();
        }
    };

    const handleCancelVisit = async (visitId) => {
        if (window.confirm('Are you sure you want to cancel this scheduled visit?')) {
            const res = await cancelVisit(visitId);
            if (res) loadVisits();
        }
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

    const handleDischargePatient = async () => {
        setDischargeLoading(true);
        try {
            const res = await dischargePatient(operationId);
            if (res.success) {
                toast.success('Patient discharged successfully!');
                setShowDischargeConfirm(false);
                onClose();
            } else {
                toast.error(res.message || 'Failed to discharge patient.');
            }
        } catch (err) {
            toast.error('An error occurred while discharging the patient.');
        } finally {
            setDischargeLoading(false);
        }
    };

    const handleTransferToIpd = async () => {
        const res = await readyForIpdTransfer(operationId);
        if (res.success) {
            toast.success(res.message || 'Patient marked as ready for IPD transfer!');
            setIsTransferRequested(true);
            loadOperationStatus();
        } else {
            toast.error(res.message || 'Failed to request IPD transfer.');
        }
    };

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
                                <div style={{ position: "relative" }}>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#1e293b", letterSpacing: "-0.01em" }}>{admission.patientName}</div>
                                    <button 
                                        onClick={() => setShowRoomDetails(!showRoomDetails)}
                                        style={{ 
                                            background: "none", border: "none", padding: 0, 
                                            fontSize: "0.75rem", color: "#0ea5e9", fontWeight: "800", 
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                                            marginTop: "2px"
                                        }}
                                    >
                                        Show Room Details <i className={`fa-solid fa-chevron-${showRoomDetails ? 'up' : 'down'}`} style={{ fontSize: "0.6rem" }}></i>
                                    </button>
                                    
                                    {showRoomDetails && (
                                        <div style={{ 
                                            position: "absolute", top: "calc(100% + 10px)", left: "0", 
                                            backgroundColor: "#ffffff", padding: "1rem", borderRadius: "16px",
                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                            border: "1px solid #f1f5f9", zIndex: 100, minWidth: "240px",
                                            display: "flex", flexDirection: "column", gap: "0.75rem"
                                        }}>
                                            <div>
                                                <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Patient MRN</div>
                                                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{admission.patientMrn}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <div>
                                                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Room / Bed</div>
                                                    <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{admission.roomName} (Bed {admission.bedNumber})</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <StatusBadge stable={isStable} />
                                <span style={{
                                    padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800",
                                    backgroundColor: admission.dischargedWhen ? "#e2e8f0" : "#dbeafe",
                                    color: admission.dischargedWhen ? "#475569" : "#1e40af",
                                    display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid " + (admission.dischargedWhen ? "#cbd5e1" : "#bfdbfe")
                                }}>
                                    <i className={`fa-solid ${admission.dischargedWhen ? 'fa-user-check' : 'fa-bed-pulse'}`}></i>
                                    {admission.dischargedWhen ? "Discharged" : "Admitted"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {operationStatus && operationStatus.transferStatus && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <span style={{
                                    padding: "6px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800",
                                    backgroundColor: operationStatus.transferStatus === 'ACCEPTED_BY_IPD' ? "#ecfdf5" : "#eff6ff",
                                    color: operationStatus.transferStatus === 'ACCEPTED_BY_IPD' ? "#10b981" : "#3b82f6",
                                    border: "1px solid " + (operationStatus.transferStatus === 'ACCEPTED_BY_IPD' ? "#d1fae5" : "#dbeafe"),
                                    display: "flex", alignItems: "center", gap: "4px"
                                }}>
                                    <i className="fa-solid fa-circle-info"></i>
                                    {operationStatus.transferStatus.replace(/_/g, ' ')}
                                </span>
                                {operationStatus.transferredTo && (
                                    <span style={{
                                        padding: "6px 12px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "800",
                                        backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0",
                                        display: "flex", alignItems: "center", gap: "4px"
                                    }}>
                                        <i className="fa-solid fa-location-dot"></i>
                                        {operationStatus.transferredTo}
                                    </span>
                                )}
                            </div>
                        )}
                        {admission && admission.dischargedWhen && (
                            <button 
                                onClick={handleTransferToIpd}
                                disabled={transferLoading || isTransferRequested}
                                style={{ 
                                    padding: "0.625rem 1.25rem", 
                                    background: (transferLoading || isTransferRequested) ? (operationStatus?.transferStatus === 'ACCEPTED_BY_IPD' ? "linear-gradient(135deg, #10b981, #059669)" : "#94a3b8") : "linear-gradient(135deg, #0ea5e9, #0284c7)", 
                                    border: "none", 
                                    cursor: (transferLoading || isTransferRequested) ? "not-allowed" : "pointer", 
                                    borderRadius: "12px",
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                    color: "#ffffff", fontWeight: "800", fontSize: "0.85rem",
                                    boxShadow: (transferLoading || isTransferRequested) ? "none" : "0 4px 12px rgba(14, 165, 233, 0.3)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <i className={`fa-solid ${operationStatus?.transferStatus === 'ACCEPTED_BY_IPD' ? 'fa-check-circle' : 'fa-hospital-user'}`}></i>
                                {transferLoading ? 'Requesting...' : 
                                 (operationStatus?.transferStatus === 'ACCEPTED_BY_IPD' ? 'Transferred Accepted' : 
                                  (isTransferRequested ? 'Transfer Requested' : 'Transfer back to IPD'))}
                            </button>
                        )}
                        {admission && !admission.dischargedWhen && (
                            <button 
                                onClick={() => setShowDischargeConfirm(true)}
                                style={{ 
                                    padding: "0.625rem 1.25rem", 
                                    background: "linear-gradient(135deg, #ef4444, #dc2626)", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    borderRadius: "12px",
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                    color: "#ffffff", fontWeight: "800", fontSize: "0.85rem",
                                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                Discharge Patient
                            </button>
                        )}
                        {admission && !admission.dischargedWhen && (
                            <button 
                                onClick={() => {
                                    setActiveTab('tasks');
                                    setTaskSubTab('assigned');
                                }}
                                style={{ 
                                    padding: "0.625rem 1.25rem", 
                                    background: "linear-gradient(135deg, #6366f1, #4f46e5)", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    borderRadius: "12px",
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                    color: "#ffffff", fontWeight: "800", fontSize: "0.85rem",
                                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                                    transition: "all 0.2s",
                                    position: "relative"
                                }}
                            >
                                <i className="fa-solid fa-list-check"></i>
                                Tasks
                                {Array.isArray(tasks) && tasks.filter(t => t.status === 'PENDING').length > 0 && (
                                    <span style={{
                                        position: "absolute", top: "-8px", right: "-8px",
                                        backgroundColor: "#ef4444", color: "white",
                                        minWidth: "20px", height: "20px", borderRadius: "10px",
                                        fontSize: "0.7rem", display: "flex", alignItems: "center",
                                        justifyContent: "center", border: "2px solid white", padding: "0 4px"
                                    }}>
                                        {tasks.filter(t => t.status === 'PENDING').length}
                                    </span>
                                )}
                            </button>
                        )}
                        <button onClick={onClose} style={{ 
                            background: "#f1f5f9", border: "none", cursor: "pointer", 
                            width: "40px", height: "40px", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#64748b", transition: "all 0.2s"
                        }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
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
                            { id: 'tasks', icon: 'fa-list-check', label: 'Ward Tasks' },
                            { id: 'visits', icon: 'fa-user-doctor', label: 'Doctor Visits' },
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
                                            {operationStatus && (
                                                <>
                                                    <div>
                                                        <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Transfer Status</div>
                                                        <div style={{ 
                                                            fontWeight: "800", 
                                                            color: operationStatus.transferStatus === 'ACCEPTED_BY_IPD' ? "#10b981" : "#0ea5e9", 
                                                            fontSize: "1rem", marginTop: "4px",
                                                            display: "flex", alignItems: "center", gap: "6px"
                                                        }}>
                                                            {operationStatus.transferStatus?.replace(/_/g, ' ')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Transferred To</div>
                                                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "1rem", marginTop: "4px" }}>
                                                            {operationStatus.transferredTo || 'N/A'}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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
                                    {!admission?.dischargedWhen && (
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
                                    )}
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
                                    {!admission?.dischargedWhen && (
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
                                    )}
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
                                                                {!admission?.dischargedWhen && (
                                                                    <button onClick={() => handleUpdateMedQuantity(m.id, m.quantity)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.8rem" }}>
                                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem", fontWeight: "700", color: "#1e293b" }}>{m.givenBy}</td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td style={{ padding: "1.25rem" }}>
                                                            {!admission?.dischargedWhen && (
                                                                <button onClick={() => handleDeleteMed(m.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
                                                                    <i className="fa-solid fa-trash-can"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'tasks' && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>Ward Task Management</h3>
                                        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>Manage and track patient care tasks</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        {taskSubTab === 'assigned' && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f8fafc", padding: "0.4rem 0.8rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                                <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Filter:</span>
                                                <select 
                                                    value={taskStatusFilter}
                                                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                                                    style={{ 
                                                        padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", 
                                                        fontSize: "0.8rem", fontWeight: "700", color: "#1e293b", cursor: "pointer",
                                                        outline: "none", backgroundColor: "white"
                                                    }}
                                                >
                                                    <option value="ALL">All Status</option>
                                                    <option value="PENDING">Pending</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
                                            {isDoctor && (
                                                <button 
                                                    onClick={() => setTaskSubTab('assign')}
                                                    style={{
                                                        padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                        backgroundColor: taskSubTab === 'assign' ? "white" : "transparent",
                                                        color: taskSubTab === 'assign' ? "#4f46e5" : "#64748b",
                                                        cursor: "pointer", boxShadow: taskSubTab === 'assign' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                    }}
                                                > Assign New Task </button>
                                            )}
                                            <button 
                                                onClick={() => setTaskSubTab('assigned')}
                                                style={{
                                                    padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                    backgroundColor: taskSubTab === 'assigned' ? "white" : "transparent",
                                                    color: taskSubTab === 'assigned' ? "#4f46e5" : "#64748b",
                                                    cursor: "pointer", boxShadow: taskSubTab === 'assigned' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                }}
                                            > Assigned Tasks </button>
                                        </div>
                                    </div>
                                </div>

                                {taskSubTab === 'assign' && isDoctor && (
                                    <form onSubmit={handleTaskSubmit} style={{ 
                                        backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "24px", border: "1px solid #e2e8f0",
                                        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem"
                                    }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Task Type</label>
                                            <select name="taskType" value={taskFormData.taskType} onChange={handleTaskInputChange} required
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                                                {["MEDICATION", "INJECTION", "VITALS_CHECK", "DRESSING", "LAB_TEST", "DIET", "OTHER"].map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Scheduled Time</label>
                                            <input 
                                                type="datetime-local" 
                                                name="scheduledTime" 
                                                value={taskFormData.scheduledTime} 
                                                onChange={handleTaskInputChange} 
                                                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                                required
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} 
                                            />
                                        </div>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Task Description</label>
                                            <input type="text" name="taskDescription" value={taskFormData.taskDescription} onChange={handleTaskInputChange} required placeholder="e.g. Injection Ceftriaxone 1g dena hai"
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                                        </div>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Instructions / Notes</label>
                                            <textarea name="taskNotes" value={taskFormData.taskNotes} onChange={handleTaskInputChange} rows="2" placeholder="e.g. IV route se dena hai"
                                                style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "600" }}></textarea>
                                        </div>
                                        
                                        <div style={{ gridColumn: "1 / -1", backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                                <input type="checkbox" name="isRecurring" checked={taskFormData.isRecurring} onChange={handleTaskInputChange} id="isRecurring" 
                                                    style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }} />
                                                <label htmlFor="isRecurring" style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.9rem", cursor: "pointer" }}>Is Recurring Task?</label>
                                            </div>
                                            
                                            {taskFormData.isRecurring && (
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Repeat Interval (Hours)</label>
                                                        <input type="number" name="intervalHours" value={taskFormData.intervalHours} onChange={handleTaskInputChange} placeholder="e.g. 4" required
                                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>End Recurring At</label>
                                                        <input 
                                                            type="datetime-local" 
                                                            name="recurringEndTime" 
                                                            value={taskFormData.recurringEndTime} 
                                                            onChange={handleTaskInputChange} 
                                                            min={taskFormData.scheduledTime || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                                            required
                                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} 
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                                            <button type="submit" disabled={tasksLoading} style={{
                                                padding: "0.875rem 2.5rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer"
                                            }}>
                                                {tasksLoading ? 'Assigning...' : 'Assign Task'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {taskSubTab === 'assigned' && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ 
                                            border: "1px solid #f1f5f9", borderRadius: "24px", overflow: "hidden", 
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                        }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Scheduled</th>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Task / Type</th>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Notes</th>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Assigned By</th>
                                                        <th style={{ padding: "1.25rem", fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tasks.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: "600" }}>
                                                                No tasks assigned yet.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        tasks.map((task) => (
                                                            <React.Fragment key={task.id}>
                                                                <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: task.status === 'COMPLETED' ? "#f8fafc" : "white" }}>
                                                                    <td style={{ padding: "1.25rem" }}>
                                                                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.85rem" }}>
                                                                            {new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{new Date(task.scheduledTime).toLocaleDateString()}</div>
                                                                        {task.isRecurring && (
                                                                            <span style={{ fontSize: "0.65rem", padding: "2px 6px", backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: "4px", fontWeight: "800", display: "inline-block", marginTop: "4px" }}>
                                                                                <i className="fa-solid fa-arrows-rotate" style={{ marginRight: "4px" }}></i>
                                                                                Every {task.intervalHours}h
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: "1.25rem" }}>
                                                                        <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.95rem" }}>{task.taskDescription}</div>
                                                                        <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: "700", marginTop: "2px" }}>{task.taskType}</div>
                                                                    </td>
                                                                    <td style={{ padding: "1.25rem", maxWidth: "300px" }}>
                                                                        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500", lineHeight: "1.4" }}>{task.taskNotes || '-'}</div>
                                                                    </td>
                                                                    <td style={{ padding: "1.25rem" }}>
                                                                        <span style={{ 
                                                                            padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800",
                                                                            backgroundColor: 
                                                                                task.status === 'COMPLETED' ? "#ecfdf5" : 
                                                                                task.status === 'CANCELLED' ? "#fef2f2" : "#fff7ed",
                                                                            color: 
                                                                                task.status === 'COMPLETED' ? "#10b981" : 
                                                                                task.status === 'CANCELLED' ? "#ef4444" : "#f97316",
                                                                            border: "1px solid " + (
                                                                                task.status === 'COMPLETED' ? "#d1fae5" : 
                                                                                task.status === 'CANCELLED' ? "#fee2e2" : "#ffedd5"
                                                                            )
                                                                        }}>
                                                                            {task.status}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: "1.25rem" }}>
                                                                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.85rem" }}>{task.assignedByName}</div>
                                                                        <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{new Date(task.assignedAt).toLocaleDateString()}</div>
                                                                    </td>
                                                                    <td style={{ padding: "1.25rem" }}>
                                                                        {task.status === 'PENDING' && (
                                                                            <div style={{ display: "flex", gap: "10px" }}>
                                                                                <button 
                                                                                    onClick={() => setShowCompleteForm(showCompleteForm === task.id ? null : task.id)}
                                                                                    style={{ background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}
                                                                                > Complete </button>
                                                                                <button 
                                                                                    onClick={() => handleCancelTask(task.id)}
                                                                                    style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "8px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer" }}
                                                                                > Cancel </button>
                                                                            </div>
                                                                        )}
                                                                        {task.status === 'COMPLETED' && (
                                                                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                                                <strong>Done by:</strong> {task.completedByName}
                                                                                <div style={{ fontSize: "0.65rem" }}>At: {new Date(task.completedAt).toLocaleTimeString()}</div>
                                                                                {task.readingValue && <div style={{ color: "#10b981", fontWeight: "800", marginTop: "4px" }}>Reading: {task.readingValue} {task.readingUnit}</div>}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {showCompleteForm === task.id && (
                                                                    <tr style={{ backgroundColor: "#f0fdf4" }}>
                                                                        <td colSpan="6" style={{ padding: "1.5rem" }}>
                                                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
                                                                                <div style={{ fontWeight: "900", color: "#166534" }}>Complete Task Details</div>
                                                                                <div style={{ display: "grid", gridTemplateColumns: task.taskType === 'VITALS_CHECK' ? "1.5fr 1fr 1fr" : "1fr", gap: "1rem" }}>
                                                                                    <div>
                                                                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>Completion Notes</label>
                                                                                        <input type="text" name="completionNotes" value={completeTaskFormData.completionNotes} onChange={handleCompleteInputChange} placeholder="e.g. Patient is comfortable"
                                                                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #bbf7d0", fontWeight: "600" }} />
                                                                                    </div>
                                                                                    {task.taskType === 'VITALS_CHECK' && (
                                                                                        <>
                                                                                            <div>
                                                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>Reading Value</label>
                                                                                                <input type="text" name="readingValue" value={completeTaskFormData.readingValue} onChange={handleCompleteInputChange} placeholder="e.g. 120/80"
                                                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #bbf7d0", fontWeight: "700" }} />
                                                                                            </div>
                                                                                            <div>
                                                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>Unit</label>
                                                                                                <input type="text" name="readingUnit" value={completeTaskFormData.readingUnit} onChange={handleCompleteInputChange} placeholder="e.g. mmHg"
                                                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid #bbf7d0", fontWeight: "700" }} />
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                                                                    <button onClick={() => setShowCompleteForm(null)} style={{ padding: "0.6rem 1.25rem", border: "none", background: "none", color: "#64748b", fontWeight: "700", cursor: "pointer" }}>Dismiss</button>
                                                                                    <button onClick={() => handleCompleteTask(task.id)} style={{ padding: "0.6rem 1.5rem", border: "none", background: "#166534", color: "white", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>Submit Completion</button>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                                {activeTab === 'visits' && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>Physician Visits</h3>
                                                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>Log and review doctor rounds and clinical notes</p>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
                                                <button 
                                                    onClick={() => setVisitSubTab('log')}
                                                    style={{
                                                        padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                        backgroundColor: visitSubTab === 'log' ? "white" : "transparent",
                                                        color: visitSubTab === 'log' ? "#4f46e5" : "#64748b",
                                                        cursor: "pointer", boxShadow: visitSubTab === 'log' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                    }}
                                                > Record Visit </button>
                                                <button 
                                                    onClick={() => setVisitSubTab('latest')}
                                                    style={{
                                                        padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                        backgroundColor: visitSubTab === 'latest' ? "white" : "transparent",
                                                        color: visitSubTab === 'latest' ? "#4f46e5" : "#64748b",
                                                        cursor: "pointer", boxShadow: visitSubTab === 'latest' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                    }}
                                                > Latest Visit </button>
                                                <button 
                                                    onClick={() => setVisitSubTab('scheduled')}
                                                    style={{
                                                        padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                        backgroundColor: visitSubTab === 'scheduled' ? "white" : "transparent",
                                                        color: visitSubTab === 'scheduled' ? "#4f46e5" : "#64748b",
                                                        cursor: "pointer", boxShadow: visitSubTab === 'scheduled' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                    }}
                                                > Upcoming Rounds </button>
                                                <button 
                                                    onClick={() => setVisitSubTab('list')}
                                                    style={{
                                                        padding: "0.5rem 1rem", borderRadius: "10px", border: "none", fontSize: "0.85rem", fontWeight: "700",
                                                        backgroundColor: visitSubTab === 'list' ? "white" : "transparent",
                                                        color: visitSubTab === 'list' ? "#4f46e5" : "#64748b",
                                                        cursor: "pointer", boxShadow: visitSubTab === 'list' ? "0 2px 4px rgba(0,0,0,0.05)" : "none"
                                                    }}
                                                > Visit History </button>
                                            </div>
                                        </div>

                                        {visitSubTab === 'log' && (
                                            <form onSubmit={handleVisitSubmit} style={{ 
                                                backgroundColor: "#f8fafc", padding: "2.5rem", borderRadius: "24px", border: "1px solid #e2e8f0",
                                                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem"
                                            }}>
                                                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
                                                    <div style={{ fontWeight: "900", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <i className="fa-solid fa-stethoscope" style={{ color: "#4f46e5" }}></i>
                                                        Visit Entry Form
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Physician In-Charge</label>
                                                    { (user?.role === ROLES.DOCTOR || user?.role === ROLES.SURGEON) ? (
                                                        <div style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", fontWeight: "800", color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span>{visitFormData.doctorName || user.userName}</span>
                                                            <span style={{ fontSize: "0.65rem", backgroundColor: "#4f46e5", color: "white", padding: "2px 8px", borderRadius: "6px", textTransform: "uppercase" }}>{visitFormData.doctorSpecialization || user.role}</span>
                                                        </div>
                                                    ) : (
                                                        <select 
                                                            required
                                                            value={visitFormData.doctorId}
                                                            onChange={(e) => {
                                                                const doc = staffList.find(s => s.id === parseInt(e.target.value));
                                                                if (doc) handleDoctorSelect(doc);
                                                            }}
                                                            style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }}
                                                        >
                                                            <option value="">-- Choose Physician --</option>
                                                            {staffList.filter(s => [ROLES.DOCTOR, ROLES.SURGEON].includes(s.role) || s.role === 'DOCTOR').map(doc => (
                                                                <option key={doc.id} value={doc.id}>{doc.name || `${doc.firstName} ${doc.lastName}`} ({doc.specialization || doc.role})</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Visit Time</label>
                                                    <input type="datetime-local" name="visitTime" value={visitFormData.visitTime} onChange={handleVisitInputChange} required
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                                                </div>

                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Entry Status</label>
                                                    <select name="status" value={visitFormData.status} onChange={handleVisitInputChange} 
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                                                        <option value="COMPLETED">Completed (Current Visit)</option>
                                                        <option value="SCHEDULED">Scheduled (Future Round)</option>
                                                    </select>
                                                </div>

                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Clinical Observations</label>
                                                    <textarea name="clinicalObservations" value={visitFormData.clinicalObservations} onChange={handleVisitInputChange} rows="3" placeholder="Describe patient's current state..."
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "600" }}></textarea>
                                                </div>

                                                <div style={{ gridColumn: "1 / 2" }}>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Diagnosis / Assessment</label>
                                                    <input type="text" name="diagnosis" value={visitFormData.diagnosis} onChange={handleVisitInputChange} placeholder="Current assessment"
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "600" }} />
                                                </div>

                                                <div style={{ gridColumn: "2 / -1" }}>
                                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#64748b", marginBottom: "6px" }}>Treatment Plan</label>
                                                    <input type="text" name="treatmentPlan" value={visitFormData.treatmentPlan} onChange={handleVisitInputChange} placeholder="Next steps..."
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontWeight: "600" }} />
                                                </div>

                                                <div style={{ gridColumn: "1 / -1", backgroundColor: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                                        <input type="checkbox" name="hasMedicationChange" checked={visitFormData.hasMedicationChange} onChange={handleVisitInputChange} id="hasMedChange" 
                                                            style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }} />
                                                        <label htmlFor="hasMedChange" style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.9rem", cursor: "pointer" }}>Medication Changes?</label>
                                                    </div>
                                                    {visitFormData.hasMedicationChange && (
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Added Medications</label>
                                                                <input type="text" name="medicationsAdded" value={visitFormData.medicationsAdded} onChange={handleVisitInputChange}
                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                                                            </div>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>Discontinued Medications</label>
                                                                <input type="text" name="medicationsDiscontinued" value={visitFormData.medicationsDiscontinued} onChange={handleVisitInputChange}
                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ gridColumn: "1 / -1", backgroundColor: "#fff5f5", padding: "1.5rem", borderRadius: "20px", border: "1px solid #fee2e2" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                                        <input type="checkbox" name="dischargeRecommended" checked={visitFormData.dischargeRecommended} onChange={handleVisitInputChange} id="recommDischarge" 
                                                            style={{ width: "18px", height: "18px", accentColor: "#ef4444" }} />
                                                        <label htmlFor="recommDischarge" style={{ fontWeight: "800", color: "#991b1b", fontSize: "0.9rem", cursor: "pointer" }}>Recommend Discharge?</label>
                                                    </div>
                                                    {visitFormData.dischargeRecommended && (
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#991b1b", marginBottom: "6px" }}>Discharge Notes</label>
                                                                <input type="text" name="dischargeNotes" value={visitFormData.dischargeNotes} onChange={handleVisitInputChange}
                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #fca5a5" }} />
                                                            </div>
                                                            <div>
                                                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#991b1b", marginBottom: "6px" }}>Expected Discharge Date</label>
                                                                <input type="datetime-local" name="expectedDischargeDate" value={visitFormData.expectedDischargeDate} onChange={handleVisitInputChange}
                                                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", border: "1px solid #fca5a5" }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                                                    <button type="submit" disabled={visitLoading} style={{
                                                        padding: "1rem 3rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "14px", fontWeight: "900", cursor: "pointer"
                                                    }}>
                                                        {visitLoading ? 'Saving Entry...' : 'Post Physician Round'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {visitSubTab === 'latest' && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                {!latestVisitDetail ? (
                                                    <div style={{ textAlign: "center", padding: "5rem", backgroundColor: "#f8fafc", borderRadius: "24px", color: "#94a3b8" }}>
                                                        <i className="fa-solid fa-user-doctor-message" style={{ fontSize: "3rem", marginBottom: "1rem" }}></i>
                                                        <p>No visits recorded yet for this operation.</p>
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: "2rem", backgroundColor: "#eff6ff", borderRadius: "24px", border: "1px solid #bfdbfe" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                                                            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                                                <div style={{ width: "64px", height: "64px", borderRadius: "18px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #bfdbfe", color: "#3b82f6", fontSize: "1.5rem" }}>
                                                                    <i className="fa-solid fa-user-doctor"></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>Most Recent Rounds</div>
                                                                    <h3 style={{ margin: "4px 0", fontSize: "1.25rem", fontWeight: "900", color: "#1e3a8a" }}>{latestVisitDetail.doctorName}</h3>
                                                                    <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "700" }}>{latestVisitDetail.doctorSpecialization}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ textAlign: "right" }}>
                                                                <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "#1e3a8a" }}>{new Date(latestVisitDetail.visitTime).toLocaleString()}</div>
                                                                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>Logged by: <strong>{latestVisitDetail.recordedByName}</strong></div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid #dbeafe" }}>
                                                                    <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "#3b82f6", textTransform: "uppercase", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <i className="fa-solid fa-clipboard-check"></i> Clinical Observations
                                                                    </div>
                                                                    <p style={{ margin: 0, fontSize: "1rem", color: "#334155", lineHeight: "1.7", fontWeight: "500" }}>{latestVisitDetail.clinicalObservations}</p>
                                                                </div>
                                                                
                                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                                                    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "20px", border: "1px solid #dbeafe" }}>
                                                                        <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>Current Assessment</div>
                                                                        <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1e3a8a" }}>{latestVisitDetail.diagnosis || 'No specific assessment noted'}</div>
                                                                    </div>
                                                                    <div style={{ backgroundColor: "white", padding: "1.25rem", borderRadius: "20px", border: "1px solid #dbeafe" }}>
                                                                        <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>Treatment Plan</div>
                                                                        <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1e3a8a" }}>{latestVisitDetail.treatmentPlan || 'Continue current plan'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                                {latestVisitDetail.hasMedicationChange && (
                                                                    <div style={{ backgroundColor: "#f0f9ff", padding: "1.5rem", borderRadius: "20px", border: "1px dashed #3b82f6" }}>
                                                                        <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "#2563eb", textTransform: "uppercase", marginBottom: "12px" }}>Medication Changes</div>
                                                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                                            {latestVisitDetail.medicationsAdded && (
                                                                                <div>
                                                                                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#3b82f6" }}>Added</div>
                                                                                    <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1e40af" }}>{latestVisitDetail.medicationsAdded}</div>
                                                                                </div>
                                                                            )}
                                                                            {latestVisitDetail.medicationsDiscontinued && (
                                                                                <div>
                                                                                    <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#ef4444" }}>Discontinued</div>
                                                                                    <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#991b1b" }}>{latestVisitDetail.medicationsDiscontinued}</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {latestVisitDetail.dischargeRecommended && (
                                                                    <div style={{ backgroundColor: "#fef2f2", padding: "1.5rem", borderRadius: "20px", border: "1px solid #fecaca" }}>
                                                                        <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "#ef4444", textTransform: "uppercase", marginBottom: "10px" }}>Discharge Recommendation</div>
                                                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#991b1b", fontWeight: "700" }}>{latestVisitDetail.dischargeNotes}</p>
                                                                        {latestVisitDetail.expectedDischargeDate && (
                                                                            <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#b91c1c" }}>
                                                                                Expected At: <strong>{new Date(latestVisitDetail.expectedDischargeDate).toLocaleString()}</strong>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(visitSubTab === 'list' || visitSubTab === 'scheduled') && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                {visitSubTab === 'list' && (
                                                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f8fafc", padding: "0.4rem 0.8rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                                            <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Filter Status:</span>
                                                            <select 
                                                                value={visitStatusFilter}
                                                                onChange={(e) => setVisitStatusFilter(e.target.value)}
                                                                style={{ 
                                                                    padding: "0.3rem 0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", 
                                                                    fontSize: "0.8rem", fontWeight: "700", color: "#1e293b", cursor: "pointer",
                                                                    outline: "none", backgroundColor: "white"
                                                                }}
                                                            >
                                                                <option value="ALL">All Statuses</option>
                                                                <option value="COMPLETED">Completed Rounds</option>
                                                                <option value="SCHEDULED">Upcoming Scheduled</option>
                                                                <option value="CANCELLED">Cancelled Rounds</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                {visits.length === 0 ? (
                                                    <div style={{ textAlign: "center", padding: "5rem", backgroundColor: "#f8fafc", borderRadius: "24px", color: "#94a3b8" }}>
                                                        <i className="fa-solid fa-notes-medical" style={{ fontSize: "3rem", marginBottom: "1rem" }}></i>
                                                        <p>No physician visits found for the selected criteria.</p>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                                        {visits.sort((a,b) => new Date(b.visitTime) - new Date(a.visitTime)).map(visit => (
                                                            <div key={visit.id} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "24px", overflow: "hidden" }}>
                                                                <div style={{ padding: "1.25rem 2rem", backgroundColor: visit.status === 'SCHEDULED' ? "#fff7ed" : "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5", border: "1px solid #e2e8f0" }}>
                                                                            <i className="fa-solid fa-user-doctor"></i>
                                                                        </div>
                                                                        <div>
                                                                            <div style={{ fontWeight: "800", color: "#1e293b" }}>{visit.doctorName}</div>
                                                                            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600" }}>{visit.doctorSpecialization}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: "right" }}>
                                                                        <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1e293b" }}>{new Date(visit.visitTime).toLocaleString()}</div>
                                                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px", justifyContent: "flex-end" }}>
                                                                            {visit.status === 'SCHEDULED' && (
                                                                                <>
                                                                                    {isDoctor && (
                                                                                        <button 
                                                                                            onClick={() => handleCompleteVisit(visit.id)}
                                                                                            style={{ 
                                                                                                padding: "6px 12px", backgroundColor: "#10b981", color: "white", 
                                                                                                border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", 
                                                                                                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                                                                                                boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)"
                                                                                            }}
                                                                                        >
                                                                                            <i className="fa-solid fa-check-double"></i> Complete Round
                                                                                        </button>
                                                                                    )}
                                                                                    <button 
                                                                                        onClick={() => handleCancelVisit(visit.id)}
                                                                                        style={{ 
                                                                                            padding: "6px 12px", backgroundColor: "#fee2e2", color: "#ef4444", 
                                                                                            border: "1px solid #fecaca", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", 
                                                                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                                                                                        }}
                                                                                    >
                                                                                        <i className="fa-solid fa-ban"></i> Cancel
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                            <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "900", backgroundColor: visit.status === 'SCHEDULED' ? "#fb923c" : (visit.status === 'CANCELLED' ? "#ef4444" : "#10b981"), color: "white" }}>{visit.status}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ padding: "1.5rem 2rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                                                                    <div>
                                                                        <div style={{ marginBottom: "1.5rem" }}>
                                                                            <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "6px" }}>Clinical Observations</div>
                                                                            <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>{visit.clinicalObservations}</div>
                                                                        </div>
                                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                                                            {visit.diagnosis && (
                                                                                <div>
                                                                                    <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Diagnosis</div>
                                                                                    <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{visit.diagnosis}</div>
                                                                                </div>
                                                                            )}
                                                                            {visit.treatmentPlan && (
                                                                                <div>
                                                                                    <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Plan</div>
                                                                                    <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{visit.treatmentPlan}</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {visit.hasMedicationChange && (
                                                                        <div style={{ borderLeft: "1px dashed #e2e8f0", paddingLeft: "1.5rem" }}>
                                                                            <div style={{ fontSize: "0.65rem", fontWeight: "900", color: "#4f46e5", textTransform: "uppercase", marginBottom: "8px" }}>Med Changes</div>
                                                                            {visit.medicationsAdded && <div style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: "700" }}>+ {visit.medicationsAdded}</div>}
                                                                            {visit.medicationsDiscontinued && <div style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: "700" }}>- {visit.medicationsDiscontinued}</div>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

            {/* Discharge Confirmation Modal */}
            {showDischargeConfirm && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1700, backdropFilter: "blur(8px)"
                }}>
                    <div style={{
                        backgroundColor: "#ffffff", borderRadius: "28px", padding: "2.5rem",
                        width: "460px", maxWidth: "90vw",
                        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                        animation: "fadeInScale 0.25s ease-out"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <div style={{
                                width: "72px", height: "72px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 1.25rem auto", border: "2px solid #fecaca"
                            }}>
                                <i className="fa-solid fa-right-from-bracket" style={{ fontSize: "1.75rem", color: "#ef4444" }}></i>
                            </div>
                            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.35rem", fontWeight: "900", color: "#0f172a" }}>
                                Discharge Patient?
                            </h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem", lineHeight: "1.6" }}>
                                Are you sure you want to discharge <strong style={{ color: "#1e293b" }}>{admission?.patientName}</strong> from the recovery room? This action cannot be undone.
                            </p>
                        </div>

                        {admission && (
                            <div style={{
                                backgroundColor: "#f8fafc", borderRadius: "16px", padding: "1rem 1.25rem",
                                marginBottom: "1.75rem", border: "1px solid #f1f5f9"
                            }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem" }}>
                                    <div>
                                        <span style={{ color: "#94a3b8", fontWeight: "600" }}>MRN: </span>
                                        <span style={{ color: "#1e293b", fontWeight: "800" }}>{admission.patientMrn}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: "#94a3b8", fontWeight: "600" }}>Room: </span>
                                        <span style={{ color: "#1e293b", fontWeight: "800" }}>{admission.roomName}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: "#94a3b8", fontWeight: "600" }}>Bed: </span>
                                        <span style={{ color: "#1e293b", fontWeight: "800" }}>{admission.bedNumber}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: "#94a3b8", fontWeight: "600" }}>Admitted: </span>
                                        <span style={{ color: "#1e293b", fontWeight: "800" }}>{new Date(admission.admissionTime).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                onClick={() => setShowDischargeConfirm(false)}
                                disabled={dischargeLoading}
                                style={{
                                    flex: 1, padding: "0.875rem", borderRadius: "14px",
                                    border: "1px solid #e2e8f0", backgroundColor: "#ffffff",
                                    color: "#64748b", fontWeight: "800", fontSize: "0.9rem",
                                    cursor: "pointer", transition: "all 0.2s"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDischargePatient}
                                disabled={dischargeLoading}
                                style={{
                                    flex: 1, padding: "0.875rem", borderRadius: "14px",
                                    border: "none", 
                                    background: dischargeLoading ? "#94a3b8" : "linear-gradient(135deg, #ef4444, #dc2626)",
                                    color: "#ffffff", fontWeight: "800", fontSize: "0.9rem",
                                    cursor: dischargeLoading ? "not-allowed" : "pointer",
                                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                    transition: "all 0.2s"
                                }}
                            >
                                {dischargeLoading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Discharging...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check"></i>
                                        Yes, Discharge
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecoveryDetailsModal;

