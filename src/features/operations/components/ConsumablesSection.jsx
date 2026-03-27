const ConsumablesSection = () => (
    <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fa-solid fa-box-archive" style={{ color: "var(--hospital-blue)" }}></i> Surgical Consumables Usage
        </h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
                <i className="fa-solid fa-search" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
                <input type="text" placeholder="Add items (e.g., Sutures, Gauze, Drug ID)..." style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "8px", border: "1.5px solid #f1f5f9" }} />
            </div>
            <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Add To Log</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #f1f5f9" }}>
                    <th style={{ padding: "1rem", fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8" }}>ITEM NAME</th>
                    <th style={{ padding: "1rem", fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8" }}>CATEGORY</th>
                    <th style={{ padding: "1rem", fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8" }}>QUANTITY</th>
                    <th style={{ padding: "1rem", fontSize: "0.7rem", fontWeight: "900", color: "#94a3b8", textAlign: "right" }}>ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {[
                    { name: "Surgical Sutures (Nylon 2-0)", cat: "Disp. Item", qty: 4 },
                    { name: "Sterile Gauze Pads (4x4)", cat: "Supplies", qty: 12 },
                    { name: "Propofol Induction Dose", cat: "Pharmacy", qty: 1 }
                ].map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem", fontWeight: "700", color: "#334155" }}>{item.name}</td>
                        <td style={{ padding: "1rem" }}><span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", backgroundColor: "#eff6ff", color: "var(--hospital-blue)", borderRadius: "10px", fontWeight: "800" }}>{item.cat}</span></td>
                        <td style={{ padding: "1rem", fontWeight: "800" }}>{item.qty} units</td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                            <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><i className="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default ConsumablesSection;
