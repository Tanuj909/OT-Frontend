export const OPERATION_ENDPOINTS = {
    GET_REQUESTED: "/admin/operations/requested",
    GET_ALL: "/admin/operations",
    GET_BY_STATUS: "/admin/operations/status/:status",
    SCHEDULE: "/admin/operations/:id/schedule",
    START_SURGERY: "/surgery/:id/start",
    CHECK_STATUS: "/surgery/:id/is-started"
};
