import axiosInstance from "../../api/axiosInstance";
import { AUTH_ENDPOINTS } from "./auth.endpoints";

export const loginApi = (credentials) =>
  axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);

// Yeh axiosInstance use nahi karega — kyunki logout pe token already invalid ho sakta hai
export const logoutApi = () =>
  axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);

export const forgotPasswordApi = (email) =>
  axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });

export const resetPasswordApi = (data) =>
  axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);




