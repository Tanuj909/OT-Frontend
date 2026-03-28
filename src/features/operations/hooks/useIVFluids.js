import { useState, useCallback } from "react";
import { ivFluidService } from "../services/ivFluidService";

export const useIVFluids = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addIVFluid = async (operationId, data) => {
        setLoading(true);
        try {
            const res = await ivFluidService.addIVFluidApi(operationId, data);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const getIVFluids = useCallback(async (operationId) => {
        setLoading(true);
        try {
            const res = await ivFluidService.getAllIVFluidsApi(operationId);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateIVFluid = async (operationId, fluidId, data) => {
        setLoading(true);
        try {
            const res = await ivFluidService.updateIVFluidApi(operationId, fluidId, data);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const completeIVFluid = async (operationId, fluidId) => {
        setLoading(true);
        try {
            const res = await ivFluidService.completeIVFluidApi(operationId, fluidId);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const removeIVFluid = async (operationId, fluidId) => {
        setLoading(true);
        try {
            const res = await ivFluidService.removeIVFluidApi(operationId, fluidId);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const getIVFluidSummary = useCallback(async (operationId) => {
        setLoading(true);
        try {
            const res = await ivFluidService.getIVFluidSummaryApi(operationId);
            return res;
        } catch (err) {
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        addIVFluid,
        getIVFluids,
        updateIVFluid,
        completeIVFluid,
        removeIVFluid,
        getIVFluidSummary
    };
};
