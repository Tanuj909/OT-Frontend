import axiosInstance from "../../../api/axiosInstance";
import { STAFF_FEES_ENDPOINTS } from "../constants/staffFees.endpoints";

export const staffFeesService = {
    create: (data) => axiosInstance.post(STAFF_FEES_ENDPOINTS.CREATE, data),
    getByStaffId: (staffId) => axiosInstance.get(STAFF_FEES_ENDPOINTS.GET_BY_STAFF.replace(":staffId", staffId)),
    update: (staffId, data) => axiosInstance.put(STAFF_FEES_ENDPOINTS.UPDATE.replace(":staffId", staffId), data)
};
