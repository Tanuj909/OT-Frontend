import axiosInstance from "../../../api/axiosInstance";
import { OT_FEATURE_ENDPOINTS } from "../constants/otFeature.endpoints";

export const getAllFeaturesApi = () => 
    axiosInstance.get(OT_FEATURE_ENDPOINTS.BASE);

export const getActiveFeaturesApi = () => 
    axiosInstance.get(OT_FEATURE_ENDPOINTS.ACTIVE);

export const createFeatureApi = (data) => 
    axiosInstance.post(OT_FEATURE_ENDPOINTS.BASE, data);

export const bulkCreateFeaturesApi = (data) => 
    axiosInstance.post(OT_FEATURE_ENDPOINTS.BULK, data);

export const updateFeatureApi = (id, data) => 
    axiosInstance.put(OT_FEATURE_ENDPOINTS.ITEM(id), data);

export const deleteFeatureApi = (id) => 
    axiosInstance.delete(OT_FEATURE_ENDPOINTS.DELETE_FEATURE(id));

export const toggleFeatureStatusApi = (id) => 
    axiosInstance.patch(OT_FEATURE_ENDPOINTS.TOGGLE(id));

export const getRoomFeaturesApi = (roomId) => 
    axiosInstance.get(OT_FEATURE_ENDPOINTS.ROOM_FEATURES(roomId));

export const mapFeaturesToRoomApi = (roomId, featureIds) => 
    axiosInstance.post(OT_FEATURE_ENDPOINTS.ROOM_FEATURES(roomId), { featureIds });

export const unmapFeaturesFromRoomApi = (roomId, featureIds) => 
    axiosInstance.delete(OT_FEATURE_ENDPOINTS.ROOM_FEATURES(roomId), { data: { featureIds } });
