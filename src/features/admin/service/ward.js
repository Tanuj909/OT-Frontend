import axiosInstance from "../../../api/axiosInstance";
import { WARD_ENDPOINTS } from "../constants/ward.endpoints";

export const createWardApi = (data) => 
    axiosInstance.post(WARD_ENDPOINTS.CREATE, data);

export const getWardByIdApi = (id) => 
    axiosInstance.get(WARD_ENDPOINTS.GET_BY_ID.replace(":id", id));

export const getAllWardsApi = (params = {}) => {
    return axiosInstance.get(WARD_ENDPOINTS.GET_ALL, { params });
};

export const updateWardApi = (id, data) => 
    axiosInstance.put(WARD_ENDPOINTS.UPDATE.replace(":id", id), data);

export const deactivateWardApi = (id) => 
    axiosInstance.patch(WARD_ENDPOINTS.DEACTIVATE.replace(":id", id));

export const activateWardApi = (id) => 
    axiosInstance.patch(WARD_ENDPOINTS.ACTIVATE.replace(":id", id));
