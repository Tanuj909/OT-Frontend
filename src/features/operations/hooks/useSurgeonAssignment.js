import { useState, useCallback } from "react";
import {
    assignSurgeonsApi,
    getAssignedSurgeonsApi,
    unassignSurgeonsApi,
    getAvailableSurgeonsApi
} from "../services/surgeonAssignmentService";

export const useSurgeonAssignment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAssignedSurgeons = useCallback(async (opId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAssignedSurgeonsApi(opId);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch assigned surgeons.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const assignSurgeonsToOperation = useCallback(async (opId, surgeonList) => {
        setLoading(true);
        setError(null);
        try {
            const res = await assignSurgeonsApi(opId, { surgeon: surgeonList });
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to assign surgeons.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const unassignSurgeonsFromOperation = useCallback(async (opId, surgeonIds) => {
        setLoading(true);
        setError(null);
        try {
            const res = await unassignSurgeonsApi(opId, surgeonIds);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to unassign surgeons.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableSurgeons = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAvailableSurgeonsApi();
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch available surgeons.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchAssignedSurgeons,
        assignSurgeonsToOperation,
        unassignSurgeonsFromOperation,
        fetchAvailableSurgeons
    };
};
