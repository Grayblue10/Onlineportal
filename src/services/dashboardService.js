import api from './api';

/**
 * Get dashboard data based on user role
 * @param {string} role - User role (admin, teacher)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboardData = async (role, userId) => {
  try {
    let response;
    
    switch (role) {
      case 'admin':
        response = await api.get('/api/dashboard/admin');
        break;
      case 'teacher':
        response = await api.get(`/api/dashboard/teacher/${userId}`);
        break;
      default:
        throw new Error('Invalid user role for dashboard (admin, teacher only)');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Get statistics for the dashboard
 * @param {string} role - User role (admin, teacher)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics data
 */
export const getDashboardStats = async (role, userId) => {
  try {
    if (role !== 'admin' && role !== 'teacher') {
      throw new Error('Invalid user role for dashboard stats (admin, teacher only)');
    }
    const response = await api.get(`/api/stats/${role}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get recent activities
 * @param {string} role - User role (admin, teacher)
 * @param {string} userId - User ID
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} List of recent activities
 */
export const getRecentActivities = async (role, userId, limit = 5) => {
  try {
    if (role !== 'admin' && role !== 'teacher') {
      throw new Error('Invalid user role for recent activities (admin, teacher only)');
    }
    const response = await api.get(`/api/activities/${role}/${userId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Get upcoming deadlines
 * @param {string} role - User role (admin, teacher)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of upcoming deadlines
 */
export const getUpcomingDeadlines = async (role, userId) => {
  try {
    if (role !== 'admin' && role !== 'teacher') {
      throw new Error('Invalid user role for deadlines (admin, teacher only)');
    }
    const response = await api.get(`/api/deadlines/${role}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error);
    throw error;
  }
};

export default {
  getDashboardData,
  getDashboardStats,
  getRecentActivities,
  getUpcomingDeadlines,
};
