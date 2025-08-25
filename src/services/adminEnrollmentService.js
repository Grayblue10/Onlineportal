import api from './api';

const adminEnrollmentService = {
  // Search students by query (name/email/id)
  searchStudents: async (query, limit = 10) => {
    const resp = await api.get('/api/admin/students/search', { params: { query, limit } });
    return resp.data?.data ?? resp.data ?? [];
  },

  // List students (paged)
  listStudents: async ({ page = 1, limit = 50, search } = {}) => {
    const params = { role: 'student', page, limit };
    if (search) params.search = search;
    const resp = await api.get('/api/admin/users', { params });
    const data = resp.data?.data ?? resp.data ?? [];
    const pagination = resp.data?.pagination;
    return { data: Array.isArray(data) ? data : [], pagination };
  },

  // Delete a user by ID (student)
  deleteUser: async (userId) => {
    const resp = await api.delete(`/api/admin/users/${userId}`);
    return resp.data;
  },

  // Update a user by ID (e.g., yearLevel, name, etc.)
  updateUser: async (userId, payload) => {
    const resp = await api.put(`/api/admin/users/${userId}`, payload);
    return resp.data?.data ?? resp.data;
  },

  // Fetch enrollments for a specific student. Try multiple shapes/endpoints.
  getStudentEnrollments: async (studentId) => {
    // Preferred: RESTful nested route
    try {
      const r1 = await api.get(`/api/admin/students/${studentId}/enrollments`);
      const data = r1.data?.data ?? r1.data ?? [];
      return Array.isArray(data) ? data : (data.enrollments || []);
    } catch (e1) {
      // Fallback: collection with filter
      try {
        const r2 = await api.get('/api/admin/enrollments', { params: { studentId } });
        const data = r2.data?.data ?? r2.data ?? [];
        return Array.isArray(data) ? data : (data.enrollments || []);
      } catch (e2) {
        // Fallback: teacher endpoint proxy if available
        try {
          const r3 = await api.get(`/api/teacher/enrollments`, { params: { studentId } });
          const data = r3.data?.data ?? r3.data ?? [];
          return Array.isArray(data) ? data : (data.enrollments || []);
        } catch (e3) {
          console.error('[AdminEnrollmentService] Failed to fetch enrollments for student', studentId, e3);
          throw e3;
        }
      }
    }
  },

  // Delete/unenroll a specific enrollment record. Prefer DELETE by enrollmentId, with fallbacks.
  deleteEnrollment: async ({ enrollmentId, studentId, subjectId, semester, academicYear }) => {
    // Preferred: DELETE by id
    if (enrollmentId) {
      try {
        const r1 = await api.delete(`/api/admin/enrollments/${enrollmentId}`);
        return r1.data;
      } catch (e1) {
        // continue to fallbacks
      }
    }

    // Fallback: nested under student
    if (studentId && (enrollmentId || subjectId)) {
      try {
        const r2 = await api.delete(`/api/admin/students/${studentId}/enrollments`, {
          data: { enrollmentId, subjectId, semester, academicYear }
        });
        return r2.data;
      } catch (e2) {
        // continue to final fallback
      }
    }

    // Final fallback: POST to an unenroll action
    const r3 = await api.post('/api/admin/students/unenroll', {
      studentId,
      subjectId,
      enrollmentId,
      semester,
      academicYear,
    });
    return r3.data;
  }
};

export default adminEnrollmentService;
