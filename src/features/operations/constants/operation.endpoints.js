export const OPERATION_ENDPOINTS = {
    GET_REQUESTED: "/admin/operations/requested",
    GET_ALL: "/admin/operations",
    GET_BY_STATUS: "/admin/operations/status/:status",
    SCHEDULE: "/admin/operations/:id/schedule",
    START_SURGERY: "/surgery/:id/start",
    CHECK_STATUS: "/surgery/:id/is-started",
    GET_READINESS: "/operations/:id/surgery-readiness",
    GET_REPORT: "/operations/:id/report",
    END_SURGERY: "/operations/:id/end",
    SHIFT_ROOM: "/surgery/:id/shift-room",
    READY_FOR_IPD_TRANSFER: "/ot/:id/ready-for-ipd-transfer"
};
