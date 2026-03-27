import { useState, useCallback } from "react";
import {
    createRoomPricingApi,
    getRoomPricingByRoomApi,
    updateRoomPricingByRoomApi
} from "../service/otRoomPricing";

export const useOtRoomPricing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pricing, setPricing] = useState(null);

    const fetchPricing = useCallback(async (roomId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getRoomPricingByRoomApi(roomId);
            const data = res.data?.data || res.data;
            setPricing(data);
            return { success: true, data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch room pricing.";
            setError(msg);
            setPricing(null);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const addPricing = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createRoomPricingApi(data);
            const newData = res.data?.data || res.data;
            setPricing(newData);
            return { success: true, data: newData };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to initialize pricing.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePricing = useCallback(async (roomId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateRoomPricingByRoomApi(roomId, data);
            const updatedData = res.data?.data || res.data;
            setPricing(updatedData);
            return { success: true, data: updatedData };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update pricing.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        pricing,
        fetchPricing,
        addPricing,
        updatePricing
    };
};
