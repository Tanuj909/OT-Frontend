import { useState, useCallback } from "react";
import {
    createIntraOpApi,
    getIntraOpApi,
    updateIntraOpApi,
    updateIntraOpStatusApi,
    updateAnesthesiaTimeApi,
    getIntraOpSummaryApi
} from "../services/intraopService";

export const useIntraOp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createIntraOp = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createIntraOpApi(opId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create intra-op record.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchIntraOp = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getIntraOpApi(opId);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch intra-op record.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateIntraOp = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateIntraOpApi(opId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update intra-op record.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateIntraOpStatus = useCallback(async (opId, statusData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateIntraOpStatusApi(opId, statusData);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update intra-op status.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAnesthesiaTime = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateAnesthesiaTimeApi(opId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update anesthesia time.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchIntraOpSummary = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getIntraOpSummaryApi(opId);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch intra-op summary.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createIntraOp,
        fetchIntraOp,
        updateIntraOp,
        updateIntraOpStatus,
        updateAnesthesiaTime,
        fetchIntraOpSummary
    };
};
