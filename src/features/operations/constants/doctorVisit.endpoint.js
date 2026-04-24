export const DOCTOR_VISIT_ENDPOINTS = {
    CREATE: "/doctor-visits",
    UPDATE: "/doctor-visits/:visitId",
    CANCEL: "/doctor-visits/:visitId/cancel",
    COMPLETE: "/doctor-visits/:visitId/complete",
    GET_BY_ADMISSION: "/doctor-visits/admission/:admissionId",
    GET_LATEST_BY_OPERATION: "/doctor-visits/operation/:operationId/latest",
    GET_BY_STATUS: "/doctor-visits/operation/:operationId/status",
    CHECK_DISCHARGE: "/doctor-visits/operation/:operationId/discharge-recommended"
};
