import api from './api';

const adminClassService = {
  // Unassign a teacher from a subject for a specific semester/year.
  // If deleteIfEmpty=true and the class has no students, the class will be deleted.
  unassignTeacherFromSubject: async ({ teacherId, subjectId, semester, academicYear, deleteIfEmpty = false }) => {
    const resp = await api.delete('/api/admin/teachers/unassign', {
      data: { teacherId, subjectId, semester, academicYear, deleteIfEmpty }
    });
    return resp.data;
  },

  // Delete a class by ID. Fails if students are enrolled unless force=true.
  deleteClass: async ({ id, force = false }) => {
    const resp = await api.delete(`/api/admin/classes/${id}`, {
      params: force ? { force: 'true' } : undefined
    });
    return resp.data;
  }
};

export default adminClassService;
