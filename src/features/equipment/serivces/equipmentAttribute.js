import axiosInstance from "../../../api/axiosInstance";
import { EQUIPMENT_ATTRIBUTE_ENDPOINTS } from "../constants/equipmentAttribute.endpoints";

export const createAttributeApi = (equipmentId, data) => 
    axiosInstance.post(EQUIPMENT_ATTRIBUTE_ENDPOINTS.CREATE.replace(":id", equipmentId), data);

export const getAllAttributesApi = (equipmentId) => 
    axiosInstance.get(EQUIPMENT_ATTRIBUTE_ENDPOINTS.GET_ALL.replace(":id", equipmentId));

export const updateAttributeApi = (equipmentId, attributeId, data) => 
    axiosInstance.put(
        EQUIPMENT_ATTRIBUTE_ENDPOINTS.UPDATE
            .replace(":id", equipmentId)
            .replace(":attributeId", attributeId), 
        data
    );

export const deleteAttributeApi = (equipmentId, attributeId) => 
    axiosInstance.delete(
        EQUIPMENT_ATTRIBUTE_ENDPOINTS.DELETE
            .replace(":id", equipmentId)
            .replace(":attributeId", attributeId)
    );
