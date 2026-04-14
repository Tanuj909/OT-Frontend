import axiosInstance from "../../../api/axiosInstance";
import { WARD_BED_ENDPOINTS } from "../constants/wardBed.endpoints";

export const createWardBedApi = (data) => 
    axiosInstance.post(WARD_BED_ENDPOINTS.CREATE, data);

export const getWardBedByIdApi = (id) => 
    axiosInstance.get(WARD_BED_ENDPOINTS.GET_BY_ID.replace(":id", id));

export const getWardBedsByRoomApi = (roomId, params = {}) => 
    axiosInstance.get(WARD_BED_ENDPOINTS.GET_BY_ROOM.replace(":roomId", roomId), { params });

export const updateWardBedApi = (id, data) => 
    axiosInstance.put(WARD_BED_ENDPOINTS.UPDATE.replace(":id", id), data);
