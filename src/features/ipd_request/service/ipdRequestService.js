import axiosInstance from "../../../api/axiosInstance";

export const createOtRequestApi = async (data) => {
    return await axiosInstance.post("/ipd/ot-request", data);
};
