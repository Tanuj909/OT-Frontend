export const WARD_VITALS_ENDPOINTS = {
    CREATE: "/operations/:operationId/ward-room/:wardRoomId/ward-bed/:wardBedId/ward-vitals",
    GET_ALL: "/operations/:operationId/ward-vitals",
    GET_LATEST: "/operations/:operationId/ward-vitals/latest",
    CHECK_STABILITY: "/operations/:operationId/ward-vitals/stable"
};
