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

export const startSurgeryApi = (id) => 
    axiosInstance.patch(OPERATION_ENDPOINTS.START_SURGERY.replace(":id", id));

export const checkSurgeryStatusApi = (id) => 
    axiosInstance.get(OPERATION_ENDPOINTS.CHECK_STATUS.replace(":id", id));

export const getSurgeryReadinessApi = (id) => 
    axiosInstance.get(OPERATION_ENDPOINTS.GET_READINESS.replace(":id", id));

export const endSurgeryApi = (id, data) => 
    axiosInstance.patch(OPERATION_ENDPOINTS.END_SURGERY.replace(":id", id), data);

export const getOperationReportApi = (id) => 
    axiosInstance.get(OPERATION_ENDPOINTS.GET_REPORT.replace(":id", id));

export const shiftSurgeryRoomApi = (id, newRoomId) => 
    axiosInstance.put(`${OPERATION_ENDPOINTS.SHIFT_ROOM.replace(":id", id)}?newRoomId=${newRoomId}`);

export const readyForIpdTransferApi = (id) => 
    axiosInstance.post(OPERATION_ENDPOINTS.READY_FOR_IPD_TRANSFER.replace(":id", id));
