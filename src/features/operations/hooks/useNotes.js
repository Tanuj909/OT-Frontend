import { useState, useCallback } from "react";
import { noteService } from "../services/noteService";

export const useNotes = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addNote = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await noteService.addNote(opId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add note";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getNotes = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await noteService.getNotes(opId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch notes";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateNote = useCallback(async (opId, noteId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await noteService.updateNote(opId, noteId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update note";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteNote = useCallback(async (opId, noteId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await noteService.deleteNote(opId, noteId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete note";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addNote,
        getNotes,
        updateNote,
        deleteNote
    };
};
