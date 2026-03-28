export const VITALS_ENDPOINTS = {
    CREATE: "/operations/:operationId/vitals",
    GET_ALL: "/operations/:operationId/vitals",
    GET_LATEST: "/operations/:operationId/vitals/latest",
    DELETE: "/operations/:operationId/vitals/:vitalId"
};

export const CONSCIOUSNESS_OPTIONS = [
    "Alert",
    "Conscious",
    "Drowsy",
    "Responsive to Voice",
    "Responsive to Pain",
    "Unresponsive"
];

export const SEDATION_OPTIONS = [
    "No sedation",
    "Light sedation",
    "Moderate sedation",
    "Deep sedation",
    "General anesthesia"
];
