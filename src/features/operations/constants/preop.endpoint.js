export const PREOP_ENDPOINTS = {
    BASE: "/operations/:operationId/pre-op",
    UPDATE_STATUS: "/operations/:operationId/pre-op/status",
};

export const ASA_GRADES = ["ASA1", "ASA2", "ASA3", "ASA4", "ASA5", "ASA6"];

export const NPO_STATUSES = [
    { value: "NPO_6H", label: "NPO 6H" },
    { value: "NPO_4H", label: "NPO 4H" },
    { value: "NPO_2H", label: "NPO 2H" },
    { value: "CLEAR_LIQUIDS", label: "Clear Liquids" },
    { value: "NOT_NPO", label: "Not NPO" }
];

export const ASSESSMENT_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    REASSESSMENT_REQUIRED: "REASSESSMENT_REQUIRED"
};
