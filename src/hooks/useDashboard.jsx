import { useState, useEffect, useContext } from 'react';
import { useAuth } from './useAuth';
import { getDashboardData } from '../services/dashboardService';

/**
 * Custom hook for dashboard data and functionality
 * @param {string} userRole - Current user's role
 * @returns {Object} Dashboard data and functions
 */
export const useDashboard = (userRole) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  /**
   * Fetch dashboard data based on user role
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get data based on user role
      const data = await getDashboardData(userRole, user.id);
      setDashboardData(data);
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (userRole && user?.id) {
      fetchDashboardData();
    }
  }, [userRole, user?.id]);

  /**
   * Refresh dashboard data
   */
  const refreshData = async () => {
    return fetchDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refreshData,
  };
};

export default useDashboard;
