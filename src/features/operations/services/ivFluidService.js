import axiosInstance from "../../../api/axiosInstance";
import { IV_FLUID_ENDPOINTS } from "../constants/ivfluid.endpoint";

export const ivFluidService = {
    addIVFluidApi: async (operationId, data) => {
        try {
            const response = await axiosInstance.post(IV_FLUID_ENDPOINTS.ADD(operationId), data);
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error adding IV fluid" };
        }
    },

    getAllIVFluidsApi: async (operationId) => {
        try {
            const response = await axiosInstance.get(IV_FLUID_ENDPOINTS.GET_ALL(operationId));
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error fetching IV fluids" };
        }
    },

    updateIVFluidApi: async (operationId, fluidId, data) => {
        try {
            const response = await axiosInstance.patch(IV_FLUID_ENDPOINTS.UPDATE(operationId, fluidId), data);
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error updating IV fluid" };
        }
    },

    completeIVFluidApi: async (operationId, fluidId) => {
        try {
            const response = await axiosInstance.patch(IV_FLUID_ENDPOINTS.COMPLETE(operationId, fluidId));
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error completing IV fluid" };
        }
    },

    removeIVFluidApi: async (operationId, fluidId) => {
        try {
            const response = await axiosInstance.delete(IV_FLUID_ENDPOINTS.REMOVE(operationId, fluidId));
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error removing IV fluid" };
        }
    },

    getIVFluidSummaryApi: async (operationId) => {
        try {
            const response = await axiosInstance.get(IV_FLUID_ENDPOINTS.SUMMARY(operationId));
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: "Error fetching fluid summary" };
        }
    }
};
