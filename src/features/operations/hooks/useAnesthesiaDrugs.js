import { useState, useCallback } from "react";
import { anesthesiaDrugService } from "../services/anesthesiaDrugService";

export const useAnesthesiaDrugs = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addDrug = useCallback(async (opId, data) => {
        setLoading(true);
        try {
            const res = await anesthesiaDrugService.addDrug(opId, data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add drug");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getDrugs = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await anesthesiaDrugService.getDrugs(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch drugs");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateDrug = useCallback(async (opId, drugId, data) => {
        setLoading(true);
        try {
            const res = await anesthesiaDrugService.updateDrug(opId, drugId, data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update drug");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeDrug = useCallback(async (opId, drugId) => {
        setLoading(true);
        try {
            const res = await anesthesiaDrugService.removeDrug(opId, drugId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove drug");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getDrugSummary = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await anesthesiaDrugService.getDrugSummary(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch drug summary");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addDrug,
        getDrugs,
        updateDrug,
        removeDrug,
        getDrugSummary
    };
};
