export const EQUIPMENT_ENDPOINTS = {
    CREATE: "/equipment",
    GET_BY_ID: "/equipment/:id",
    GET_ALL: "/equipment",
    UPDATE: "/equipment/:id",
    UPDATE_STATUS: "/equipment/:id/status",
    DELETE: "/equipment/:id",
    
    // PRICING ENDPOINTS
    PRICING_CREATE: "/equipment/pricing",
    PRICING_UPDATE: "/equipment/pricing/:id",
    PRICING_GET_BY_ID: "/equipment/pricing/:id",
    PRICING_DELETE: "/equipment/pricing/:id",
    PRICING_GET_BY_EQUIPMENT: "/equipment/pricing/equipment/:id"
};
