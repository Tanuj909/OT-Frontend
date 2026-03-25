import axiosInstance from "../../../api/axiosInstance";
import { OTROOM_ENDPOINTS } from "../constants/otroom.endpoints";

// ─── OT Room APIs ────────────────────────────────────────────────────
export const createRoomApi = (data) =>
    axiosInstance.post(OTROOM_ENDPOINTS.CREATE_ROOM, data);

export const getAllRoomsApi = () =>
    axiosInstance.get(OTROOM_ENDPOINTS.GET_ROOM_ALL);

export const getRoomByIdApi = (id) =>
    axiosInstance.get(OTROOM_ENDPOINTS.GET_ROOM_BY_ID.replace(":id", id));

export const getRoomsByTheaterApi = (id) =>
    axiosInstance.get(OTROOM_ENDPOINTS.GET_ROOMS_BY_THEATER.replace(":id", id));

export const updateRoomApi = (id, data) =>
    axiosInstance.put(OTROOM_ENDPOINTS.UPDATE_ROOM.replace(":id", id), data);

export const updateRoomStatusApi = (id, data) =>
    axiosInstance.patch(OTROOM_ENDPOINTS.UPDATE_ROOM_STATUS.replace(":id", id), data);

export const getAvailableRoomsApi = () =>
    axiosInstance.get(OTROOM_ENDPOINTS.GET_ROOM_AVAILABLE);

export const enableRoomApi = (id) =>
    axiosInstance.patch(OTROOM_ENDPOINTS.ENABLE_ROOM.replace(":id", id));

export const disableRoomApi = (id) =>
    axiosInstance.patch(OTROOM_ENDPOINTS.DISABLE_ROOM.replace(":id", id));

export const deleteRoomApi = (id) =>
    axiosInstance.delete(OTROOM_ENDPOINTS.DELETE_ROOM.replace(":id", id));
