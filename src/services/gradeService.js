import api from './api';

/**
 * Get all grades with optional filtering
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of grades
 */
const gradeCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getGrades = async (filters = {}) => {
  const cacheKey = JSON.stringify(filters);
  const cachedData = gradeCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await api.get('/grades', { params: filters });
    gradeCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Get a single grade by ID
 * @param {string} gradeId - Grade ID
 * @returns {Promise<Object>} Grade details
 */
export const getGradeById = async (gradeId) => {
  try {
    const response = await api.get(`/grades/${gradeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Create a new grade
 * @param {Object} gradeData - Grade data
 * @returns {Promise<Object>} Created grade
 */
export const createGrade = async (gradeData) => {
  try {
    const response = await api.post('/grades', gradeData);
    return response.data;
  } catch (error) {
    console.error('Error creating grade:', error);
    throw error;
  }
};

/**
 * Update an existing grade
 * @param {string} gradeId - Grade ID
 * @param {Object} gradeData - Updated grade data
 * @returns {Promise<Object>} Updated grade
 */
export const updateGrade = async (gradeId, gradeData) => {
  try {
    const response = await api.put(`/grades/${gradeId}`, gradeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Delete a grade
 * @param {string} gradeId - Grade ID
 * @returns {Promise<void>}
 */
export const deleteGrade = async (gradeId) => {
  try {
    await api.delete(`/grades/${gradeId}`);
  } catch (error) {
    console.error(`Error deleting grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Get grades for a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} List of student's grades
 */
export const getStudentGrades = async (studentId) => {
  try {
    const response = await api.get(`/students/${studentId}/grades`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching grades for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Get grades assigned by a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} List of teacher's assigned grades
 */
export const getTeacherGrades = async (teacherId) => {
  try {
    const response = await api.get(`/teachers/${teacherId}/grades`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching grades for teacher ${teacherId}:`, error);
    throw error;
  }
};

export default {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getTeacherGrades,
};
