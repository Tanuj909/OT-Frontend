import { useState, useCallback } from 'react';
import { medicationUsageService } from '../services/medicationUsageService';
import { toast } from 'react-hot-toast';

export const useMedicationUsage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const recordMedication = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationUsageService.recordUsage(data);
            toast.success('Medication recorded successfully');
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to record medication';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateMedicationQuantity = async (id, quantity) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationUsageService.updateQuantity(id, quantity);
            toast.success('Quantity updated successfully');
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update quantity';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicationUsageByOperation = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await medicationUsageService.getByOperation(operationId);
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch medication usage';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteMedicationUsage = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await medicationUsageService.deleteUsage(id);
            toast.success('Medication usage deleted');
            return true;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete medication usage';
            setError(msg);
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        recordMedication,
        updateMedicationQuantity,
        fetchMedicationUsageByOperation,
        deleteMedicationUsage,
        loading,
        error
    };
};
