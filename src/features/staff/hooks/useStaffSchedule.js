import { useState, useCallback } from "react";
import {
    createStaffScheduleApi,
    updateStaffScheduleApi,
    getStaffScheduleApi,
    deleteStaffScheduleApi
} from "../service/staffService";

export const useStaffSchedule = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [schedules, setSchedules] = useState([]);

    const fetchSchedules = useCallback(async (staffId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getStaffScheduleApi(staffId);
            setSchedules(res.data?.data || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch staff schedules.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addSchedule = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await createStaffScheduleApi(data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create schedule.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const editSchedule = useCallback(async (scheduleId, data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateStaffScheduleApi(scheduleId, data);
            return { success: true, data: res.data?.data || res.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update schedule.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeSchedule = useCallback(async (scheduleId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await deleteStaffScheduleApi(scheduleId);
            setSchedules(prev => prev.filter(s => s.scheduleId !== scheduleId));
            return { success: true, message: res.data?.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete schedule.");
            return { success: false, message: err.response?.data?.message };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        schedules,
        fetchSchedules,
        addSchedule,
        editSchedule,
        removeSchedule
    };
};
