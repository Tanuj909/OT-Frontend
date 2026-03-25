import { useState, useCallback } from "react";
import {
    createStaffApi,
    updateStaffApi,
    getSingleStaffApi,
    getAllStaffApi,
    deactivateStaffApi,
    activateStaffApi
} from "../service/staffService";

export const useStaff = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const fetchAllStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllStaffApi();
            setStaffList(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch staff list.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaffById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSingleStaffApi(id);
            const staff = res.data?.data || res.data;
            setSelectedStaff(staff);
            return { success: true, data: staff };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch staff details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const createStaff = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createStaffApi(data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create staff.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStaff = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateStaffApi(id, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update staff.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleStaffStatus = useCallback(async (id, currentStatus) => {
        setLoading(true);
        setError(null);
        try {
            if (currentStatus) {
                await deactivateStaffApi(id);
            } else {
                await activateStaffApi(id);
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
        staffList,
        selectedStaff,
        fetchAllStaff,
        fetchStaffById,
        createStaff,
        updateStaff,
        toggleStaffStatus
    };
};
