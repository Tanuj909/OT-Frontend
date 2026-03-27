const IntraOpSection = () => (
    <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fa-solid fa-heart-pulse" style={{ color: "var(--hospital-blue)" }}></i> Intra-Operative Event Log
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
                <input type="text" placeholder="Entry quick event log..." style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1.5px solid #f1f5f9" }} />
                <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>Log Event</button>
            </div>
            
            <div style={{ marginTop: "1rem" }}>
                {[
                    { time: "12:15 PM", event: "Patient Positioned for Procedure", user: "Sr. Emily Dawson" },
                    { time: "11:50 AM", event: "Anesthesia Induction Started", user: "Dr. Robert Chen" },
                    { time: "11:30 AM", event: "Patient Wheeled into OT 04", user: "Mr. Kevin Park" }
                ].map((log, idx) => (
                    <div key={idx} style={{ padding: "1rem", borderLeft: "3px solid var(--hospital-blue)", backgroundColor: "white", marginBottom: "0.5rem", borderRadius: "0 8px 8px 0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: "800", fontSize: "0.875rem" }}>{log.event}</span>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>{log.time}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.2rem" }}>Logged by: {log.user}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default IntraOpSection;
