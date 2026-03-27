import axiosInstance from "../../../api/axiosInstance";
import { OTROOM_PRICING_ENDPOINTS } from "../constants/otroomPricing.endpoints";

// ─── OT Room Pricing APIs ─────────────────────────────────────────────
export const createRoomPricingApi = (data) =>
    axiosInstance.post(OTROOM_PRICING_ENDPOINTS.CREATE_PRICING, data);

export const getRoomPricingByRoomApi = (roomId) =>
    axiosInstance.get(OTROOM_PRICING_ENDPOINTS.GET_PRICING_BY_ROOM.replace(":roomId", roomId));

export const updateRoomPricingByRoomApi = (roomId, data) =>
    axiosInstance.put(OTROOM_PRICING_ENDPOINTS.UPDATE_PRICING_BY_ROOM.replace(":roomId", roomId), data);
