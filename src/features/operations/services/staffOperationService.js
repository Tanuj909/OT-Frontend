import axiosInstance from "../../../api/axiosInstance";
import { STAFF_OPERATION_ENDPOINTS } from "../constants/staffOperation.endpoints";

export const getMyOperationsApi = (statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "EMERGENCY"]) => {
    const statusQuery = Array.isArray(statuses) ? statuses.join(",") : statuses;
    return axiosInstance.get(`${STAFF_OPERATION_ENDPOINTS.GET_MY_OPERATIONS}?statuses=${statusQuery}`);
};
