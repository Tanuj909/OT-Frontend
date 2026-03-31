import { useState, useCallback } from "react";
import {
    getRequestedOperationsApi,
    getAllOperationsApi,
    getOperationsByStatusApi,
    scheduleOperationApi,
    startSurgeryApi,
    checkSurgeryStatusApi,
    getSurgeryReadinessApi,
    getOperationReportApi
} from "../services/operationService";

export const useOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operations, setOperations] = useState([]);

    const fetchRequestedOperations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getRequestedOperationsApi();
            setOperations(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch requested surgeries.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllOperations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllOperationsApi();
            setOperations(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch all surgeries.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOperationsByStatus = useCallback(async (status) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOperationsByStatusApi(status);
            setOperations(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to fetch operations with status: ${status}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const scheduleOperation = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await scheduleOperationApi(id, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to schedule surgery.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const startSurgery = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await startSurgeryApi(id);
            return { success: true, data: res.data?.data || res.data, message: res.data?.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to start surgery.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const checkSurgeryStatus = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await checkSurgeryStatusApi(id);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to check surgery status.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSurgeryReadiness = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getSurgeryReadinessApi(id);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch surgical readiness.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOperationReport = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getOperationReportApi(id);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch operation report.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        operations,
        fetchRequestedOperations,
        fetchAllOperations,
        fetchOperationsByStatus,
        scheduleOperation,
        startSurgery,
        checkSurgeryStatus,
        fetchSurgeryReadiness,
        fetchOperationReport
    };
};
