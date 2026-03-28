export const ANESTHESIA_DRUG_ENDPOINTS = {
    ADD: "/api/anesthesia-drugs/:operationId/add",
    GET_ALL: "/api/anesthesia-drugs/:operationId/get",
    UPDATE: "/api/anesthesia-drugs/:operationId/update/:drugId",
    REMOVE: "/api/anesthesia-drugs/:operationId/remove/:drugId",
    SUMMARY: "/api/anesthesia-drugs/:operationId/summary"
};

export const DRUG_TYPES = [
    "INDUCTION",
    "MAINTENANCE",
    "ANALGESIC",
    "MUSCLE_RELAXANT",
    "REVERSAL",
    "LOCAL_ANESTHETIC",
    "ADJUVANT",
    "OTHER"
];

export const DRUG_ROUTES = [
    "IV",
    "IM",
    "ORAL",
    "INHALATION",
    "EPIDURAL",
    "SPINAL",
    "SUBCUTANEOUS"
];
