export const OT_FEATURE_ENDPOINTS = {
    BASE: "/ot-features",
    ACTIVE: "/ot-features/active",
    BULK: "/ot-features/bulk",
    ITEM: (id) => `/ot-features/${id}`,
    TOGGLE: (id) => `/ot-features/${id}/toggle`,
    ROOM_FEATURES: (roomId) => `/admin/ot-rooms/${roomId}/features`,
    DELETE_FEATURE : (id) => `/ot-features/delete/${id}`,
};
