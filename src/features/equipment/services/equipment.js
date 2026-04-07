import axiosInstance from "../../../api/axiosInstance";
import { EQUIPMENT_ENDPOINTS } from "../constants/equipment.endpoints";

export const addEquipmentApi = (data) => 
    axiosInstance.post(EQUIPMENT_ENDPOINTS.CREATE, data);

export const getEquipmentByIdApi = (id) => 
    axiosInstance.get(EQUIPMENT_ENDPOINTS.GET_BY_ID.replace(":id", id));

export const getAllEquipmentApi = () => 
    axiosInstance.get(EQUIPMENT_ENDPOINTS.GET_ALL);

export const updateEquipmentApi = (id, data) => 
    axiosInstance.put(EQUIPMENT_ENDPOINTS.UPDATE.replace(":id", id), data);

export const updateEquipmentStatusApi = (id, status) => 
    axiosInstance.patch(EQUIPMENT_ENDPOINTS.UPDATE_STATUS.replace(":id", id) + `?status=${status}`);

export const deleteEquipmentApi = (id) => 
    axiosInstance.delete(EQUIPMENT_ENDPOINTS.DELETE.replace(":id", id));

// PRICING SERVICES
export const createEquipmentPricingApi = (data) => 
    axiosInstance.post(EQUIPMENT_ENDPOINTS.PRICING_CREATE, data);

export const updateEquipmentPricingApi = (id, data) => 
    axiosInstance.put(EQUIPMENT_ENDPOINTS.PRICING_UPDATE.replace(":id", id), data);

export const getEquipmentPricingByIdApi = (id) => 
    axiosInstance.get(EQUIPMENT_ENDPOINTS.PRICING_GET_BY_ID.replace(":id", id));

export const getEquipmentPricingByEquipmentIdApi = (equipmentId) => 
    axiosInstance.get(EQUIPMENT_ENDPOINTS.PRICING_GET_BY_EQUIPMENT.replace(":id", equipmentId));

export const deleteEquipmentPricingApi = (id) => 
    axiosInstance.delete(EQUIPMENT_ENDPOINTS.PRICING_DELETE.replace(":id", id));
