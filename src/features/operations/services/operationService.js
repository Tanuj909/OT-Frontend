import axiosInstance from "../../../api/axiosInstance";
import { OPERATION_ENDPOINTS } from "../constants/operation.endpoints";

export const getRequestedOperationsApi = () => 
    axiosInstance.get(OPERATION_ENDPOINTS.GET_REQUESTED);

export const getAllOperationsApi = () => 
    axiosInstance.get(OPERATION_ENDPOINTS.GET_ALL);

export const getOperationsByStatusApi = (status) => 
    axiosInstance.get(OPERATION_ENDPOINTS.GET_BY_STATUS.replace(":status", status));

export const scheduleOperationApi = (id, data) => 
    axiosInstance.post(OPERATION_ENDPOINTS.SCHEDULE.replace(":id", id), data);
