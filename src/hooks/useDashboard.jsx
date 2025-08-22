import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { getDashboardData } from '../services/dashboardService';

/**
 * Custom hook for dashboard data and functionality (admin, teacher only)
 * Student dashboard is intentionally not supported and will throw.
 * @param {string} userRole - Current user's role
 * @returns {{dashboardData: any, loading: boolean, error: string|null, refreshData: Function}}
 */
export const useDashboard = (userRole) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (userRole === 'student') {
      // Explicitly disallow student dashboard via this hook
      const msg = 'Student dashboard is not supported via useDashboard. Use student pages/services directly.';
      setError(msg);
      setDashboardData(null);
      setLoading(false);
      throw new Error(msg);
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData(userRole, user?.id);
      setDashboardData(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userRole || !user?.id) return;
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, user?.id]);

  const refreshData = async () => fetchDashboardData();

  return { dashboardData, loading, error, refreshData };
};

export default useDashboard;
