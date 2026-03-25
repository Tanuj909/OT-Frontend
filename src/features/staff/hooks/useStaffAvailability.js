import { useState, useCallback } from "react";
import {
    createStaffAvailabilityApi,
    getStaffAvailabilityApi,
    checkStaffAvailabilityApi,
    deleteStaffAvailabilityApi
} from "../service/staffService";

export const useStaffAvailability = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);

    const fetchAvailabilities = useCallback(async (staffId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStaffAvailabilityApi(staffId);
            setAvailabilities(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch availability.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addAvailability = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createStaffAvailabilityApi(data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record availability.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAvailabilityStatus = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await checkStaffAvailabilityApi(params);
            return { success: true, isAvailable: res.data?.data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeAvailability = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteStaffAvailabilityApi(id);
            setAvailabilities(prev => prev.filter(a => a.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete availability record.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        availabilities,
        fetchAvailabilities,
        addAvailability,
        checkAvailabilityStatus,
        removeAvailability
    };
};
