const API_BASE = import.meta.env.VITE_OT_API_BASE_URL || "http://localhost:3010/api";

export const IV_FLUID_ENDPOINTS = {
    ADD: (opId) => `${API_BASE}/iv-fluids/${opId}/add`,
    GET_ALL: (opId) => `${API_BASE}/iv-fluids/${opId}/get`,
    UPDATE: (opId, fluidId) => `${API_BASE}/iv-fluids/${opId}/update/fluid/${fluidId}`,
    COMPLETE: (opId, fluidId) => `${API_BASE}/iv-fluids/${opId}/fluid/${fluidId}/complete`,
    REMOVE: (opId, fluidId) => `${API_BASE}/iv-fluids/${opId}/remove/fluid/${fluidId}`,
    SUMMARY: (opId) => `${API_BASE}/iv-fluids/${opId}/summary`,
};
