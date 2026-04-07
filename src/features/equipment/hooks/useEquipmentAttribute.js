import { useState, useCallback } from "react";
import {
    createAttributeApi,
    getAllAttributesApi,
    updateAttributeApi,
    deleteAttributeApi
} from "../services/equipmentAttribute";

export const useEquipmentAttribute = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attributes, setAttributes] = useState([]);

    const fetchAttributes = useCallback(async (equipmentId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllAttributesApi(equipmentId);
            setAttributes(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch fixed assets attributes.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addAttribute = useCallback(async (equipmentId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createAttributeApi(equipmentId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create attribute record.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const editAttribute = useCallback(async (equipmentId, attributeId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateAttributeApi(equipmentId, attributeId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update attribute.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeAttribute = useCallback(async (equipmentId, attributeId) => {
        setLoading(true);
        setError(null);
        try {
            await deleteAttributeApi(equipmentId, attributeId);
            setAttributes(prev => prev.filter(a => a.id !== attributeId));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete attribute.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        attributes,
        fetchAttributes,
        addAttribute,
        editAttribute,
        removeAttribute
    };
};
