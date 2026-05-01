import { useState, useCallback } from "react";
import { 
    createOTApi, 
    getAllOTsApi, 
    getOTByIdApi, 
    updateOTApi, 
    deleteOTApi,
    getActiveOTsApi,
    updateOTStatusApi
} from "../service/adminApi";

export const useAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [ots, setOts] = useState([]);
    const [activeOts, setActiveOts] = useState([]);
    const [selectedOT, setSelectedOT] = useState(null);

    // ─── Operation Theater Hooks ──────────────────────────────────────────
    const fetchOTs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAllOTsApi();
            setOts(response.data || response || []); // Added fallback for raw array responses
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch operation theaters.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveOTs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getActiveOTsApi();
            setActiveOts(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch active operation theaters.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOTById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getOTByIdApi(id);
            const ot = response.data || response;
            setSelectedOT(ot);
            return { success: true, data: ot };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch operation theater details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addOT = useCallback(async (otData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createOTApi(otData);
            const newOT = response.data || response;
            setOts((prev) => [...prev, newOT]);
            return { success: true, message: response.message || "OT created successfully", data: newOT };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create operation theater.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const editOT = useCallback(async (id, otData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateOTApi(id, otData);
            const updatedOT = response.data || response;
            setOts((prev) => prev.map((ot) => (ot.id === id ? updatedOT : ot)));
            return { success: true, message: response.message || "OT updated successfully", data: updatedOT };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update operation theater.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeOT = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteOTApi(id);
            setOts((prev) => prev.filter((ot) => ot.id !== id));
            return { success: true, message: "OT deleted successfully" };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete operation theater.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOTStatus = useCallback(async (id, status) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateOTStatusApi(id, status);
            const updatedOT = response.data || response;
            setOts((prev) => prev.map((ot) => (ot.id === id ? { ...ot, status: updatedOT.status || status } : ot)));
            return { success: true, message: response.message || "OT status updated successfully" };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update OT status.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        loading,
        error,
        ots,
        activeOts,
        selectedOT,
        fetchOTs,
        fetchActiveOTs,
        fetchOTById,
        addOT,
        editOT,
        removeOT,
        updateOTStatus,
    };
};
