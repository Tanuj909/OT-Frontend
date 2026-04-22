import axiosInstance from "../../../api/axiosInstance";
import { WARD_TASKS_ENDPOINTS } from "../constants/wardTasks.endpoint";

export const wardTasksService = {
    createTask: (data) => 
        axiosInstance.post(WARD_TASKS_ENDPOINTS.CREATE, data),
    
    completeTask: (taskId, data) => 
        axiosInstance.put(WARD_TASKS_ENDPOINTS.COMPLETE.replace(":taskId", taskId), data),
    
    cancelTask: (taskId) => 
        axiosInstance.put(WARD_TASKS_ENDPOINTS.CANCEL.replace(":taskId", taskId)),
    
    getByAdmission: (admissionId) => 
        axiosInstance.get(WARD_TASKS_ENDPOINTS.GET_BY_ADMISSION.replace(":admissionId", admissionId)),
    
    getById: (taskId) => 
        axiosInstance.get(WARD_TASKS_ENDPOINTS.GET_BY_ID.replace(":taskId", taskId)),
    
    getByOperationStatus: (operationId, status) => 
        axiosInstance.get(`${WARD_TASKS_ENDPOINTS.GET_BY_OPERATION_STATUS.replace(":operationId", operationId)}?status=${status}`)
};
