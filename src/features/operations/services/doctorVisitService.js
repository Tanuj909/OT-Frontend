import axiosInstance from "../../../api/axiosInstance";
import { DOCTOR_VISIT_ENDPOINTS } from "../constants/doctorVisit.endpoint";

export const doctorVisitService = {
    createVisit: (data) => 
        axiosInstance.post(DOCTOR_VISIT_ENDPOINTS.CREATE, data),
    
    updateVisit: (visitId, data) => 
        axiosInstance.put(DOCTOR_VISIT_ENDPOINTS.UPDATE.replace(":visitId", visitId), data),
    
    cancelVisit: (visitId) => 
        axiosInstance.put(DOCTOR_VISIT_ENDPOINTS.CANCEL.replace(":visitId", visitId)),
    
    completeVisit: (visitId) => 
        axiosInstance.put(DOCTOR_VISIT_ENDPOINTS.COMPLETE.replace(":visitId", visitId)),
    
    getByAdmission: (admissionId) => 
        axiosInstance.get(DOCTOR_VISIT_ENDPOINTS.GET_BY_ADMISSION.replace(":admissionId", admissionId)),
    
    getLatestByOperation: (operationId) => 
        axiosInstance.get(DOCTOR_VISIT_ENDPOINTS.GET_LATEST_BY_OPERATION.replace(":operationId", operationId)),
    
    getByStatus: (operationId, status) => 
        axiosInstance.get(`${DOCTOR_VISIT_ENDPOINTS.GET_BY_STATUS.replace(":operationId", operationId)}?status=${status}`),
    
    checkDischargeRecommendation: (operationId) => 
        axiosInstance.get(DOCTOR_VISIT_ENDPOINTS.CHECK_DISCHARGE.replace(":operationId", operationId))
};
