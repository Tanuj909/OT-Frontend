import axiosInstance from "../../../api/axiosInstance";
import { WARD_ADMISSION_ENDPOINTS } from "../constants/wardAdmission.endpoints";

export const assignWardAdmissionApi = (data) => 
    axiosInstance.post(WARD_ADMISSION_ENDPOINTS.ASSIGN, data);

export const checkAdmissionStatusApi = (operationId) => 
    axiosInstance.get(WARD_ADMISSION_ENDPOINTS.CHECK_STATUS.replace(":operationId", operationId));

export const getActiveAdmissionApi = (operationId) => 
    axiosInstance.get(WARD_ADMISSION_ENDPOINTS.GET_ACTIVE.replace(":operationId", operationId));

export const dischargePatientApi = (operationId) => 
    axiosInstance.patch(WARD_ADMISSION_ENDPOINTS.DISCHARGE.replace(":operationId", operationId));

export const checkDischargeStatusApi = (operationId) => 
    axiosInstance.get(WARD_ADMISSION_ENDPOINTS.IS_DISCHARGED.replace(":operationId", operationId));


