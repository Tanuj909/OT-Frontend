export const STAFF_ENDPOINTS = {
    CREATE: "/admin/staff",
    UPDATE: "/admin/staff/:id",
    GET_SINGLE: "/admin/staff/:id",
    GET_ALL: "/admin/staff",
    DEACTIVATE: "/admin/staff/:id/deactivate",
    ACTIVATE: "/admin/staff/:id/activate",
    
    // Schedule Endpoints
    CREATE_SCHEDULE: "/admin/staff/staff-schedule",
    UPDATE_SCHEDULE: "/admin/staff/staff-schedule/:scheduleId",
    GET_SCHEDULE: "/admin/staff/get-staff-schedule/:id",
    DELETE_SCHEDULE: "/admin/staff/delete-schedule/:scheduleId",

    // Availability Endpoints
    CREATE_AVAILABILITY: "/admin/staff-availability",
    GET_AVAILABILITY: "/admin/staff-availability/:id",
    CHECK_AVAILABILITY: "/admin/staff-availability/check",
    GET_AVAILABLE_BY_TIME: "/admin/staff-availability/availability",
    DELETE_AVAILABILITY: "/admin/staff-availability/:id"
};
