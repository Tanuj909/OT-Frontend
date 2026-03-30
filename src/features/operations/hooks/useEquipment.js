import { useState, useCallback } from "react";
import { equipmentService } from "../services/equipmentService";

export const useEquipment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addEquipmentUsage = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await equipmentService.addEquipment(opId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add equipment";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsedEquipment = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await equipmentService.getUsedEquipment(opId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch equipment";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateEquipmentUsage = useCallback(async (opId, usageId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await equipmentService.updateUsageDetails(opId, usageId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update equipment usage details";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeEquipment = useCallback(async (opId, usageId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await equipmentService.removeEquipment(opId, usageId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to remove equipment";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addEquipmentUsage,
        fetchUsedEquipment,
        updateEquipmentUsage,
        removeEquipment
    };
};
