import { useState, useCallback } from "react";
import { implantService } from "../services/implantService";

export const useImplants = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addImplantUsage = useCallback(async (opId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await implantService.addImplant(opId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add implant";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsedImplants = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await implantService.getUsedImplants(opId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch implants";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateImplantUsage = useCallback(async (opId, implantId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await implantService.updateImplant(opId, implantId, data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update implant usage";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeImplantUsage = useCallback(async (opId, implantId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await implantService.removeImplant(opId, implantId);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Failed to remove implant";
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addImplantUsage,
        fetchUsedImplants,
        updateImplantUsage,
        removeImplantUsage
    };
};
