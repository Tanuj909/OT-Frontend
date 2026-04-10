import axiosInstance from "../../../api/axiosInstance";
import { WARD_ROOM_ENDPOINTS } from "../constants/wardRoom.endpoints";

export const createWardRoomApi = (data) => 
    axiosInstance.post(WARD_ROOM_ENDPOINTS.CREATE, data);

export const getWardRoomsByWardApi = (wardId, params = {}) => 
    axiosInstance.get(WARD_ROOM_ENDPOINTS.GET_BY_WARD.replace(":wardId", wardId), { params });

export const getAvailableRoomsByWardApi = (wardId) => 
    axiosInstance.get(WARD_ROOM_ENDPOINTS.GET_AVAILABLE_BY_WARD.replace(":wardId", wardId));

export const updateWardRoomApi = (id, data) => 
    axiosInstance.put(WARD_ROOM_ENDPOINTS.UPDATE.replace(":id", id), data);

export const deactivateWardRoomApi = (id) => 
    axiosInstance.patch(WARD_ROOM_ENDPOINTS.DEACTIVATE.replace(":id", id));
