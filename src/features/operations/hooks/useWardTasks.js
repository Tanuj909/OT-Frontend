import { useState, useCallback } from 'react';
import { wardTasksService } from '../services/wardTasksService';
import { toast } from 'react-hot-toast';

export const useWardTasks = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createTask = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardTasksService.createTask(data);
            toast.success('Task assigned successfully');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to assign task';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const completeTask = async (taskId, data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardTasksService.completeTask(taskId, data);
            toast.success('Task marked as completed');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to complete task';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const cancelTask = async (taskId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await wardTasksService.cancelTask(taskId);
            toast.success('Task cancelled');
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cancel task';
            setError(msg);
            toast.error(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchTasksByAdmission = useCallback(async (admissionId) => {
        setLoading(true);
        try {
            const response = await wardTasksService.getByAdmission(admissionId);
            return response.data;
        } catch (err) {
            console.error('Error fetching tasks by admission:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTasksByOperationStatus = useCallback(async (operationId, status) => {
        setLoading(true);
        try {
            const response = await wardTasksService.getByOperationStatus(operationId, status);
            return response.data;
        } catch (err) {
            console.error('Error fetching tasks by status:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createTask,
        completeTask,
        cancelTask,
        fetchTasksByAdmission,
        fetchTasksByOperationStatus,
        loading,
        error
    };
};
