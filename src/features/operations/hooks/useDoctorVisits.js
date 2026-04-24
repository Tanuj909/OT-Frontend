import { useState, useCallback } from 'react';
import { doctorVisitService } from '../services/doctorVisitService';
import { toast } from 'react-hot-toast';

export const useDoctorVisits = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createVisit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await doctorVisitService.createVisit(data);
            toast.success('Doctor visit recorded successfully');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to record visit';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateVisit = async (visitId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await doctorVisitService.updateVisit(visitId, data);
            toast.success('Visit details updated');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update visit';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const cancelVisit = async (visitId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await doctorVisitService.cancelVisit(visitId);
            toast.success('Visit cancelled');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cancel visit';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const completeVisit = async (visitId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await doctorVisitService.completeVisit(visitId);
            toast.success('Doctor visit completed successfully');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to complete visit';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchVisitsByAdmission = useCallback(async (admissionId) => {
        setLoading(true);
        try {
            const response = await doctorVisitService.getByAdmission(admissionId);
            return response.data;
        } catch (err) {
            console.error('Error fetching visits:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLatestVisit = useCallback(async (operationId) => {
        setLoading(true);
        try {
            const response = await doctorVisitService.getLatestByOperation(operationId);
            return response.data;
        } catch (err) {
            console.error('Error fetching latest visit:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVisitsByStatus = useCallback(async (operationId, status) => {
        setLoading(true);
        try {
            const response = await doctorVisitService.getByStatus(operationId, status);
            return response.data;
        } catch (err) {
            console.error('Error fetching visits by status:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const checkDischargeRecommendation = useCallback(async (operationId) => {
        try {
            const response = await doctorVisitService.checkDischargeRecommendation(operationId);
            return response.data; // Expected boolean or object
        } catch (err) {
            return false;
        }
    }, []);

    return {
        createVisit,
        updateVisit,
        cancelVisit,
        completeVisit,
        fetchVisitsByAdmission,
        fetchLatestVisit,
        fetchVisitsByStatus,
        checkDischargeRecommendation,
        loading,
        error
    };
};
