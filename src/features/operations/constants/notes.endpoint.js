export const NOTE_ENDPOINTS = {
    GET_ALL: "/operations/:operationId/notes",
    ADD: "/operations/:operationId/notes",
    UPDATE: "/operations/:operationId/notes/:noteId",
    DELETE: "/operations/:operationId/notes/:noteId"
};

export const NOTE_TYPES = [
    { label: "Intra-Operative", value: "INTRA_OP" },
    { label: "Incident", value: "INCIDENT" },
    { label: "Pre-Operative", value: "PRE_OP" },
    { label: "Post-Operative", value: "POST_OP" }
];
