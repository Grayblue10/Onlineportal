import api from './api';

const studentService = {
  /**
   * Fetches dashboard data for student
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboard: async () => {
    try {
      const response = await api.get('/api/student/dashboard');
      return response.data.data || {
        stats: {},
        recentGrades: [],
        upcomingAssignments: [],
        announcements: []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404) {
        return { stats: {} };
      }
      throw new Error('Failed to fetch dashboard data');
    }
  },

  /**
   * Fetch the student's profile
   * @returns {Promise<Object>} Profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/student/profile');
      // Backend returns { success, data }
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  /**
   * Fetches recent grades for student
   * @returns {Promise<Array>} List of recent grades
   */
  getRecentGrades: async () => {
    try {
      const response = await api.get('/api/student/grades/recent');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent grades:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch recent grades');
    }
  },

  /**
   * Fetches academic progress for student
   * @returns {Promise<Object>} Academic progress data
   */
  getAcademicProgress: async () => {
    try {
      const response = await api.get('/api/student/progress');
      return response.data || {};
    } catch (error) {
      console.error('Error fetching academic progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch academic progress');
    }
  },

  /**
   * Fetch the student's enrolled subjects
   * @returns {Promise<Object|Array>} Subjects list or data wrapper
   */
  getSubjects: async () => {
    try {
      const response = await api.get('/api/student/subjects');
      return response.data;
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
};

export default studentService;