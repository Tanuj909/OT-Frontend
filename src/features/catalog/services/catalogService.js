import axiosInstance from "../../../api/axiosInstance";
import { CATALOG_ENDPOINTS } from "../constants/catalog.endpoints";

export const catalogService = {
  getAll: (params = {}) => axiosInstance.get(CATALOG_ENDPOINTS.GET_ALL, { params }),
  getById: (id) => axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_ID.replace(":id", id)),
  getByType: (type) => axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_TYPE.replace(":itemType", type)),
  search: (query) => axiosInstance.get(CATALOG_ENDPOINTS.SEARCH, { params: { query } })
};
