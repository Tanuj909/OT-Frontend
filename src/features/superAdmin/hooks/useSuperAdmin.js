import { useState, useCallback } from "react";
import {
  createHospitalApi,
  getAllHospitalsApi,
  getHospitalByIdApi,
  updateHospitalApi,
  createAdminApi,
  getAdminByIdApi,
  getAllAdminsApi,
  mapAdminToHospitalApi,
  updateAdminHospitalMappingApi,
  getAdminsByHospitalApi,
} from "../service/superAdminApi";

export const useSuperAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [hospitalAdmins, setHospitalAdmins] = useState([]);

    // ─── Hospital Hooks ──────────────────────────────────────────
    const fetchHospitals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAllHospitalsApi();
            setHospitals(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch hospitals.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHospitalById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getHospitalByIdApi(id);
            setSelectedHospital(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch hospital details.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const addHospital = useCallback(async (hospitalData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createHospitalApi(hospitalData);
            setHospitals((prev) => [...prev, response.data]);
            return { success: true, message: response.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create hospital.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const editHospital = useCallback(async (id, hospitalData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateHospitalApi(id, hospitalData);
            setHospitals((prev) => prev.map(h => h.id === id ? response.data : h));
            return { success: true, message: response.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to edit hospital.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Admin Hooks ───────────────────────────────────────────────
    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAllAdminsApi();
            setAdmins(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch admins.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addAdmin = useCallback(async (adminData) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await createAdminApi(adminData);
            setAdmins((prev) => [...prev, response.data]);
            return { success: true, message: response.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create admin.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAdminsByHospital = useCallback(async (hospitalId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await getAdminsByHospitalApi(hospitalId);
            setHospitalAdmins(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch hospital admins.");
        } finally {
            setLoading(false);
        }
    }, []);

    const mapAdminToHospital = useCallback(async (hospitalId, adminId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await mapAdminToHospitalApi(hospitalId, adminId);
            return { success: true, message: response.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to map admin.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAdminMapping = useCallback(async (hospitalId, adminId) => {
        setLoading(true);
        setError(null);
        try {
            const { data: response } = await updateAdminHospitalMappingApi(hospitalId, adminId);
            return { success: true, message: response.message };
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update admin mapping.");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        loading,
        error,
        hospitals,
        selectedHospital,
        admins,
        hospitalAdmins,
        fetchHospitals,
        fetchHospitalById,
        addHospital,
        editHospital,
        fetchAdmins,
        addAdmin,
        fetchAdminsByHospital,
        mapAdminToHospital,
        updateAdminMapping,
    };
};
