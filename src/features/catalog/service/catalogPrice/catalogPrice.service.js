import axiosInstance from "../../../../api/axiosInstance";
import { CATALOG_PRICE_ENDPOINTS } from "../../constants/catalogPrice/catalogPrice.endpoints";

export const createPriceApi = (data) => 
    axiosInstance.post(CATALOG_PRICE_ENDPOINTS.CREATE, data);

export const getPriceByIdApi = (id) => 
    axiosInstance.get(CATALOG_PRICE_ENDPOINTS.GET_BY_ID.replace(":id", id));

export const getPriceByCatalogItemIdApi = (catalogItemId) => 
    axiosInstance.get(CATALOG_PRICE_ENDPOINTS.GET_BY_CATALOG_ITEM_ID.replace(":catalogItemId", catalogItemId));

export const getAllPricesApi = (params = {}) => 
    axiosInstance.get(CATALOG_PRICE_ENDPOINTS.GET_ALL, { params });

export const updatePriceApi = (id, data) => 
    axiosInstance.put(CATALOG_PRICE_ENDPOINTS.UPDATE.replace(":id", id), data);

export const deactivatePriceApi = (id) => 
    axiosInstance.patch(CATALOG_PRICE_ENDPOINTS.DEACTIVATE.replace(":id", id));

export const activatePriceApi = (id) => 
    axiosInstance.patch(CATALOG_PRICE_ENDPOINTS.ACTIVATE.replace(":id", id));
