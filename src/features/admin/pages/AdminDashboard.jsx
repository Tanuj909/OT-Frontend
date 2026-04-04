import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    // Current Time for Live Feel
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock Data
    const stats = [
        { id: 1, title: "Total Operations Today", value: "24", icon: "fa-hospital-user", color: "#3B82F6", trend: "+12% from yesterday" },
        { id: 2, title: "Ongoing Operations", value: "05", icon: "fa-stethoscope", color: "#DC2626", trend: "Live", isLive: true },
        { id: 3, title: "Completed Today", value: "12", icon: "fa-circle-check", color: "#16A34A", trend: "+4 since last hour" },
        { id: 4, title: "Available OT Rooms", value: "03", icon: "fa-door-open", color: "#F59E0B", trend: "OT-2, OT-5, OT-8" },
        { id: 5, title: "Emergency Cases", value: "02", icon: "fa-truck-medical", color: "#EF4444", trend: "High Priority" },
        { id: 6, title: "Staff On Duty", value: "48", icon: "fa-user-nurse", color: "#6366F1", trend: "100% capacity" },
    ];

    const rooms = [
        { id: 'OT-1', status: 'in-use', surgeon: 'Dr. Sharma', op: 'Heart Bypass' },
        { id: 'OT-2', status: 'available', surgeon: '-', op: '-' },
        { id: 'OT-3', status: 'scheduled', surgeon: 'Dr. Rahul', op: 'Cataract' },
        { id: 'OT-4', status: 'cleaning', surgeon: '-', op: '-' },
        { id: 'OT-5', status: 'in-use', surgeon: 'Dr. Mehta', op: 'Appendectomy' },
        { id: 'OT-6', status: 'in-use', surgeon: 'Dr. Verma', op: 'Spinal Fusion' },
        { id: 'OT-7', status: 'scheduled', surgeon: 'Dr. Gupta', op: 'Hip Replace' },
        { id: 'OT-8', status: 'available', surgeon: '-', op: '-' },
    ];

    const liveOps = [
        { id: 1, patient: 'Aarav Singh', type: 'Angioplasty', surgeon: 'Dr. Khanna', room: 'OT-1', time: '10:30 AM', status: 'Ongoing' },
        { id: 2, patient: 'Priya Verma', type: 'Gallbladder', surgeon: 'Dr. Iyer', room: 'OT-5', time: '11:15 AM', status: 'Ongoing' },
        { id: 3, patient: 'Ishaan Gupta', type: 'Knee Surgery', surgeon: 'Dr. Roy', room: 'OT-6', time: '09:45 AM', status: 'Completed' },
        { id: 4, patient: 'Ananya Das', type: 'Rhinoplasty', surgeon: 'Dr. Basu', room: 'OT-3', time: '12:30 PM', status: 'Scheduled' },
        { id: 5, patient: 'Rohan Shah', type: 'Hernia', surgeon: 'Dr. Patel', room: 'OT-7', time: '01:00 PM', status: 'Scheduled' },
    ];

    const staff = [
        { name: 'Dr. Aryan Sharma', role: 'Chief Surgeon', status: 'busy', room: 'OT-1' },
        { name: 'Nurse Mira Reddy', role: 'Senior Nurse', status: 'busy', room: 'OT-1' },
        { name: 'Dr. Alok Nath', role: 'Anesthetist', status: 'available', room: '-' },
        { name: 'Dr. Sameera Khan', role: 'Surgeon', status: 'available', room: '-' },
        { name: 'Sanjay Kumar', role: 'OT Technician', status: 'busy', room: 'OT-5' },
    ];

    const alerts = [
        { type: 'critical', text: 'Oxygen Pressure Low in OT-4', time: '2 mins ago', icon: 'fa-triangle-exclamation' },
        { type: 'emergency', text: 'Incoming Emergency: Trauma Case', time: 'Just now', icon: 'fa-truck-medical' },
        { type: 'info', text: 'Dr. Roy delayed by 15 mins', time: '10 mins ago', icon: 'fa-clock' },
    ];

    const logs = [
        { text: 'Surgery started in OT-5 (Patient: Priya Verma)', time: '11:15 AM' },
        { text: 'OT-6 surgery marked as Completed', time: '11:05 AM' },
        { text: 'OT-2 cleaning protocol finished', time: '10:50 AM' },
        { text: 'Staff shift change for Afternoon session', time: '10:30 AM' },
        { text: 'Dr. Khanna entered OT-1', time: '10:15 AM' },
    ];

    const timelineData = [
        { room: 'OT-1', ops: [{ name: 'A. Singh', start: 10, duration: 3, status: 'Ongoing' }] },
        { room: 'OT-2', ops: [] },
        { room: 'OT-3', ops: [{ name: 'A. Das', start: 12.5, duration: 2, status: 'Scheduled' }] },
        { room: 'OT-4', ops: [{ name: 'K. Jain', start: 8, duration: 2, status: 'Completed' }] },
        { room: 'OT-5', ops: [{ name: 'P. Verma', start: 11, duration: 2.5, status: 'Ongoing' }] },
    ];

    return (
        <div className="admin-dashboard-container">
            {/* Top Navigation Mock (Integrated or Page Header) */}
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
                    <div style={{ position: 'relative' }}>
                        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.875rem' }}></i>
                        <input 
                            type="text" 
                            placeholder="Find Patient, Surgeon, OT..." 
                            style={{ 
                                padding: '0.625rem 1rem 0.625rem 2.25rem', 
                                border: '1px solid var(--border-light)', 
                                borderRadius: '10px', 
                                fontSize: '0.875rem', 
                                outline: 'none',
                                width: '280px',
                                background: 'white'
                            }} 
                        />
                    </div>
                    <button style={{ padding: '0.625rem 1rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                        <i className="fa-solid fa-bell" style={{ color: '#64748B' }}></i>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.375rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>AD</div>
                        <div style={{ fontSize: '0.75rem' }}>
                            <div style={{ fontWeight: 700 }}>Admin Hub</div>
                            <div style={{ color: 'var(--text-muted)' }}>Level 1 Admin</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📊 Top Cards Section */}
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
                            {stat.isLive && <span className="live-indicator" style={{ display: 'inline-block', marginLeft: '0.5rem' }}></span>}
                        </div>
                        <div className="stat-subtext">
                            {stat.isLive ? <span style={{ color: '#EF4444', fontWeight: 600 }}>LIVE TRACKING</span> : stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="dashboard-main-grid">
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Live Operations Table */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-wave-square" style={{ color: '#EF4444' }}></i> Live Operations</div>
                            <button style={{ color: 'var(--primary-blue)', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                        </div>
                        <div className="table-container">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Procedure</th>
                                        <th>Surgeon</th>
                                        <th>Room</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveOps.map(op => (
                                        <tr key={op.id}>
                                            <td style={{ fontWeight: 600 }}>{op.patient}</td>
                                            <td>{op.type}</td>
                                            <td>{op.surgeon}</td>
                                            <td><span className="status-badge badge-info">{op.room}</span></td>
                                            <td>{op.time}</td>
                                            <td>
                                                <span className={`status-badge ${op.status === 'Ongoing' ? 'badge-danger' : op.status === 'Scheduled' ? 'badge-warning' : 'badge-success'}`}>
                                                    {op.status === 'Ongoing' && <i className="fa-solid fa-circle-dot" style={{ marginRight: '0.25rem', fontSize: '0.6rem' }}></i>}
                                                    {op.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Schedule Timeline */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-timeline"></i> Surgical Timeline (Today)</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '8px', height: '8px', background: '#DC2626', borderRadius: '2px' }}></span> Ongoing</span>
                                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '8px', height: '8px', background: '#F59E0B', borderRadius: '2px' }}></span> Scheduled</span>
                                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '8px', height: '8px', background: '#16A34A', borderRadius: '2px' }}></span> Finished</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="timeline-container">
                                <div className="timeline-hour-labels">
                                    <span>08 AM</span><span>09 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>01 PM</span><span>02 PM</span><span>03 PM</span><span>04 PM</span><span>05 PM</span>
                                </div>
                                {timelineData.map((row, i) => (
                                    <div key={i} className="timeline-row">
                                        <div className="timeline-room-label">{row.room}</div>
                                        <div className="timeline-grid">
                                            {row.ops.map((op, j) => (
                                                <div 
                                                    key={j} 
                                                    className="timeline-block" 
                                                    style={{ 
                                                        left: `${(op.start - 8) * 10}%`, 
                                                        width: `${op.duration * 10}%`,
                                                        backgroundColor: op.status === 'Ongoing' ? 'var(--status-critical)' : op.status === 'Completed' ? 'var(--status-success)' : 'var(--status-warning)'
                                                    }}
                                                >
                                                    {op.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div className="card-title">OT Utilization Rate</div>
                            </div>
                            <div className="card-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                                <div className="chart-placeholder">
                                    <div className="chart-pie"></div>
                                    <div style={{ position: 'absolute', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>76%</div>
                                        <div style={{ color: 'var(--text-muted)' }}>Occupancy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div className="card-title">Ops vs Capacity</div>
                            </div>
                            <div className="card-body">
                                <div className="chart-placeholder">
                                    <div className="chart-bars">
                                        <div className="chart-bar" style={{ height: '60px' }}></div>
                                        <div className="chart-bar" style={{ height: '85px', opacity: 1 }}></div>
                                        <div className="chart-bar" style={{ height: '40px' }}></div>
                                        <div className="chart-bar" style={{ height: '70px' }}></div>
                                        <div className="chart-bar" style={{ height: '95px' }}></div>
                                        <div className="chart-bar" style={{ height: '50px' }}></div>
                                        <div className="chart-bar" style={{ height: '80px' }}></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '0 0.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>MON</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>TUE</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>WED</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>THU</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>FRI</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>SAT</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>SUN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Alerts Panel */}
                    <div className="dashboard-card" style={{ border: '1px solid #FECACA' }}>
                        <div className="card-header" style={{ background: '#FEF2F2' }}>
                            <div className="card-title" style={{ color: '#DC2626' }}><i className="fa-solid fa-triangle-exclamation"></i> Critical Alerts</div>
                        </div>
                        <div className="card-body">
                            <div className="alerts-list">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className={`alert-item ${alert.type === 'critical' ? 'critical' : ''}`}>
                                        <div className="alert-icon" style={{ 
                                            background: alert.type === 'critical' ? '#EF4444' : alert.type === 'emergency' ? '#F59E0B' : '#3B82F6',
                                            color: 'white'
                                        }}>
                                            <i className={`fa-solid ${alert.icon}`}></i>
                                        </div>
                                        <div className="alert-info">
                                            <span className="alert-text">{alert.text}</span>
                                            <span className="alert-time">{alert.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* OT Status Grid */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-border-all"></i> Room Status Grid</div>
                        </div>
                        <div className="card-body">
                            <div className="ot-status-grid">
                                {rooms.map(room => (
                                    <div key={room.id} className={`ot-room-card ${room.status}`}>
                                        <div className="room-id">{room.id}</div>
                                        <div className="room-status" style={{ color: `var(--status-${room.status === 'in-use' ? 'critical' : room.status === 'scheduled' ? 'warning' : room.status === 'available' ? 'success' : 'muted'})` }}>
                                            {room.status.replace('-', ' ')}
                                        </div>
                                        <div className="room-surgeon">{room.surgeon}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Staff Availability */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-user-doctor"></i> Staff Availability</div>
                            <span className="status-badge badge-success">48 ON DUTY</span>
                        </div>
                        <div className="card-body">
                            <div className="staff-list">
                                {staff.map((s, idx) => (
                                    <div key={idx} className="staff-row">
                                        <div className="staff-identity">
                                            <div className="staff-avatar">{s.name.charAt(4)}</div>
                                            <div>
                                                <div className="staff-name">{s.name}</div>
                                                <div className="staff-role">{s.role}</div>
                                            </div>
                                        </div>
                                        <div className="staff-status">
                                            <span className={`dot dot-${s.status}`}></span>
                                            {s.status === 'busy' ? s.room : 'AVAIL'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--primary-blue)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8125rem' }}>
                                MANAGE ROSTER
                            </button>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="dashboard-card" style={{ flex: 1 }}>
                        <div className="card-header">
                            <div className="card-title"><i className="fa-solid fa-list-ul"></i> Recent Activity</div>
                        </div>
                        <div className="card-body">
                            <div className="activity-list">
                                {logs.map((log, idx) => (
                                    <div key={idx} className="activity-item">
                                        <div className="activity-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
                                            <i className="fa-solid fa-circle-notch"></i>
                                        </div>
                                        <div className="activity-info">
                                            <span className="activity-text">{log.text}</span>
                                            <span className="activity-time">{log.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Dark Mode Toggle & Filters Floating Actions (Optional Enhancement) */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', gap: '0.5rem' }}>
                 <button style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer', color: '#64748B' }} title="Filters">
                    <i className="fa-solid fa-sliders"></i>
                </button>
                <button style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1E293B', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer', color: 'white' }} title="Dark Mode">
                    <i className="fa-solid fa-moon"></i>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
