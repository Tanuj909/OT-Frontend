import { useState, useCallback } from 'react';
import { staffFeesService } from '../service/staffFeesService';
import { toast } from 'react-hot-toast';

export const useStaffFees = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createStaffFees = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffFeesService.create(data);
            toast.success('Staff charges created successfully');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create staff charges';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getStaffFees = useCallback(async (staffId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffFeesService.getByStaffId(staffId);
            return response.data?.data;
        } catch (err) {
            if (err.response?.status !== 404) {
                const msg = err.response?.data?.message || 'Failed to fetch staff charges';
                setError(msg);
                toast.error(msg);
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStaffFees = async (staffId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await staffFeesService.update(staffId, data);
            toast.success('Staff charges updated successfully');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update staff charges';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createStaffFees,
        getStaffFees,
        updateStaffFees,
        loading,
        error
    };
};
