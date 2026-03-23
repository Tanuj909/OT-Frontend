import axiosInstance from "../../../api/axiosInstance";
import { SUPER_ADMIN_ENDPOINTS } from "../constants/superAdmin.endpoints";

// ─── Hospital APIs ──────────────────────────────────────────
export const createHospitalApi = (data) =>
  axiosInstance.post(SUPER_ADMIN_ENDPOINTS.CREATE_HOSPITAL, data);

export const getAllHospitalsApi = () =>
  axiosInstance.get(SUPER_ADMIN_ENDPOINTS.GET_ALL_HOSPITALS);

export const getHospitalByIdApi = (id) =>
  axiosInstance.get(SUPER_ADMIN_ENDPOINTS.GET_HOSPITAL_BY_ID.replace(":id", id));

export const updateHospitalApi = (id, data) =>
  axiosInstance.put(SUPER_ADMIN_ENDPOINTS.UPDATE_HOSPITAL.replace(":id", id), data);

// ─── Admin APIs ─────────────────────────────────────────────
export const createAdminApi = (data) =>
  axiosInstance.post(SUPER_ADMIN_ENDPOINTS.CREATE_ADMIN, data);

export const getAdminByIdApi = (id) =>
  axiosInstance.get(SUPER_ADMIN_ENDPOINTS.GET_ADMIN_BY_ID.replace(":id", id));

export const getAllAdminsApi = () =>
  axiosInstance.get(SUPER_ADMIN_ENDPOINTS.GET_ALL_ADMINS);

export const mapAdminToHospitalApi = (hospitalId, adminId) =>
  axiosInstance.post(`${SUPER_ADMIN_ENDPOINTS.MAP_ADMIN_HOSPITAL}?hospitalId=${hospitalId}&adminId=${adminId}`);

export const updateAdminHospitalMappingApi = (hospitalId, adminId) =>
  axiosInstance.put(`${SUPER_ADMIN_ENDPOINTS.UPDATE_ADMIN_HOSPITAL}?hospitalId=${hospitalId}&adminId=${adminId}`);

export const getAdminsByHospitalApi = (hospitalId) =>
  axiosInstance.get(SUPER_ADMIN_ENDPOINTS.GET_ADMINS_BY_HOSPITAL.replace(":hospitalId", hospitalId));
