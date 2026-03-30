import axiosInstance from "../../../api/axiosInstance";
import { CATALOG_ENDPOINTS } from "../constants/catalog.endpoints";

export const catalogService = {
  create: (data) => axiosInstance.post(CATALOG_ENDPOINTS.CREATE, data),
  getAll: (params = {}) => axiosInstance.get(CATALOG_ENDPOINTS.GET_ALL, { params }),
  getById: (id) => axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_ID.replace(":id", id)),
  getByType: (type) => axiosInstance.get(CATALOG_ENDPOINTS.GET_BY_TYPE.replace(":itemType", type)),
  update: (id, data) => axiosInstance.put(CATALOG_ENDPOINTS.UPDATE.replace(":id", id), data),
  toggleStatus: (id, currentStatus) => {
    const endpoint = currentStatus ? CATALOG_ENDPOINTS.DEACTIVATE : CATALOG_ENDPOINTS.ACTIVATE;
    return axiosInstance.patch(endpoint.replace(":id", id));
  },
  delete: (id) => axiosInstance.delete(CATALOG_ENDPOINTS.DELETE.replace(":id", id)),
  search: (query) => axiosInstance.get(CATALOG_ENDPOINTS.SEARCH, { params: { query } })
};
