import axiosInstance from "../../../api/axiosInstance";
import { CONSUMABLE_ENDPOINTS } from "../constants/consumables.endpoint";

export const consumableService = {
    addConsumable: (opId, data) => 
        axiosInstance.post(CONSUMABLE_ENDPOINTS.ADD.replace(":operationId", opId), data),
    
    getConsumables: (opId) => 
        axiosInstance.get(CONSUMABLE_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    updateConsumable: (opId, consumableId, data) => 
        axiosInstance.patch(CONSUMABLE_ENDPOINTS.UPDATE.replace(":operationId", opId).replace(":consumableId", consumableId), data),
    
    returnConsumable: (opId, consumableId) => 
        axiosInstance.patch(CONSUMABLE_ENDPOINTS.RETURN.replace(":operationId", opId).replace(":consumableId", consumableId)),
    
    deleteConsumable: (opId, consumableId) => 
        axiosInstance.delete(CONSUMABLE_ENDPOINTS.DELETE.replace(":operationId", opId).replace(":consumableId", consumableId)),
    
    getConsumableSummary: (opId) => 
        axiosInstance.get(CONSUMABLE_ENDPOINTS.SUMMARY.replace(":operationId", opId))
};
