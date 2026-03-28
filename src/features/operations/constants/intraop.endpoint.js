export const INTRAOP_ENDPOINTS = {
    CREATE: "/intra-op/:operationId/create",
    GET: "/intra-op/:operationId/get",
    UPDATE: "/intra-op/:operationId/update",
    UPDATE_STATUS: "/intra-op/:operationId/update/status",
    UPDATE_ANESTHESIA_TIME: "/intra-op/:operationId/update/anesthesia-time",
    SUMMARY: "/intra-op/:operationId/summary"
};

export const INTRAOP_STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ABORTED: "ABORTED"
};
