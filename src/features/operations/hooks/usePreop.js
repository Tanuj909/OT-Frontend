import { useState, useCallback } from "react";
import {
    getPreopApi,
    createPreopApi,
    updatePreopApi,
    updatePreopStatusApi
} from "../services/preopService";

export const usePreop = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPreop = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPreopApi(opId);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch pre-op assessment.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const savePreop = useCallback(async (opId, data, isUpdate = false) => {
        setLoading(true);
        setError(null);
        try {
            const res = isUpdate 
                ? await updatePreopApi(opId, data) 
                : await createPreopApi(opId, data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to save pre-op assessment.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreopStatus = useCallback(async (opId, statusData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updatePreopStatusApi(opId, statusData);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update pre-op status.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchPreop,
        savePreop,
        updatePreopStatus
    };
};
