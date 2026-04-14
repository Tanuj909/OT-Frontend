import axiosInstance from "../../../api/axiosInstance";
import { WARD_VITALS_ENDPOINTS } from "../constants/wardVitals.endpoint";

export const wardVitalsService = {
    createVitals: (operationId, wardRoomId, wardBedId, data) => 
        axiosInstance.post(
            WARD_VITALS_ENDPOINTS.CREATE
                .replace(":operationId", operationId)
                .replace(":wardRoomId", wardRoomId)
                .replace(":wardBedId", wardBedId), 
            data
        ),
    
    getAllVitals: (operationId) => 
        axiosInstance.get(WARD_VITALS_ENDPOINTS.GET_ALL.replace(":operationId", operationId)),
    
    getLatestVitals: (operationId) => 
        axiosInstance.get(WARD_VITALS_ENDPOINTS.GET_LATEST.replace(":operationId", operationId)),
    
    checkStability: (operationId) => 
        axiosInstance.get(WARD_VITALS_ENDPOINTS.CHECK_STABILITY.replace(":operationId", operationId))
};
