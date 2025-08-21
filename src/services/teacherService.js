import api from './api';

// Cache storage
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to handle API calls with caching
const fetchWithCache = async (cacheKey, apiCall) => {
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`[TeacherService] Returning cached data for ${cacheKey}`);
    return cachedData.data;
  }

  try {
    console.log(`[TeacherService] Fetching fresh data for ${cacheKey}`);
    const response = await apiCall();
    
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    console.error(`[TeacherService] Error fetching ${cacheKey}:`, error);
    throw error;
  }
};

const teacherService = {
  // Get teacher dashboard data
  getDashboard: async () => {
    return fetchWithCache('teacher_dashboard', () => 
      api.get('/api/teacher/dashboard')
    );
  },

  // Delete a grade
  deleteGrade: async (gradeId) => {
    console.log('[TeacherService] Deleting grade:', gradeId);
    try {
      const response = await api.delete(`/api/teacher/grades/${gradeId}`);
      // Clear relevant caches
      cache.forEach((_, key) => {
        if (key.startsWith('grades_')) cache.delete(key);
      });
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error deleting grade:', error);
      throw error;
    }
  },

  
  
  // Get teacher's classes
  getClasses: async () => {
    return fetchWithCache('teacher_classes', () =>
      api.get('/api/teacher/classes')
    );
  },

  // Get grades with filters
  getGrades: async (filters = {}) => {
    return fetchWithCache(`grades_${JSON.stringify(filters)}`, () =>
      api.get('/api/teacher/grades', { params: filters })
    );
  },

  // Create a new grade
  createGrade: async (gradeData) => {
    console.log('[TeacherService] Creating grade:', gradeData);
    try {
      const response = await api.post('/api/teacher/grades', gradeData);
      // Clear relevant caches
      cache.forEach((_, key) => {
        if (key.startsWith('grades_')) cache.delete(key);
      });
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error creating grade:', error);
      throw error;
    }
  },

  // Update a grade
  updateGrade: async (gradeId, gradeData) => {
    console.log('[TeacherService] Updating grade:', { gradeId, gradeData });
    try {
      const response = await api.put(`/api/teacher/grades/${gradeId}`, gradeData);
      // Clear relevant caches
      cache.forEach((_, key) => {
        if (key.startsWith('grades_')) cache.delete(key);
      });
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error updating grade:', error);
      throw error;
    }
  },

  // Get assigned subjects
  getAssignedSubjects: async () => {
    return fetchWithCache('teacher_subjects', () =>
      api.get('/api/teacher/subjects')
    );
  },
  
  // Get enrolled students
  getEnrolledStudents: async () => {
    return fetchWithCache('enrolled_students', () =>
      api.get('/api/teacher/enrolled-students')
    );
  },

  // Export enrolled students data
  exportEnrolledStudents: async (options = {}) => {
    console.log('[TeacherService] Exporting enrolled students:', options);
    try {
      const response = await api.get('/api/teacher/enrolled-students/export', {
        params: options,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('[TeacherService] Error exporting enrolled students:', error);
      throw error;
    }
  },
  
  // Get students enrolled in a specific class
  getClassStudents: async (classId) => {
    return fetchWithCache(`class_${classId}_students`, () =>
      api.get(`/api/teacher/classes/${classId}/students`)
    );
  },
  
  // Get assignments for a class
  getClassAssignments: async (classId) => {
    return fetchWithCache(`class_${classId}_assignments`, () =>
      api.get(`/api/teacher/classes/${classId}/assignments`)
    );
  },
  
  // Create a new assignment
  createAssignment: async (classId, assignmentData) => {
    console.log('[TeacherService] Creating assignment:', { classId, assignmentData });
    try {
      const response = await api.post(`/api/teacher/classes/${classId}/assignments`, assignmentData);
      // Invalidate relevant caches
      cache.delete(`class_${classId}_assignments`);
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error creating assignment:', error);
      throw error;
    }
  },
  
  // Update an assignment
  updateAssignment: async (classId, assignmentId, assignmentData) => {
    console.log(`[TeacherService] Updating assignment ${assignmentId}:`, assignmentData);
    try {
      const response = await api.put(`/api/teacher/classes/${classId}/assignments/${assignmentId}`, assignmentData);
      // Invalidate relevant caches
      cache.delete(`class_${classId}_assignments`);
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error updating assignment:', error);
      throw error;
    }
  },
  
  // Delete an assignment
  deleteAssignment: async (classId, assignmentId) => {
    console.log(`[TeacherService] Deleting assignment ${assignmentId}`);
    try {
      await api.delete(`/api/teacher/classes/${classId}/assignments/${assignmentId}`);
      // Invalidate relevant caches
      cache.delete(`class_${classId}_assignments`);
    } catch (error) {
      console.error('[TeacherService] Error deleting assignment:', error);
      throw error;
    }
  },
  
  // Get grades for a class
  getClassGrades: async (classId) => {
    return fetchWithCache(`class_${classId}_grades`, () =>
      api.get(`/api/teacher/classes/${classId}/grades`)
    );
  },
  
  // Update student grade
  updateStudentGrade: async (classId, studentId, gradeData) => {
    console.log(`[TeacherService] Updating grade for student ${studentId}:`, gradeData);
    try {
      const response = await api.put(
        `/api/teacher/classes/${classId}/students/${studentId}/grade`,
        gradeData
      );
      // Invalidate relevant caches
      cache.delete(`class_${classId}_grades`);
      cache.delete(`class_${classId}_student_${studentId}_grades`);
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error updating grade:', error);
      throw error;
    }
  },
  
  // Get a student's grades in a class
  getStudentGrades: async (classId, studentId) => {
    return fetchWithCache(`class_${classId}_student_${studentId}_grades`, () =>
      api.get(`/api/teacher/classes/${classId}/students/${studentId}/grades`)
    );
  },
  
  // Get all students
  getStudents: async (params = {}) => {
    return fetchWithCache(`students_${JSON.stringify(params)}`, () =>
      api.get('/api/teacher/students', { params })
    );
  },
  
  // Get student details
  getStudentDetails: async (studentId) => {
    return fetchWithCache(`student_${studentId}_details`, () =>
      api.get(`/api/teacher/students/${studentId}`)
    );
  },
  
  // Upload assignment submissions
  uploadAssignmentSubmissions: async (classId, assignmentId, formData) => {
    console.log(`[TeacherService] Uploading submissions for assignment ${assignmentId}`);
    try {
      const response = await api.post(
        `/api/teacher/classes/${classId}/assignments/${assignmentId}/submissions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Invalidate relevant caches
      cache.delete(`class_${classId}_assignments`);
      cache.delete(`class_${classId}_assignment_${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error uploading submissions:', error);
      throw error;
    }
  },
  
  // Clear cache for specific keys or all
  clearCache: (key) => {
    if (key) {
      console.log(`[TeacherService] Clearing cache for key: ${key}`);
      cache.delete(key);
    } else {
      console.log('[TeacherService] Clearing all cache');
      cache.clear();
    }
  },

  

  // Get available subjects for assignment
  getAvailableSubjects: async () => {
    return fetchWithCache('available_subjects', () =>
      api.get('/api/teacher/available-subjects')
    );
  },

  // Assign subjects to teacher
  assignSubjects: async (subjectIds) => {
    console.log('[TeacherService] Assigning subjects:', subjectIds);
    try {
      const response = await api.post('/api/teacher/assign-subjects', { subjectIds });
      // Clear relevant caches
      cache.delete('teacher_subjects');
      cache.delete('teacher_classes');
      cache.delete('available_subjects');
      cache.delete('teacher_dashboard');
      return response.data;
    } catch (error) {
      console.error('[TeacherService] Error assigning subjects:', error);
      throw error;
    }
  }
};

export default teacherService;
