import axiosInstance from "../../../api/axiosInstance";
import { ADMIN_ENDPOINTS } from "../constants/admin.endpoints";

// ─── Operation Theater APIs ──────────────────────────────────────────
export const createOTApi = (data) =>
    axiosInstance.post(ADMIN_ENDPOINTS.CREATE_OT, data);

export const getAllOTsApi = () =>
    axiosInstance.get(ADMIN_ENDPOINTS.GET_OT_ALL);

export const getActiveOTsApi = () =>
    axiosInstance.get(ADMIN_ENDPOINTS.GET_OT_ACTIVE);

export const getOTByIdApi = (id) =>
    axiosInstance.get(ADMIN_ENDPOINTS.GET_OT_BY_ID.replace(":id", id));

export const updateOTApi = (id, data) =>
    axiosInstance.put(ADMIN_ENDPOINTS.UPDATE_OT.replace(":id", id), data);

export const deleteOTApi = (id) =>
    axiosInstance.delete(ADMIN_ENDPOINTS.DELETE_OT.replace(":id", id));

export const updateOTStatusApi = (id, status) =>
    axiosInstance.put(`${ADMIN_ENDPOINTS.UPDATE_OT_STATUS.replace(":id", id)}?status=${status}`);

export const getAdminDashboardApi = () =>
    axiosInstance.get(ADMIN_ENDPOINTS.GET_DASHBOARD);
