const NotesSection = () => (
    <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <i className="fa-solid fa-file-medical" style={{ color: "var(--hospital-blue)" }}></i> Operative Findings & Notes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>SURGICAL FINDINGS</label>
                <textarea 
                    placeholder="Document clinical observations..." 
                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", height: "150px", resize: "none" }}
                ></textarea>
            </div>
            <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "900", marginBottom: "0.4rem", color: "#64748b" }}>PROCEDURE SUMMARY</label>
                <textarea 
                    placeholder="Enter final summary..." 
                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", height: "100px", resize: "none" }}
                ></textarea>
            </div>
            <button style={{ width: "100%", padding: "1rem", backgroundColor: "var(--hospital-blue)", color: "white", border: "none", borderRadius: "12px", fontWeight: "800", textTransform: "uppercase", cursor: "pointer" }}>
                Commit Operative Notes
            </button>
        </div>
    </div>
);

export default NotesSection;
