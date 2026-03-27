import axiosInstance from "../../../api/axiosInstance";
import { PREOP_ENDPOINTS } from "../constants/preop.endpoint";

export const getPreopApi = (opId) => 
    axiosInstance.get(PREOP_ENDPOINTS.BASE.replace(":operationId", opId));

export const createPreopApi = (opId, data) => 
    axiosInstance.post(PREOP_ENDPOINTS.BASE.replace(":operationId", opId), data);

export const updatePreopApi = (opId, data) => 
    axiosInstance.put(PREOP_ENDPOINTS.BASE.replace(":operationId", opId), data);

export const updatePreopStatusApi = (opId, data) => 
    axiosInstance.patch(PREOP_ENDPOINTS.UPDATE_STATUS.replace(":operationId", opId), data);
