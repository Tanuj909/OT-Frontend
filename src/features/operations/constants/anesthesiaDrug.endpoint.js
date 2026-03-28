export const ANESTHESIA_DRUG_ENDPOINTS = {
    ADD: "/anesthesia-drugs/:operationId/add",
    GET_ALL: "/anesthesia-drugs/:operationId/get",
    UPDATE: "/anesthesia-drugs/:operationId/update/:drugId",
    REMOVE: "/anesthesia-drugs/:operationId/remove/:drugId",
    SUMMARY: "/anesthesia-drugs/:operationId/summary"
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
