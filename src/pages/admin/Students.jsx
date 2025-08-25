import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users, CheckCircle2, XCircle, Loader2, CreditCard, Mail, Hash, BookOpen, User2, Trash2, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui';
import adminEnrollmentService from '../../services/adminEnrollmentService';
import { debounce } from 'lodash';

const Students = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingYear, setSavingYear] = useState(false);
  // All students list (bottom)
  const [allStudents, setAllStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const runSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSelected(null);
      setEnrollments([]);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await adminEnrollmentService.searchStudents(q, 20);
      const list = Array.isArray(data) ? data : (data.results || data.students || []);
      setResults(list);
    } catch (err) {
      console.error('[Admin Students] search failed', err);
      setError('Failed to search students.');
      toast.error('Failed to search students');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounced = useMemo(() => debounce(runSearch, 300), [runSearch]);

  const onChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    debounced(q);
  };

  const applyYearLevelLocal = (id, yearLevel) => {
    setSelected(prev => prev ? ({ ...prev, yearLevel }) : prev);
    setResults(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, yearLevel } : r)));
    setAllStudents(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, yearLevel } : r)));
  };

  const handleYearLevelChange = async (e) => {
    const val = Number(e.target.value);
    if (!selected || !val) return;
    const id = selected._id || selected.id;
    try {
      setSavingYear(true);
      await adminEnrollmentService.updateUser(id, { yearLevel: val });
      applyYearLevelLocal(id, val);
      toast.success('Year level updated');
    } catch (err) {
      console.error('[Admin Students] Failed to update year level', err);
      toast.error('Failed to update year level');
    } finally {
      setSavingYear(false);
    }
  };

  const selectStudent = async (s) => {
    setSelected(s);
    // Attempt to fetch enrolled subjects for the selected student
    const sid = s._id || s.id;
    if (!sid) {
      setEnrollments([]);
      return;
    }
    try {
      setLoadingDetails(true);
      // Fetch enrollments
      const [enrData, detailed] = await Promise.all([
        adminEnrollmentService.getStudentEnrollments(sid),
        // Try to fetch a detailed student record (with program) using email/name as search
        (async () => {
          try {
            const search = s.email || s.username || s.name || displayName(s);
            if (!search) return null;
            const resp = await adminEnrollmentService.listStudents({ page: 1, limit: 5, search });
            const arr = Array.isArray(resp?.data) ? resp.data : [];
            // Prefer exact id match; fallback to email match
            const match = arr.find(u => (u._id || u.id) === sid) || arr.find(u => u.email && (u.email === s.email));
            return match || null;
          } catch (_) { return null; }
        })()
      ]);
      setEnrollments(Array.isArray(enrData) ? enrData : (enrData?.enrollments || []));
      if (detailed) {
        setSelected(prev => ({
          ...prev,
          ...(detailed.program ? { program: detailed.program } : {}),
          ...(detailed.yearLevel ? { yearLevel: detailed.yearLevel } : {})
        }));
      }
    } catch (err) {
      console.error('[Admin Students] failed to load enrollments/profile', err);
      setEnrollments([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const displayName = (s) => s?.name || `${s?.firstName || ''} ${s?.lastName || ''}`.trim();
  const studentNumber = (s) => s?.studentId || s?.studentNumber || s?.student_id || s?.student_no;

  const loadAll = async (nextPage = 1) => {
    try {
      setLoadingAll(true);
      const { data, pagination } = await adminEnrollmentService.listStudents({ page: nextPage, limit: 20 });
      setAllStudents(prev => nextPage === 1 ? data : [...prev, ...data]);
      setHasMore(pagination ? nextPage < (pagination.pages || 1) : data.length > 0);
      setPage(nextPage);
    } catch (err) {
      console.error('[Admin Students] failed to load all students', err);
      toast.error('Failed to load students');
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    loadAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (user) => {
    const id = user._id || user.id;
    if (!id) return;
    const confirm = window.confirm(`Delete student "${displayName(user)}"? This cannot be undone.`);
    if (!confirm) return;
    try {
      setDeletingId(id);
      await adminEnrollmentService.deleteUser(id);
      // Remove from lists
      setAllStudents(prev => prev.filter(u => (u._id || u.id) !== id));
      setResults(prev => prev.filter(u => (u._id || u.id) !== id));
      if ((selected?._id || selected?.id) === id) {
        setSelected(null);
        setEnrollments([]);
      }
      toast.success('Student deleted');
    } catch (err) {
      console.error('[Admin Students] delete failed', err);
      toast.error(err?.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Search and verify student records by ID or name</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={onChange}
              placeholder="Enter student ID or name..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': 'var(--deep-blue)' }}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {results.length === 0 && query.trim().length >= 2 && !loading && (
            <div className="text-sm text-gray-500">No students found.</div>
          )}
          {results.map((s) => (
            <button
              key={s.id || s._id}
              type="button"
              onClick={() => selectStudent(s)}
              className={`w-full p-3 border rounded-lg bg-white flex items-center justify-between text-left transition hover:bg-gray-50 ${
                (selected?._id || selected?.id) === (s._id || s.id) ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                  {displayName(s)?.slice(0,2)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{displayName(s)}</p>
                  <p className="text-sm text-gray-600">{s.email || s.username}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" />{studentNumber(s) || '—'}</span>
                    {s.program && <span>{typeof s.program === 'string' ? s.program : s.program?.code}</span>}
                    <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" />Y{s.yearLevel || s.year || '—'}</span>
                    {s.department && <span>{s.department}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {s.isActive || s.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-xs">
                    <XCircle className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: basic info */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-semibold text-xl">
                  {displayName(selected)?.[0]?.toUpperCase()}{displayName(selected)?.split(' ')?.[1]?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{displayName(selected)}</div>
                  <div className="text-sm text-gray-500">Student</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                    <Hash size={18} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Student Number</div>
                    <div className="font-medium text-gray-900 break-all">{studentNumber(selected) || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                    <GraduationCap size={18} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Year Level</div>
                      <div className="font-medium text-gray-900 break-all">
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={selected?.yearLevel || ''}
                          onChange={handleYearLevelChange}
                          disabled={savingYear}
                        >
                          <option value="" disabled>Select</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>
                    </div>
                    {savingYear && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900 break-all">{selected.email || selected.username || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Program</div>
                    <div className="font-medium text-gray-900 break-all">{
                      selected.program
                        ? (typeof selected.program === 'string'
                            ? selected.program
                            : `${selected.program.code || ''}${selected.program.semester ? ` • ${selected.program.semester} sem` : ''}${selected.program.academicYear ? ` • ${selected.program.academicYear}` : ''}`)
                        : 'Not assigned'
                    }</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: enrolled subjects */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-yellow-700" />
                <h2 className="font-semibold text-gray-900">Enrolled Subjects</h2>
                {loadingDetails && <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
              </div>

              {(!enrollments || enrollments.length === 0) ? (
                <div className="text-gray-500 text-sm">No enrolled subjects found.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {enrollments.map((enr) => {
                    const subj = enr.subject || enr.subjectId || {};
                    return (
                      <div key={enr._id || `${subj._id || subj.id}-${enr.semester || ''}-${enr.academicYear || ''}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{subj.name || subj.title || 'Unknown Subject'}</div>
                            <div className="text-sm text-gray-500">{subj.code || '—'}</div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700">{subj.units || 3} units</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">{subj.description || '—'}</div>
                        {(enr.teacherName || enr.teacher?.name) && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <User2 size={16} />
                            <span>{enr.teacherName || enr.teacher?.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Students (scrollable) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">All Students</h2>
            {loadingAll && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
          <div className="border rounded-lg max-h-80 overflow-y-auto divide-y">
            {allStudents.length === 0 && !loadingAll && (
              <div className="p-4 text-sm text-gray-500">No students found.</div>
            )}
            {allStudents.map((u) => (
              <div key={u._id || u.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-semibold">
                    {displayName(u)?.slice(0,2)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{displayName(u)}</div>
                    <div className="text-xs text-gray-600">{u.email || '—'} • {studentNumber(u) || '—'} • Y{u.yearLevel || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md text-xs hover:bg-red-100 disabled:opacity-50"
                    onClick={() => handleDelete(u)}
                    disabled={deletingId === (u._id || u.id)}
                    title="Delete student"
                  >
                    <Trash2 className="h-3 w-3" /> {deletingId === (u._id || u.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="mt-3 flex justify-center">
              <button
                className="px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => loadAll(page + 1)}
                disabled={loadingAll}
              >
                {loadingAll ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Students;
