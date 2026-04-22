export const WARD_TASKS_ENDPOINTS = {
    CREATE: "/ward-tasks",
    COMPLETE: "/ward-tasks/:taskId/complete",
    CANCEL: "/ward-tasks/:taskId/cancel",
    GET_BY_ADMISSION: "/ward-tasks/admission/:admissionId",
    GET_BY_ID: "/ward-tasks/:taskId",
    GET_BY_OPERATION_STATUS: "/ward-tasks/operation/:operationId/status"
};
