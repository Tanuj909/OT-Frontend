import axiosInstance from "../../../api/axiosInstance";
import { EQUIPMENT_ENDPOINTS } from "../constants/equipment.endpoint";

export const equipmentService = {
    addEquipment: (opId, data) => 
        axiosInstance.post(EQUIPMENT_ENDPOINTS.ADD.replace(":operationId", opId), data),
    
    getUsedEquipment: (opId) => 
        axiosInstance.get(EQUIPMENT_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    updateUsageDetails: (opId, usageId, data) => 
        axiosInstance.patch(EQUIPMENT_ENDPOINTS.UPDATE_USAGE.replace(":operationId", opId).replace(":id", usageId), data),
    
    removeEquipment: (opId, usageId) => 
        axiosInstance.delete(EQUIPMENT_ENDPOINTS.REMOVE.replace(":operationId", opId).replace(":id", usageId))
};
