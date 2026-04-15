export const WARD_ADMISSION_ENDPOINTS = {
    ASSIGN: "/ward-admissions/assign",
    CHECK_STATUS: "/ward-admissions/operation/:operationId/is-admitted",
    GET_ACTIVE: "/ward-admissions/operation/:operationId/active",
    DISCHARGE: "/ward-admissions/discharge/operation/:operationId",
    IS_DISCHARGED: "/ward-admissions/operation/:operationId/is-discharged"
};
