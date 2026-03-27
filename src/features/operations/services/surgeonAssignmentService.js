import axiosInstance from "../../../api/axiosInstance";
import { SURGEON_ASSIGNMENT_ENDPOINTS } from "../constants/surgeonAssignment.endpoints";

export const assignSurgeonsApi = (id, data) => 
    axiosInstance.post(SURGEON_ASSIGNMENT_ENDPOINTS.ASSIGN.replace(":operationId", id), data);

export const getAssignedSurgeonsApi = (id) => 
    axiosInstance.get(SURGEON_ASSIGNMENT_ENDPOINTS.GET_ASSIGNED.replace(":operationId", id));

export const unassignSurgeonsApi = (id, surgeonIds) => 
    axiosInstance.delete(SURGEON_ASSIGNMENT_ENDPOINTS.UNASSIGN.replace(":operationId", id), { data: { surgeonIds } });

export const getAvailableSurgeonsApi = () => 
    axiosInstance.get(SURGEON_ASSIGNMENT_ENDPOINTS.AVAILABLE_SURGEONS);
