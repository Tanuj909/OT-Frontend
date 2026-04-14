import { useState, useCallback } from 'react';
import { wardVitalsService } from '../services/wardVitalsService';
import { toast } from 'react-hot-toast';

export const useWardVitals = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const recordVitals = async (operationId, wardRoomId, wardBedId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardVitalsService.createVitals(operationId, wardRoomId, wardBedId, data);
            toast.success('Vitals recorded successfully');
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to record vitals';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchAllVitals = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardVitalsService.getAllVitals(operationId);
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch vitals history';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLatestVital = useCallback(async (operationId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardVitalsService.getLatestVitals(operationId);
            return response.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch latest vitals';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const checkPatientStability = useCallback(async (operationId) => {
        try {
            const response = await wardVitalsService.checkStability(operationId);
            return response.data.data;
        } catch (err) {
            console.error('Error checking stability:', err);
            return null;
        }
    }, []);


    return {
        recordVitals,
        fetchAllVitals,
        fetchLatestVital,
        checkPatientStability,
        loading,
        error
    };
};
