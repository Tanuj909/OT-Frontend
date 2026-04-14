import { useState, useCallback } from "react";
import {
    createWardBedApi,
    getWardBedByIdApi,
    getWardBedsByRoomApi,
    updateWardBedApi
} from "../service/wardBed";

export const useWardBed = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [beds, setBeds] = useState([]);

    const fetchBedsByRoom = useCallback(async (roomId, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getWardBedsByRoomApi(roomId, filters);
            setBeds(response.data || response || []);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch ward beds.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBedById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getWardBedByIdApi(id);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch bed details.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const addWardBed = useCallback(async (bedData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createWardBedApi(bedData);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create ward bed.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const editWardBed = useCallback(async (id, bedData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateWardBedApi(id, bedData);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update ward bed.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        beds,
        setBeds,
        fetchBedsByRoom,
        fetchBedById,
        addWardBed,
        editWardBed
    };
};
