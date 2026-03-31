import { useState, useCallback } from "react";
import { getMyOperationsApi } from "../services/staffOperationService";

export const useStaffOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [assignedOperations, setAssignedOperations] = useState([]);

    const fetchMyOperationsByStatus = useCallback(async (statuses) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyOperationsApi(statuses);
            setAssignedOperations(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to fetch assigned operations.`);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        assignedOperations,
        fetchMyOperationsByStatus
    };
};
