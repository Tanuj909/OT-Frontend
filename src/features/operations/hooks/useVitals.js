import { useState, useCallback } from "react";
import { vitalsService } from "../services/vitalsService";

export const useVitals = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createVitals = useCallback(async (opId, data) => {
        setLoading(true);
        try {
            const res = await vitalsService.createVitals(opId, data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record vitals");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllVitals = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await vitalsService.getAllVitals(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch vitals");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getLatestVitals = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await vitalsService.getLatestVitals(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch latest vitals");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteVitals = useCallback(async (opId, vitalId) => {
        setLoading(true);
        try {
            const res = await vitalsService.deleteVitals(opId, vitalId);
            return { success: true, message: res.data?.message || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete vitals");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createVitals,
        getAllVitals,
        getLatestVitals,
        deleteVitals
    };
};
