import axiosInstance from "../../../api/axiosInstance";
import { CATALOG_ENDPOINTS } from "../constants/catalog.endpoints";

export const createItemApi = (data) => 
    axiosInstance.post(CATALOG_ENDPOINTS.CREATE, data);

export const getItemByIdApi = (id) => 
    axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_ID.replace(":id", id));

export const getAllItemsApi = (params = {}) => 
    axiosInstance.get(CATALOG_ENDPOINTS.GET_ALL, { params });

export const searchItemsApi = (keyword) => 
    axiosInstance.get(CATALOG_ENDPOINTS.SEARCH, { params: { keyword } });

export const getItemsByTypeApi = (itemType) => 
    axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_TYPE.replace(":itemType", itemType));

export const updateItemApi = (id, data) => 
    axiosInstance.put(CATALOG_ENDPOINTS.UPDATE.replace(":id", id), data);

export const deactivateItemApi = (id) => 
    axiosInstance.patch(CATALOG_ENDPOINTS.DEACTIVATE.replace(":id", id));

export const activateItemApi = (id) => 
    axiosInstance.patch(CATALOG_ENDPOINTS.ACTIVATE.replace(":id", id));

export const deleteItemApi = (id) => 
    axiosInstance.delete(CATALOG_ENDPOINTS.DELETE.replace(":id", id));
