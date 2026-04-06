import axiosInstance from "../../../api/axiosInstance";
import { BILLING_ENDPOINTS } from "../constants/billing.endpoints";

export const getBillingMasterApi = (operationId) => 
    axiosInstance.get(BILLING_ENDPOINTS.GET_MASTER.replace(":id", operationId));

export const getBillingDetailsApi = (operationId) => 
    axiosInstance.get(BILLING_ENDPOINTS.GET_DETAILS.replace(":id", operationId));

export const getRoomBillingDetailsApi = (operationId) => 
    axiosInstance.get(BILLING_ENDPOINTS.GET_ROOM_DETAILS.replace(":id", operationId));

export const getItemBillingDetailsApi = (operationId) => 
    axiosInstance.get(BILLING_ENDPOINTS.GET_ITEMS_DETAILS.replace(":id", operationId));

export const makePaymentApi = (data) => 
    axiosInstance.post(BILLING_ENDPOINTS.MAKE_PAYMENT, data);

export const getPaymentHistoryApi = (operationId) => 
    axiosInstance.get(BILLING_ENDPOINTS.GET_PAYMENT_HISTORY.replace(":id", operationId));
