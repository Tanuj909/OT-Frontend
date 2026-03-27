import axiosInstance from "../../../api/axiosInstance";
import { STAFF_ASSIGNMENT_ENDPOINTS } from "../constants/staffAssignment.endpoints";

export const assignStaffApi = (id, data) => 
    axiosInstance.post(STAFF_ASSIGNMENT_ENDPOINTS.ASSIGN.replace(":operationId", id), data);

export const getAssignedStaffApi = (id) => 
    axiosInstance.get(STAFF_ASSIGNMENT_ENDPOINTS.GET_ASSIGNED.replace(":operationId", id));

export const unassignStaffApi = (id, staffIds) => 
    axiosInstance.delete(STAFF_ASSIGNMENT_ENDPOINTS.UNASSIGN.replace(":operationId", id), { data: { staffIds } });

export const getAvailableStaffApi = () => 
    axiosInstance.get(STAFF_ASSIGNMENT_ENDPOINTS.AVAILABLE_STAFF);


