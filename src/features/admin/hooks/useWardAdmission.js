import { useState, useCallback } from "react";
import { assignWardAdmissionApi, checkAdmissionStatusApi, getActiveAdmissionApi } from "../service/wardAdmission";

export const useWardAdmission = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkAdmissionStatus = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await checkAdmissionStatusApi(operationId);
            return { success: true, data: response.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch admission status.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const assignToWard = useCallback(async (assignmentData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await assignWardAdmissionApi(assignmentData);
            return { success: true, data: response.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to assign to ward.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveAdmission = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getActiveAdmissionApi(operationId);
            return { success: true, data: response.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch active admission.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        checkAdmissionStatus,
        assignToWard,
        fetchActiveAdmission
    };
};
