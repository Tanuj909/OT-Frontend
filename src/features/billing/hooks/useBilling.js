import { useState, useCallback } from "react";
import { 
    getBillingMasterApi, 
    getBillingDetailsApi, 
    getRoomBillingDetailsApi, 
    getItemBillingDetailsApi,
    makePaymentApi,
    getPaymentHistoryApi
} from "../services/billingService";

export const useBilling = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [billingMaster, setBillingMaster] = useState(null);
    const [billingDetails, setBillingDetails] = useState(null);
    const [roomDetails, setRoomDetails] = useState([]);
    const [itemDetails, setItemDetails] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState(null);

    const fetchAllBillingData = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const [masterRes, detailsRes, roomRes, itemRes, historyRes] = await Promise.all([
                getBillingMasterApi(operationId),
                getBillingDetailsApi(operationId),
                getRoomBillingDetailsApi(operationId),
                getItemBillingDetailsApi(operationId),
                getPaymentHistoryApi(operationId)
            ]);

            setBillingMaster(masterRes.data?.data || masterRes.data);
            setBillingDetails(detailsRes.data?.data || detailsRes.data);
            setRoomDetails(roomRes.data?.data || roomRes.data || []);
            setItemDetails(itemRes.data?.data || itemRes.data || []);
            setPaymentHistory(historyRes.data?.data || historyRes.data);

            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch billing data.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const makePayment = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await makePaymentApi(data);
            return { success: true, message: res.data?.message || "Payment processed successfully" };
        } catch (err) {
            setError(err.response?.data?.message || "Payment processing failed.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        billingMaster,
        billingDetails,
        roomDetails,
        itemDetails,
        paymentHistory,
        fetchAllBillingData,
        makePayment
    };
};
