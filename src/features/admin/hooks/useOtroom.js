import { useState, useCallback } from "react";
import {
    createRoomApi,
    getAllRoomsApi,
    getRoomByIdApi,
    getRoomsByTheaterApi,
    updateRoomApi,
    updateRoomStatusApi,
    getAvailableRoomsApi,
    enableRoomApi,
    disableRoomApi,
    deleteRoomApi
} from "../service/otRoom";

export const useOtRoom = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const fetchAllRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAllRoomsApi();
            setRooms(response.data || response || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch all rooms.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoomById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getRoomByIdApi(id);
            const roomData = response.data || response;
            setSelectedRoom(roomData);
            return { success: true, data: roomData };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch room details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoomsByTheater = useCallback(async (theaterId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getRoomsByTheaterApi(theaterId);
            const roomList = response.data || response || [];
            setRooms(roomList);
            return { success: true, data: roomList };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch rooms by theater.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addRoom = useCallback(async (roomData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createRoomApi(roomData);
            const newRoom = response.data || response;
            setRooms((prev) => [...prev, newRoom]);
            return { success: true, data: newRoom };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create OT room.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const editRoom = useCallback(async (id, roomData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateRoomApi(id, roomData);
            const updatedRoom = response.data || response;
            setRooms((prev) => prev.map((r) => (r.id === id ? updatedRoom : r)));
            return { success: true, data: updatedRoom };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update OT room.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRoomStatus = useCallback(async (id, statusData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateRoomStatusApi(id, statusData);
            const updatedRoom = response.data || response;
            setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: updatedRoom.status } : r)));
            return { success: true, data: updatedRoom };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update room status.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAvailableRoomsApi();
            return { success: true, data: response.data || response || [] };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch available rooms.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const enableRoom = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await enableRoomApi(id);
            setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: true } : r)));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to enable room.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const disableRoom = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await disableRoomApi(id);
            setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: false } : r)));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to disable room.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeRoom = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteRoomApi(id);
            setRooms((prev) => prev.filter((r) => r.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete room.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        rooms,
        selectedRoom,
        fetchAllRooms,
        fetchRoomById,
        fetchRoomsByTheater,
        addRoom,
        editRoom,
        updateRoomStatus,
        fetchAvailableRooms,
        enableRoom,
        disableRoom,
        removeRoom
    };
};
