import { useState, useCallback } from "react";
import {
    assignStaffApi,
    getAssignedStaffApi,
    unassignStaffApi,
    getAvailableStaffApi
} from "../services/staffAssignmentService";

export const useStaffAssignment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAssignedStaff = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAssignedStaffApi(opId);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch assigned staff.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const assignStaffToOperation = useCallback(async (opId, staffList) => {
        setLoading(true);
        setError(null);
        try {
            const res = await assignStaffApi(opId, { staff: staffList });
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to assign staff.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const unassignStaffFromOperation = useCallback(async (opId, staffIds) => {
        setLoading(true);
        setError(null);
        try {
            const res = await unassignStaffApi(opId, staffIds);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to unassign staff.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableStaff = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAvailableStaffApi();
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch available staff.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);



    return {
        loading,
        error,
        fetchAssignedStaff,
        assignStaffToOperation,
        unassignStaffFromOperation,
        fetchAvailableStaff
    };
};
