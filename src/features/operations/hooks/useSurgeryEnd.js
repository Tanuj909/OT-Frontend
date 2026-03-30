import { useState, useCallback } from "react";
import { getSurgeryReadinessApi, endSurgeryApi } from "../services/operationService";

export const useSurgeryEnd = () => {
    const [loading, setLoading] = useState(false);
    const [readiness, setReadiness] = useState(null);
    const [error, setError] = useState(null);

    const fetchReadiness = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSurgeryReadinessApi(operationId);
            const data = res.data?.data || res.data;
            setReadiness(data);
            return { success: true, data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch surgery readiness.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const endSurgery = useCallback(async (operationId, endData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await endSurgeryApi(operationId, endData);
            return { success: true, data: res.data?.data || res.data, message: res.data?.message };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to end surgery.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        readiness,
        error,
        fetchReadiness,
        endSurgery
    };
};
