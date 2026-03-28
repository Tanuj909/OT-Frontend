export const CONSUMABLE_ENDPOINTS = {
    GET_ALL: "/operations/:operationId/consumables",
    ADD: "/operations/:operationId/consumables",
    UPDATE: "/operations/:operationId/consumables/:consumableId",
    RETURN: "/operations/:operationId/consumables/:consumableId/return",
    DELETE: "/operations/:operationId/consumables/:consumableId",
    SUMMARY: "/operations/:operationId/consumables/summary"
};

export const CONSUMABLE_CATEGORIES = [
    "SURGICAL",
    "ANESTHESIA",
    "DRAPES",
    "SUTURES",
    "MEDICATION",
    "OTHER"
];

export const UNIT_OPTIONS = [
    "PCS",
    "PKT",
    "ROLL",
    "ML",
    "MG",
    "VIAL",
    "AMP"
];
