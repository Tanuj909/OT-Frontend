import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { getAdminDashboardApi } from '../service/adminApi';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchDashboardData();
        // Refresh every 30 seconds
        const refreshTimer = setInterval(fetchDashboardData, 30000);
        return () => {
            clearInterval(timer);
            clearInterval(refreshTimer);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await getAdminDashboardApi();
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboardData) {
        return (
            <div className="admin-dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loader">Loading Dashboard...</div>
            </div>
        );
    }

    const { overviewStats, otRoomStatus, recentOperations, pendingRequests, overdueOperations, staffAvailability } = dashboardData;

    const stats = [
        { id: 1, title: "Total Ops Today", value: overviewStats.totalOperationsToday, icon: "fa-hospital-user", color: "#3B82F6", sub: `${overviewStats.scheduledOperations} Scheduled` },
        { id: 2, title: "In Progress", value: overviewStats.inProgressOperations, icon: "fa-stethoscope", color: "#DC2626", isLive: true },
        { id: 3, title: "Completed Today", value: overviewStats.completedOperationsToday, icon: "fa-circle-check", color: "#16A34A" },
        { id: 4, title: "Pending OT Requests", value: overviewStats.pendingOTRequests, icon: "fa-clock-rotate-left", color: "#F59E0B" },
        { id: 5, title: "OT Room Occupancy", value: `${overviewStats.occupiedOTRooms}/${overviewStats.availableOTRooms + overviewStats.occupiedOTRooms}`, icon: "fa-door-open", color: "#6366F1" },
        { id: 6, title: "Ward Bed Availability", value: `${overviewStats.availableWardBeds}/${overviewStats.totalWardBeds}`, icon: "fa-bed", color: "#8B5CF6" },
    ];

    const formatTime = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="admin-dashboard-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                     <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
                        OT Operations <span style={{ color: 'var(--primary-blue)' }}>Control Hub</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <i className="fa-solid fa-calendar-day" style={{ marginRight: '0.5rem' }}></i>
                        Today, {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} | 
                        <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{currentTime.toLocaleTimeString()}</span>
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={fetchDashboardData} style={{ padding: '0.625rem 1rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <i className="fa-solid fa-sync" style={{ color: '#64748B', marginRight: '0.5rem' }}></i> Refresh
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.375rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>AD</div>
                        <div style={{ fontSize: '0.75rem' }}>
                            <div style={{ fontWeight: 700 }}>Admin Hub</div>
                            <div style={{ color: 'var(--text-muted)' }}>Operations Admin</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map(stat => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-header">
                            <span className="stat-title">{stat.title}</span>
                            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <i className={`fa-solid ${stat.icon}`}></i>
                            </div>
                        </div>
                        <div className="stat-value">
                            {stat.value}
                            {stat.isLive && overviewStats.inProgressOperations > 0 && <span className="live-indicator" style={{ display: 'inline-block', marginLeft: '0.5rem' }}></span>}
                        </div>
                        <div className="stat-subtext">
                            {stat.isLive ? <span style={{ color: '#EF4444', fontWeight: 600 }}>LIVE TRACKING</span> : stat.sub || "Updated now"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="dashboard-main-grid">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Overdue Operations Alert (Critical) */}
                    {overdueOperations?.length > 0 && (
                        <div className="dashboard-card" style={{ border: '1px solid #FECACA' }}>
                            <div className="card-header" style={{ background: '#FEF2F2' }}>
                                <div className="card-title" style={{ color: '#DC2626' }}>
                                    <i className="fa-solid fa-triangle-exclamation"></i> Overdue Operations ({overdueOperations.length})
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: '0' }}>
                                <div className="table-container">
                                    <table className="dashboard-table">
                                        <thead>
                                            <tr>
                                                <th>Patient</th>
                                                <th>Procedure</th>
                                                <th>Room</th>
                                                <th>Scheduled End</th>
                                                <th>Exceeded By</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overdueOperations.map(op => (
                                                <tr key={op.operationId}>
                                                    <td style={{ fontWeight: 600 }}>{op.patientName}</td>
                                                    <td>{op.procedureName}</td>
                                                    <td><span className="status-badge badge-danger">{op.roomNumber}</span></td>
                                                    <td>{formatTime(op.scheduledEndTime)}</td>
                                                    <td style={{ color: '#DC2626', fontWeight: 700 }}>{op.exceededByMinutes} mins</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending OT Requests */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-clock-rotate-left"></i> Pending OT Requests</div>
                            <span className="status-badge badge-warning">{pendingRequests?.length || 0} NEW</span>
                        </div>
                        <div className="table-container">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Procedure</th>
                                        <th>Requested At</th>
                                        <th>Waiting For</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRequests?.map(req => (
                                        <tr key={req.operationId}>
                                            <td style={{ fontWeight: 600 }}>{req.patientName}</td>
                                            <td>{req.procedureName}</td>
                                            <td>{new Date(req.requestedAt).toLocaleString()}</td>
                                            <td><span style={{ color: req.pendingSinceHours > 12 ? '#DC2626' : '#F59E0B', fontWeight: 600 }}>{req.pendingSinceHours} hours</span></td>
                                            <td><button className="status-badge badge-info" style={{ border: 'none', cursor: 'pointer' }}>Process</button></td>
                                        </tr>
                                    ))}
                                    {(!pendingRequests || pendingRequests.length === 0) && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending requests</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent/Ongoing Operations */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-list"></i> Recent & Ongoing Operations</div>
                        </div>
                        <div className="table-container">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Procedure</th>
                                        <th>Surgeon</th>
                                        <th>Room</th>
                                        <th>Start Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOperations?.map(op => (
                                        <tr key={op.operationId}>
                                            <td style={{ fontWeight: 600 }}>{op.patientName}</td>
                                            <td>{op.procedureName}</td>
                                            <td>{op.primarySurgeon}</td>
                                            <td><span className="status-badge badge-info">{op.roomNumber}</span></td>
                                            <td>{formatTime(op.actualStartTime)}</td>
                                            <td>
                                                <span className={`status-badge ${op.status === 'IN_PROGRESS' ? 'badge-danger' : op.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                                                    {op.status === 'IN_PROGRESS' && <i className="fa-solid fa-circle-dot" style={{ marginRight: '0.25rem', fontSize: '0.6rem' }}></i>}
                                                    {op.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* OT Status Grid */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-border-all"></i> Room Status Grid</div>
                        </div>
                        <div className="card-body">
                            <div className="ot-status-grid">
                                {otRoomStatus?.map(room => (
                                    <div key={room.roomId} className={`ot-room-card ${room.status.toLowerCase()}`}>
                                        <div className="room-id">{room.roomNumber}</div>
                                        <div className="room-status" style={{ 
                                            color: room.status === 'AVAILABLE' ? 'var(--status-success)' : 
                                                   room.status === 'IN_USE' ? 'var(--status-critical)' : 
                                                   room.status === 'CLEANING' ? '#64748B' : 'var(--status-warning)' 
                                        }}>
                                            {room.status}
                                        </div>
                                        <div className="room-surgeon" style={{ fontSize: '0.7rem' }}>
                                            {room.currentPatientName ? `Patient: ${room.currentPatientName}` : "-"}
                                        </div>
                                        {room.isOverdue && (
                                            <div style={{ fontSize: '0.65rem', color: '#DC2626', fontWeight: 700, marginTop: '4px' }}>
                                                <i className="fa-solid fa-clock"></i> OVERDUE
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Staff Availability Summary */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-user-doctor"></i> Staffing Overview</div>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <StaffStatRow label="Surgeons" total={staffAvailability.totalSurgeons} busy={staffAvailability.busySurgeons} />
                                <StaffStatRow label="Anesthesiologists" total={staffAvailability.totalAnesthesiologists} busy={staffAvailability.busyAnesthesiologists} />
                                <StaffStatRow label="Nurses" total={staffAvailability.totalNurses} busy={staffAvailability.busyNurses} />
                                <StaffStatRow label="Technicians" total={staffAvailability.totalTechnicians} busy={staffAvailability.busyTechnicians} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-chart-simple"></i> Bed Occupancy</div>
                        </div>
                        <div className="card-body">
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <span>Ward Beds</span>
                                    <span style={{ fontWeight: 600 }}>{overviewStats.occupiedWardBeds} / {overviewStats.totalWardBeds} Occupied</span>
                                </div>
                                <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(overviewStats.occupiedWardBeds / overviewStats.totalWardBeds) * 100}%`, 
                                        background: 'var(--primary-blue)',
                                        transition: 'width 0.5s ease-in-out'
                                    }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OT Available</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-success)' }}>{overviewStats.availableOTRooms}</div>
                                </div>
                                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ward Available</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{overviewStats.availableWardBeds}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const StaffStatRow = ({ label, total, busy }) => {
    const available = total - busy;
    const percentage = total > 0 ? (busy / total) * 100 : 0;
    
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span>{busy} / {total} Busy</span>
            </div>
            <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: percentage > 80 ? '#DC2626' : percentage > 50 ? '#F59E0B' : '#16A34A',
                    transition: 'width 0.5s ease-in-out'
                }}></div>
            </div>
            <div style={{ fontSize: '0.65rem', color: available === 0 ? '#DC2626' : 'var(--text-muted)', textAlign: 'right' }}>
                {available} available
            </div>
        </div>
    );
};

export default AdminDashboard;
