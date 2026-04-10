import { useState, useCallback } from "react";
import {
    createWardRoomApi,
    getWardRoomsByWardApi,
    getAvailableRoomsByWardApi,
    updateWardRoomApi,
    deactivateWardRoomApi
} from "../service/wardRoom";

export const useWardRoom = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rooms, setRooms] = useState([]);

    const fetchRoomsByWard = useCallback(async (wardId, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getWardRoomsByWardApi(wardId, filters);
            setRooms(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch ward rooms.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableRoomsByWard = useCallback(async (wardId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAvailableRoomsByWardApi(wardId);
            return { success: true, data: response.data || response };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch available rooms.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addWardRoom = useCallback(async (roomData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createWardRoomApi(roomData);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create ward room.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const editWardRoom = useCallback(async (id, roomData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateWardRoomApi(id, roomData);
            return { success: true, data: response.data || response };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update ward room.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateRoom = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deactivateWardRoomApi(id);
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to deactivate room.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        rooms,
        setRooms,
        fetchRoomsByWard,
        fetchAvailableRoomsByWard,
        addWardRoom,
        editWardRoom,
        deactivateRoom
    };
};
