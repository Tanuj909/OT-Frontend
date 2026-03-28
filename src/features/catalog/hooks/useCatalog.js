import { useState, useCallback } from "react";
import { catalogService } from "../services/catalogService";

export const useCatalog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCatalogItems = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await catalogService.getAll(params);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch catalog items");
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByType = useCallback(async (type) => {
    setLoading(true);
    try {
      const res = await catalogService.getByType(type);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch ${type} items`);
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchCatalogItems,
    fetchByType
  };
};
