import { useState, useCallback } from "react";
import {
    createPriceApi,
    getPriceByIdApi,
    getPriceByCatalogItemIdApi,
    getAllPricesApi,
    updatePriceApi,
    deactivatePriceApi,
    activatePriceApi
} from "../../service/catalogPrice/catalogPrice.service";

export const useCatalogPrice = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState([]);
    const [selectedPrice, setSelectedPrice] = useState(null);

    const fetchAllPrices = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllPricesApi(filters);
            setPrices(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch prices.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPriceById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPriceByIdApi(id);
            const priceData = res.data?.data || res.data;
            setSelectedPrice(priceData);
            return { success: true, data: priceData };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch price details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPriceByCatalogItemId = useCallback(async (catalogItemId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPriceByCatalogItemIdApi(catalogItemId);
            const priceData = res.data?.data || res.data;
            setSelectedPrice(priceData);
            return { success: true, data: priceData };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch price for catalog item.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addPrice = useCallback(async (priceData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createPriceApi(priceData);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create price entry.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const editPrice = useCallback(async (id, priceData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updatePriceApi(id, priceData);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update price.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const togglePriceStatus = useCallback(async (id, currentStatus) => {
        setLoading(true);
        setError(null);
        try {
            if (currentStatus) {
                await deactivatePriceApi(id);
            } else {
                await activatePriceApi(id);
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

    return {
        loading,
        error,
        prices,
        selectedPrice,
        fetchAllPrices,
        fetchPriceById,
        fetchPriceByCatalogItemId,
        addPrice,
        editPrice,
        togglePriceStatus
    };
};
