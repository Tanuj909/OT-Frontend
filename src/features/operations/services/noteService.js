import axiosInstance from "../../../api/axiosInstance";
import { NOTE_ENDPOINTS } from "../constants/notes.endpoint";

export const noteService = {
    addNote: (opId, data) => 
        axiosInstance.post(NOTE_ENDPOINTS.ADD.replace(":operationId", opId), data),
    
    getNotes: (opId) => 
        axiosInstance.get(NOTE_ENDPOINTS.GET_ALL.replace(":operationId", opId)),
    
    updateNote: (opId, noteId, data) => 
        axiosInstance.put(NOTE_ENDPOINTS.UPDATE.replace(":operationId", opId).replace(":noteId", noteId), data),
    
    deleteNote: (opId, noteId) => 
        axiosInstance.delete(NOTE_ENDPOINTS.DELETE.replace(":operationId", opId).replace(":noteId", noteId))
};
