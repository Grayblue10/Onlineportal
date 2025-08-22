import React, { useState, useCallback } from 'react';
import { Search, Trash2, Users, BookOpen, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, Card, Modal } from '../../components/ui';
import { debounce } from 'lodash';
import adminEnrollmentService from '../../services/adminEnrollmentService';

const EnrollmentManagement = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, enrollment: null });
  const [deleting, setDeleting] = useState(false);

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        setSearching(true);
        const data = await adminEnrollmentService.searchStudents(q.trim(), 10);
        setResults(data || []);
      } catch (e) {
        console.error('[EnrollmentManagement] search error', e);
        toast.error('Failed to search students');
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  const onChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    doSearch(v);
  };

  const selectStudent = async (s) => {
    setStudent(s);
    setQuery(s.name || '');
    setResults([]);
    await loadEnrollments(s.id || s._id || s.studentId);
  };

  const loadEnrollments = async (sid) => {
    if (!sid) return;
    try {
      setLoadingEnrollments(true);
      const data = await adminEnrollmentService.getStudentEnrollments(sid);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[EnrollmentManagement] load enrollments error', e);
      toast.error('Failed to load student enrollments');
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const onDelete = async () => {
    if (!confirm.enrollment || !student) return;
    try {
      setDeleting(true);
      const enr = confirm.enrollment;
      await adminEnrollmentService.deleteEnrollment({
        enrollmentId: enr._id || enr.id,
        studentId: student.id || student._id || student.studentId,
        subjectId: enr.subject?._id || enr.subjectId,
        semester: enr.semester || enr.term,
        academicYear: enr.academicYear || enr.year,
      });
      toast.success('Enrollment removed');
      setConfirm({ open: false, enrollment: null });
      await loadEnrollments(student.id || student._id || student.studentId);
    } catch (e) {
      console.error('[EnrollmentManagement] delete error', e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to remove enrollment';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Student Enrollments</h1>
          <p className="text-gray-600 mt-1">Search a student, view enrolled subjects, and remove incorrect enrollments</p>
        </div>
      </div>

      {/* Search and selection */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={onChange}
                placeholder="Search by name, email, or student ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {results.map((s) => (
                  <div key={s.id || s._id} onClick={() => selectStudent(s)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-sm text-gray-600">{s.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">{s.studentId || s.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {student && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-emerald-800">{student.name}</p>
                    <p className="text-sm text-emerald-700">{student.email}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="mt-4 p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Note</p>
                <p>Deleting an enrollment immediately frees a slot in the class and removed it from the student's load.</p>
              </div>
            </div>
          </div>

          {/* Stats/legend */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100"><Users className="h-5 w-5 text-blue-700" /></div>
                <div>
                  <p className="text-sm text-blue-800">Use the search to select a student and manage their enrollments.</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100"><BookOpen className="h-5 w-5 text-gray-700" /></div>
                <div>
                  <p className="text-sm text-gray-700">You can remove a subject if it was assigned by mistake.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrollments list */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Enrollments</h2>
          {loadingEnrollments && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
        </div>
        {!student && (
          <div className="text-center py-12 text-gray-500">
            Select a student to view their enrolled subjects.
          </div>
        )}
        {student && !loadingEnrollments && enrollments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No enrollments found for this student.
          </div>
        )}
        {student && enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enr) => (
              <div key={enr._id || enr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{enr.subject?.code} - {enr.subject?.name}</p>
                    <p className="text-sm text-gray-600">{(enr.semester || enr.term || '').toString().replace('first', 'First Semester').replace('second', 'Second Semester')}</p>
                    <p className="text-xs text-gray-500">AY: {enr.academicYear || enr.year || 'N/A'}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirm({ open: true, enrollment: enr })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, enrollment: null })}
        title="Confirm Delete Enrollment"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to remove this enrollment from the student?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm({ open: false, enrollment: null })}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnrollmentManagement;
