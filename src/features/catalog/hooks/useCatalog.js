import { useState, useCallback } from "react";
import { catalogService } from "../services/catalogService";

export const useCatalog = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);

    const fetchAllItems = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.getAll(params);
            const data = res.data?.data || res.data || [];
            setItems(data);
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to fetch catalog items";
            setError(message);
            setItems([]);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByType = useCallback(async (type) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.getByType(type);
            const data = res.data?.data || res.data || [];
            return { success: true, data };
        } catch (err) {
            const message = err.response?.data?.message || `Failed to fetch ${type} items`;
            setError(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const addItem = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.create(formData);
            return { success: true, data: res.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add item to catalog";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const editItem = useCallback(async (id, formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.update(id, formData);
            return { success: true, data: res.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update item";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleItemStatus = useCallback(async (id, currentStatus) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.toggleStatus(id, currentStatus);
            return { success: true, data: res.data };
        } catch (err) {
            const message = err.response?.data?.message || "Status update failed";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeItem = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogService.delete(id);
            setItems(prev => prev.filter(item => item.id !== id));
            return { success: true, data: res.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to delete item";
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        items,
        fetchAllItems,
        fetchCatalogItems: fetchAllItems,
        fetchByType,
        addItem,
        editItem,
        toggleItemStatus,
        removeItem
    };
};
