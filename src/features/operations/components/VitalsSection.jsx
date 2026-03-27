const VitalsSection = () => (
    <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fa-solid fa-gauge-high" style={{ color: "var(--hospital-blue)" }}></i> Physiological Monitoring
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
                { label: "Heart Rate", value: "78", unit: "bpm", color: "#ef4444", trend: "stable" },
                { label: "Blood Pressure", value: "118/76", unit: "mmHg", color: "#3b82f6", trend: "stable" },
                { label: "SpO2", value: "98", unit: "%", color: "#10b981", trend: "up" },
                { label: "Temp", value: "36.7", unit: "°C", color: "#f59e0b", trend: "stable" },
                { label: "Resp Rate", value: "15", unit: "/min", color: "#8b5cf6", trend: "down" },
                { label: "MAP", value: "90", unit: "mmHg", color: "#6366f1", trend: "stable" }
            ].map((vital, idx) => (
                <div key={idx} style={{ backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "16px", border: "1px solid #f1f5f9", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>{vital.label}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: vital.color }}>{vital.value}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>{vital.unit}</div>
                </div>
            ))}
        </div>
    </div>
);

export default VitalsSection;
