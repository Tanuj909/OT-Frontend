import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { NOTE_TYPES } from "../constants/notes.endpoint";

const NotesSection = () => {
    const { operationId } = useParams();
    const { loading, addNote, getNotes, updateNote, deleteNote } = useNotes();

    const [notes, setNotes] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    
    const [formData, setFormData] = useState({
        type: "INTRA_OP",
        content: "",
        isConfidential: false
    });

    const refreshNotes = useCallback(async () => {
        const res = await getNotes(operationId);
        if (res.success) {
            setNotes(res.data || []);
        }
    }, [operationId, getNotes]);

    useEffect(() => {
        refreshNotes();
    }, [refreshNotes]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            type: "INTRA_OP",
            content: "",
            isConfidential: false
        });
        setEditingNote(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.content.trim()) return;

        const res = editingNote 
            ? await updateNote(operationId, editingNote.id, { 
                content: formData.content, 
                isConfidential: formData.isConfidential 
            })
            : await addNote(operationId, formData);
        
        if (res.success) {
            resetForm();
            refreshNotes();
        } else {
            alert(res.message || "Failed to save note");
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({
            type: note.type,
            content: note.content,
            isConfidential: note.confidential
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        const res = await deleteNote(operationId, noteId);
        if (res.success) {
            refreshNotes();
        } else {
            alert(res.message || "Failed to delete note");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header & Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <i className="fa-solid fa-file-medical" style={{ color: "var(--hospital-blue)" }}></i> Operative Notes & Clinical Findings
                </h3>
                <button 
                    onClick={() => { setIsFormOpen(!isFormOpen); if(!isFormOpen) setEditingNote(null); }}
                    style={{ 
                        padding: "0.6rem 1.2rem", fontSize: "0.8rem", fontWeight: "800", 
                        backgroundColor: isFormOpen ? "#f1f5f9" : "var(--hospital-blue)", 
                        color: isFormOpen ? "#64748b" : "white", 
                        border: "none", borderRadius: "10px", cursor: "pointer", 
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        transition: "all 0.3s ease"
                    }}
                >
                    <i className={`fa-solid ${isFormOpen ? "fa-xmark" : "fa-plus"}`}></i>
                    {isFormOpen ? "Cancel" : "Add Clinical Note"}
                </button>
            </div>

            {/* ➕ Entry/Edit Form */}
            {isFormOpen && (
                <div style={{ 
                    backgroundColor: "#f8fafc", padding: "1.5rem", borderRadius: "16px", 
                    border: "1.5px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" 
                }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#475569", marginTop: 0, marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.025em" }}>
                        {editingNote ? "Update Existing Note" : "Compose New Clinical Note"}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", marginBottom: "0.5rem", color: "#64748b" }}>Note Category</label>
                                <select 
                                    name="type" 
                                    value={formData.type} 
                                    onChange={handleInputChange}
                                    disabled={!!editingNote}
                                    style={{ 
                                        width: "100%", padding: "0.75rem", borderRadius: "10px", 
                                        border: "1.5px solid #e2e8f0", fontWeight: "700", fontSize: "0.85rem",
                                        backgroundColor: editingNote ? "#f1f5f9" : "white"
                                    }}
                                >
                                    {NOTE_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", paddingTop: "1.5rem" }}>
                                <label style={{ 
                                    display: "flex", alignItems: "center", gap: "0.75rem", 
                                    fontSize: "0.85rem", fontWeight: "800", color: "#475569", cursor: "pointer",
                                    padding: "0.75rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                                    backgroundColor: formData.isConfidential ? "#fff1f2" : "white",
                                    transition: "all 0.2s ease",
                                    width: "100%"
                                }}>
                                    <input 
                                        type="checkbox" 
                                        name="isConfidential" 
                                        checked={formData.isConfidential} 
                                        onChange={handleInputChange}
                                        style={{ width: "18px", height: "18px", accentColor: "#ef4444" }}
                                    />
                                    <span style={{ color: formData.isConfidential ? "#e11d48" : "inherit" }}>
                                        <i className="fa-solid fa-eye-slash" style={{ marginRight: "0.4rem" }}></i>
                                        Mark as Confidential
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", marginBottom: "0.5rem", color: "#64748b" }}>Clinical Content / Observations</label>
                            <textarea 
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Enter detailed clinical findings, procedure steps, or incidents..."
                                required
                                style={{ 
                                    width: "100%", padding: "1rem", borderRadius: "12px", 
                                    border: "1.5px solid #e2e8f0", fontWeight: "600", fontSize: "0.9rem",
                                    minHeight: "120px", resize: "vertical", lineHeight: "1.5"
                                }}
                            ></textarea>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button 
                                type="submit" 
                                disabled={loading || !formData.content.trim()}
                                style={{ 
                                    flex: 2, padding: "0.9rem", backgroundColor: "var(--hospital-blue)", 
                                    color: "white", border: "none", borderRadius: "10px", 
                                    fontWeight: "900", cursor: "pointer", textTransform: "uppercase", 
                                    fontSize: "0.85rem", display: "flex", alignItems: "center", 
                                    justifyContent: "center", gap: "0.5rem",
                                    opacity: (loading || !formData.content.trim()) ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                ) : (
                                    <i className="fa-solid fa-floppy-disk"></i>
                                )}
                                {editingNote ? "Update Clinical Record" : "Commit Note to File"}
                            </button>
                            <button 
                                type="button"
                                onClick={resetForm}
                                style={{ 
                                    flex: 1, padding: "0.9rem", backgroundColor: "white", 
                                    color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: "10px", 
                                    fontWeight: "800", cursor: "pointer", fontSize: "0.85rem"
                                }}
                            >
                                Discard
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 📋 Notes Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {notes.length === 0 ? (
                    <div style={{ 
                        padding: "4rem 2rem", textAlign: "center", backgroundColor: "#f8fafc", 
                        borderRadius: "16px", border: "1.5px dashed #e2e8f0" 
                    }}>
                        <div style={{ marginBottom: "1rem" }}>
                            <i className="fa-solid fa-notes-medical" style={{ fontSize: "2.5rem", color: "#cbd5e1" }}></i>
                        </div>
                        <h4 style={{ margin: "0 0 0.5rem", color: "#64748b", fontWeight: "800" }}>No Clinical Notes Found</h4>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>Capture clinical observations and intra-operative findings for this procedure.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div 
                            key={note.id} 
                            style={{ 
                                backgroundColor: note.confidential ? "#fff1f2" : "white", 
                                borderRadius: "16px", border: `1.5px solid ${note.confidential ? "#fecdd3" : "#e2e8f0"}`, 
                                overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                                position: "relative"
                            }}
                        >
                            {/* Note Header */}
                            <div style={{ 
                                padding: "0.75rem 1.25rem", borderBottom: `1.5px solid ${note.confidential ? "#fecdd3" : "#f1f5f9"}`,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                backgroundColor: note.confidential ? "rgba(255,255,255,0.4)" : "#fcfdfe"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ 
                                        fontSize: "0.65rem", padding: "0.25rem 0.6rem", borderRadius: "6px", 
                                        backgroundColor: note.confidential ? "#e11d48" : "var(--hospital-blue)", 
                                        color: "white", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.05em" 
                                    }}>
                                        {NOTE_TYPES.find(t => t.value === note.type)?.label || note.type}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ fontWeight: "800", fontSize: "0.85rem", color: "#1e293b" }}>{note.authorName}</span>
                                        <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700" }}>• {note.authorRole}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>
                                        <i className="fa-regular fa-clock" style={{ marginRight: "0.4rem" }}></i>
                                        {formatDate(note.createdAt)}
                                    </span>
                                    {note.confidential && (
                                        <span style={{ 
                                            fontSize: "0.65rem", color: "#e11d48", fontWeight: "900", 
                                            display: "flex", alignItems: "center", gap: "0.3rem" 
                                        }}>
                                            <i className="fa-solid fa-lock" style={{ fontSize: "0.6rem" }}></i>
                                            CONFIDENTIAL
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Note Content */}
                            <div style={{ padding: "1.25rem", position: "relative" }}>
                                <p style={{ 
                                    margin: 0, fontSize: "0.95rem", color: "#334155", 
                                    lineHeight: "1.6", fontWeight: "500", whiteSpace: "pre-wrap" 
                                }}>
                                    {note.content}
                                </p>
                                
                                <div style={{ 
                                    marginTop: "1.25rem", display: "flex", gap: "0.75rem", 
                                    justifyContent: "flex-end", borderTop: `1px solid ${note.confidential ? "#fecdd3" : "#f1f5f9"}`,
                                    paddingTop: "0.75rem"
                                }}>
                                    <button 
                                        onClick={() => handleEdit(note)}
                                        style={actionBtnStyle("var(--hospital-blue)", "#3b82f6")}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(note.id)}
                                        style={actionBtnStyle("#ef4444", "#ef4444")}
                                    >
                                        <i className="fa-solid fa-trash-can"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const actionBtnStyle = (color, baseColor) => ({
    padding: "0.4rem 0.8rem", 
    fontSize: "0.75rem", 
    fontWeight: "800", 
    backgroundColor: "transparent", 
    color: baseColor, 
    border: "none", 
    borderRadius: "6px", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    gap: "0.4rem",
    transition: "all 0.2s"
});

export default NotesSection;
