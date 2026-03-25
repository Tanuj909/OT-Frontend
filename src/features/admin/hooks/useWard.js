import { useState, useCallback } from "react";
import {
    createWardApi,
    getAllWardsApi,
    getWardByIdApi,
    updateWardApi,
    deactivateWardApi,
    activateWardApi
} from "../service/ward";

export const useWard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);

    const fetchAllWards = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAllWardsApi(filters);
            setWards(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch wards.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWardById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getWardByIdApi(id);
            const wardData = response.data || response;
            setSelectedWard(wardData);
            return { success: true, data: wardData };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch ward details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addWard = useCallback(async (wardData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createWardApi(wardData);
            return { success: true, data: response.data || response };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create ward.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const editWard = useCallback(async (id, wardData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateWardApi(id, wardData);
            return { success: true, data: response.data || response };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update ward.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleWardStatus = useCallback(async (id, currentStatus) => {
        setLoading(true);
        setError(null);
        try {
            if (currentStatus) {
                await deactivateWardApi(id);
            } else {
                await activateWardApi(id);
            }
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Operation failed.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        wards,
        selectedWard,
        fetchAllWards,
        fetchWardById,
        addWard,
        editWard,
        toggleWardStatus
    };
};
