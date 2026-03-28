import axiosInstance from "../../../api/axiosInstance";
import { INTRAOP_ENDPOINTS } from "../constants/intraop.endpoint";

export const createIntraOpApi = (opId, data) => 
    axiosInstance.post(INTRAOP_ENDPOINTS.CREATE.replace(":operationId", opId), data);

export const getIntraOpApi = (opId) => 
    axiosInstance.get(INTRAOP_ENDPOINTS.GET.replace(":operationId", opId));

export const updateIntraOpApi = (opId, data) => 
    axiosInstance.put(INTRAOP_ENDPOINTS.UPDATE.replace(":operationId", opId), data);

export const updateIntraOpStatusApi = (opId, data) => 
    axiosInstance.patch(INTRAOP_ENDPOINTS.UPDATE_STATUS.replace(":operationId", opId), data);

export const updateAnesthesiaTimeApi = (opId, data) => 
    axiosInstance.patch(INTRAOP_ENDPOINTS.UPDATE_ANESTHESIA_TIME.replace(":operationId", opId), data);

export const getIntraOpSummaryApi = (opId) => 
    axiosInstance.get(INTRAOP_ENDPOINTS.SUMMARY.replace(":operationId", opId));
