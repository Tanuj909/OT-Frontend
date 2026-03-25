import { useState, useCallback } from "react";
import {
    createItemApi,
    getAllItemsApi,
    getItemByIdApi,
    searchItemsApi,
    updateItemApi,
    deactivateItemApi,
    activateItemApi,
    deleteItemApi,
    getItemsByTypeApi
} from "../service/catalog";

export const useCatalog = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchAllItems = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllItemsApi(filters);
            setItems(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch catalog items.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchItemById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getItemByIdApi(id);
            const itemData = res.data?.data || res.data;
            setSelectedItem(itemData);
            return { success: true, data: itemData };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch item details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const searchCatalog = useCallback(async (keyword) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchItemsApi(keyword);
            const results = res.data?.data || res.data || [];
            setItems(results);
            return { success: true, data: results };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to search catalog.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addItem = useCallback(async (itemData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createItemApi(itemData);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create item.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const editItem = useCallback(async (id, itemData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateItemApi(id, itemData);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update item.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleItemStatus = useCallback(async (id, currentStatus) => {
        setLoading(true);
        setError(null);
        try {
            if (currentStatus) {
                await deactivateItemApi(id);
            } else {
                await activateItemApi(id);
            }
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || "Operation failed.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeItem = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteItemApi(id);
            setItems(prev => prev.filter(i => i.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete item.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        items,
        selectedItem,
        fetchAllItems,
        fetchItemById,
        searchCatalog,
        addItem,
        editItem,
        toggleItemStatus,
        removeItem
    };
};
