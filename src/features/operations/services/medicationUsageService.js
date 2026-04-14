import axiosInstance from "../../../api/axiosInstance";
import { MEDICATION_USAGE_ENDPOINTS } from "../constants/medicationUsage.endpoint";

export const medicationUsageService = {
    recordUsage: (data) => 
        axiosInstance.post(MEDICATION_USAGE_ENDPOINTS.RECORD, data),
    
    updateQuantity: (id, quantity) => 
        axiosInstance.put(MEDICATION_USAGE_ENDPOINTS.UPDATE_QUANTITY.replace(":id", id), { quantity }),
    
    getByOperation: (operationId) => 
        axiosInstance.get(MEDICATION_USAGE_ENDPOINTS.GET_BY_OPERATION.replace(":operationId", operationId)),
    
    deleteUsage: (id) => 
        axiosInstance.delete(MEDICATION_USAGE_ENDPOINTS.DELETE.replace(":id", id))
};
