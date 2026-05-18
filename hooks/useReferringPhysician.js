import { physicianApi } from '@/lib/api';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useReferringPhysician = () => {
  const [loading, setLoading] = useState(false);
  const [physicians, setPhysicians] = useState([]);
  const [physician, setPhysician] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    specialties: [],
  });

  // Get all physicians with pagination and filters
  const getPhysicians = useCallback(async (page = 1, limit = 10, search = '', status = '', specialty = '') => {
    setLoading(true);
    try {
      const response = await physicianApi.list({
        page,
        limit,
        q: search,
        is_active: status,
        specialty,
      });
      
      if (response.data.success) {
        setPhysicians(response.data.data || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
        if (response.data.filters) {
          setFilters(response.data.filters);
        }
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching physicians:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch physicians');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get physician by ID
  const getPhysicianById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await physicianApi.getById(id);
      
      if (response.data.success) {
        setPhysician(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching physician:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch physician details');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create physician
  const createPhysician = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await physicianApi.create(data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Doctor added successfully');
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating physician:', error);
      toast.error(error.response?.data?.message || 'Failed to add doctor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update physician
  const updatePhysician = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const response = await physicianApi.edit(id, data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Doctor updated successfully');
        return response.data.data;
      }
    } catch (error) {
      console.error('Error updating physician:', error);
      toast.error(error.response?.data?.message || 'Failed to update doctor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete physician
  const deletePhysician = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await physicianApi.delete(id);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Doctor deleted successfully');
        return true;
      }
    } catch (error) {
      console.error('Error deleting physician:', error);
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search physicians
  const searchPhysicians = useCallback(async (query) => {
    setLoading(true);
    try {
      const response = await physicianApi.search(query);
      
      if (response.data.success) {
        return response.data.data || [];
      }
    } catch (error) {
      console.error('Error searching physicians:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle physician status (active/inactive)
  const togglePhysicianStatus = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await physicianApi.toggleStatus(id);
      
      if (response.data.success) {
        toast.success(response.data.message);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    physicians,
    physician,
    pagination,
    filters,
    getPhysicians,
    getPhysicianById,
    createPhysician,
    updatePhysician,
    deletePhysician,
    searchPhysicians,
    togglePhysicianStatus,
  };
};