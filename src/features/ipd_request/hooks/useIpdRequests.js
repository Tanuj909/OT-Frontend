import { useState, useCallback } from "react";
import { createOtRequestApi } from "../service/ipdRequestService";

export const useIpdRequests = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createOtRequest = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createOtRequestApi(data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create OT request.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createOtRequest
    };
};
