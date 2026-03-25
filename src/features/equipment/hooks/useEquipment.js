import { useState, useCallback } from "react";
import {
    addEquipmentApi,
    getEquipmentByIdApi,
    getAllEquipmentApi,
    updateEquipmentApi,
    updateEquipmentStatusApi,
    deleteEquipmentApi
} from "../serivces/equipment";

export const useEquipment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const fetchAllEquipment = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllEquipmentApi();
            setEquipmentList(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch equipment list.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEquipmentById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getEquipmentByIdApi(id);
            const data = res.data?.data || res.data;
            setSelectedEquipment(data);
            return { success: true, data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch equipment details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addEquipment = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await addEquipmentApi(data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add equipment.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const editEquipment = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateEquipmentApi(id, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update equipment.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (id, status) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateEquipmentStatusApi(id, status);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeEquipment = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteEquipmentApi(id);
            setEquipmentList(prev => prev.filter(e => e.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete equipment.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        equipmentList,
        selectedEquipment,
        fetchAllEquipment,
        fetchEquipmentById,
        addEquipment,
        editEquipment,
        updateStatus,
        removeEquipment
    };
};
