import axiosInstance from "../../../api/axiosInstance";
import { IMPLANT_ENDPOINTS } from "../constants/implant.endpoint";

export const implantService = {
    addImplant: (opId, data) => 
        axiosInstance.post(IMPLANT_ENDPOINTS.ADD.replace(":operationId", opId), data),
    
    getUsedImplants: (opId) => 
        axiosInstance.get(IMPLANT_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    updateImplant: (opId, implantId, data) => 
        axiosInstance.patch(IMPLANT_ENDPOINTS.UPDATE.replace(":operationId", opId).replace(":implantId", implantId), data),
    
    removeImplant: (opId, implantId) => 
        axiosInstance.delete(IMPLANT_ENDPOINTS.REMOVE.replace(":operationId", opId).replace(":implantId", implantId))
};
