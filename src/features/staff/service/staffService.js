import axiosInstance from "../../../api/axiosInstance";
import { STAFF_ENDPOINTS } from "../constants/staff.endpoints";

export const createStaffApi = (data) => 
    axiosInstance.post(STAFF_ENDPOINTS.CREATE, data);

export const updateStaffApi = (id, data) => 
    axiosInstance.put(STAFF_ENDPOINTS.UPDATE.replace(":id", id), data);

export const getSingleStaffApi = (id) => 
    axiosInstance.get(STAFF_ENDPOINTS.GET_SINGLE.replace(":id", id));

export const getAllStaffApi = () => 
    axiosInstance.get(STAFF_ENDPOINTS.GET_ALL);

export const deactivateStaffApi = (id) => 
    axiosInstance.patch(STAFF_ENDPOINTS.DEACTIVATE.replace(":id", id));

export const activateStaffApi = (id) => 
    axiosInstance.patch(STAFF_ENDPOINTS.ACTIVATE.replace(":id", id));

// Schedule
export const createStaffScheduleApi = (data) => 
    axiosInstance.post(STAFF_ENDPOINTS.CREATE_SCHEDULE, data);

export const updateStaffScheduleApi = (scheduleId, data) => 
    axiosInstance.put(STAFF_ENDPOINTS.UPDATE_SCHEDULE.replace(":scheduleId", scheduleId), data);

export const getStaffScheduleApi = (staffId) => 
    axiosInstance.get(STAFF_ENDPOINTS.GET_SCHEDULE.replace(":id", staffId));

export const deleteStaffScheduleApi = (scheduleId) => 
    axiosInstance.delete(STAFF_ENDPOINTS.DELETE_SCHEDULE.replace(":scheduleId", scheduleId));

// Availability
export const createStaffAvailabilityApi = (data) => 
    axiosInstance.post(STAFF_ENDPOINTS.CREATE_AVAILABILITY, data);

export const getStaffAvailabilityApi = (staffId) => 
    axiosInstance.get(STAFF_ENDPOINTS.GET_AVAILABILITY.replace(":id", staffId));

export const checkStaffAvailabilityApi = (params) => 
    axiosInstance.get(STAFF_ENDPOINTS.CHECK_AVAILABILITY, { params });

export const deleteStaffAvailabilityApi = (id) => 
    axiosInstance.delete(STAFF_ENDPOINTS.DELETE_AVAILABILITY.replace(":id", id));
