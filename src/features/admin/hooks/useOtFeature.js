import { useState, useCallback } from "react";
import {
    getAllFeaturesApi,
    createFeatureApi,
    bulkCreateFeaturesApi,
    updateFeatureApi,
    deleteFeatureApi,
    toggleFeatureStatusApi,
    getRoomFeaturesApi,
    getActiveFeaturesApi,
    mapFeaturesToRoomApi,
    unmapFeaturesFromRoomApi
} from "../services/otFeatureService";

export const useOtFeature = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [features, setFeatures] = useState([]);
    const [activeFeatures, setActiveFeatures] = useState([]);
    const [roomFeatures, setRoomFeatures] = useState([]);

    const fetchAllFeatures = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllFeaturesApi();
            setFeatures(res.data?.data || res.data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveFeatures = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getActiveFeaturesApi();
            setActiveFeatures(res.data?.data || res.data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch active features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const addFeature = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createFeatureApi(data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add feature.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const bulkAddFeatures = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await bulkCreateFeaturesApi(data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to bulk add features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const editFeature = useCallback(async (id, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateFeatureApi(id, data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update feature.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeFeature = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await deleteFeatureApi(id);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete feature.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleFeatureStatus = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await toggleFeatureStatusApi(id);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to toggle feature status.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoomFeatures = useCallback(async (roomId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getRoomFeaturesApi(roomId);
            setRoomFeatures(res.data?.data || res.data);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch room features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const mapToRoom = useCallback(async (roomId, featureIds) => {
        setLoading(true);
        setError(null);
        try {
            const res = await mapFeaturesToRoomApi(roomId, featureIds);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to map features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const unmapFromRoom = useCallback(async (roomId, featureIds) => {
        setLoading(true);
        setError(null);
        try {
            const res = await unmapFeaturesFromRoomApi(roomId, featureIds);
            return { success: true, data: res.data };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to unmap features.";
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        features,
        activeFeatures,
        roomFeatures,
        fetchAllFeatures,
        fetchActiveFeatures,
        addFeature,
        bulkAddFeatures,
        editFeature,
        removeFeature,
        toggleFeatureStatus,
        fetchRoomFeatures,
        mapToRoom,
        unmapFromRoom
    };
};
