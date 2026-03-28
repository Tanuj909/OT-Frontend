import axiosInstance from "../../../api/axiosInstance";
import { VITALS_ENDPOINTS } from "../constants/vitals.endpoint";

export const vitalsService = {
    createVitals: (opId, data) => 
        axiosInstance.post(VITALS_ENDPOINTS.CREATE.replace(":operationId", opId), data),
    
    getAllVitals: (opId) => 
        axiosInstance.get(VITALS_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    getLatestVitals: (opId) => 
        axiosInstance.get(VITALS_ENDPOINTS.GET_LATEST.replace(":operationId", opId)),
    
    deleteVitals: (opId, vitalId) => 
        axiosInstance.delete(VITALS_ENDPOINTS.DELETE.replace(":operationId", opId).replace(":vitalId", vitalId))
};
