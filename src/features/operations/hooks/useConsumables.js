import { useState, useCallback } from "react";
import { consumableService } from "../services/consumableService";

export const useConsumables = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addConsumable = useCallback(async (opId, data) => {
        setLoading(true);
        try {
            const res = await consumableService.addConsumable(opId, data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add consumable");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getConsumables = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await consumableService.getConsumables(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch consumables");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConsumable = useCallback(async (opId, consumableId, data) => {
        setLoading(true);
        try {
            const res = await consumableService.updateConsumable(opId, consumableId, data);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update consumable");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const returnConsumable = useCallback(async (opId, consumableId) => {
        setLoading(true);
        try {
            const res = await consumableService.returnConsumable(opId, consumableId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to return consumable");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteConsumable = useCallback(async (opId, consumableId) => {
        setLoading(true);
        try {
            const res = await consumableService.deleteConsumable(opId, consumableId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete consumable");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const getConsumableSummary = useCallback(async (opId) => {
        setLoading(true);
        try {
            const res = await consumableService.getConsumableSummary(opId);
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch consumable summary");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addConsumable,
        getConsumables,
        updateConsumable,
        returnConsumable,
        deleteConsumable,
        getConsumableSummary
    };
};
