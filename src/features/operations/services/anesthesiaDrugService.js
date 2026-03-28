import axiosInstance from "../../../api/axiosInstance";
import { ANESTHESIA_DRUG_ENDPOINTS } from "../constants/anesthesiaDrug.endpoint";

export const anesthesiaDrugService = {
    addDrug: (opId, data) => 
        axiosInstance.post(ANESTHESIA_DRUG_ENDPOINTS.ADD.replace(":operationId", opId), data),
    
    getDrugs: (opId) => 
        axiosInstance.get(ANESTHESIA_DRUG_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    updateDrug: (opId, drugId, data) => 
        axiosInstance.patch(ANESTHESIA_DRUG_ENDPOINTS.UPDATE.replace(":operationId", opId).replace(":drugId", drugId), data),
    
    removeDrug: (opId, drugId) => 
        axiosInstance.delete(ANESTHESIA_DRUG_ENDPOINTS.REMOVE.replace(":operationId", opId).replace(":drugId", drugId)),
    
    getDrugSummary: (opId) => 
        axiosInstance.get(ANESTHESIA_DRUG_ENDPOINTS.SUMMARY.replace(":operationId", opId))
};
