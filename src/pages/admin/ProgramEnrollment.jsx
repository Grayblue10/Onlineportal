import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, Search, UserPlus, ChevronDown } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import api from '../../services/api';
import { debounce } from 'lodash';


const ProgramEnrollment = () => {
  // Static list of programs/courses (no subject names)
  const PROGRAMS = useMemo(() => [
    { code: 'BSIT' },
    { code: 'BSCS' },
    { code: 'CRIMINOLOGY' },
    { code: 'BSIS' },
    { code: 'NURSING' },
    { code: 'BTLED' },
  ], []);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Student search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Enrollment fields
  const [selectedProgram, setSelectedProgram] = useState(null); // program code string
  const [semester, setSemester] = useState('first');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  // Single-select dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        setSearching(true);
        const res = await api.get('/api/admin/students/search', { params: { query, limit: 10 } });
        setSearchResults(res.data?.data || []);
      } catch (err) {
        console.error('[ProgramEnrollment] search error', err);
        toast.error('Failed to search students');
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    debouncedSearch(q);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name || '');
    setSearchResults([]);
  };

  // No subjects loading; programs are static

  // Filter programs by text
  const filteredPrograms = useMemo(() => {
    const q = subjectFilter.trim().toLowerCase();
    if (!q) return PROGRAMS;
    return PROGRAMS.filter((p) => String(p.code).toLowerCase().includes(q));
  }, [PROGRAMS, subjectFilter]);

  const selectProgram = (code) => {
    setSelectedProgram(code);
    setIsDropdownOpen(false);
  };

  const handleEnroll = async () => {
    if (!selectedStudent) return toast.error('Select a student');
    if (!selectedProgram) return toast.error('Select a course/program');

    setEnrolling(true);
    try {
      const payload = {
        studentId: selectedStudent.id,
        programCode: selectedProgram,
        semester,
        academicYear,
      };
      const res = await api.post('/api/admin/students/program', payload);
      const updated = res.data?.data;
      toast.success('Program assigned successfully');
      // Optionally reset selection
      setSelectedProgram(null);
      // Keep selected student for visibility; you can clear if desired
      // setSelectedStudent(null);
      // If needed, display updated info
      if (updated?.program?.code) {
        console.log('[ProgramEnrollment] Updated student program:', updated.program);
      }
    } catch (err) {
      console.error('[ProgramEnrollment] enroll error', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to assign program';
      toast.error(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--deep-blue)' }} />
      </div>
    );
  }

  // Selected program details
  const selectedCourse = selectedProgram ? { code: selectedProgram } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Enrollment</h1>
          <p className="text-gray-600 mt-1">Select one course to enroll the student in.</p>
        </div>
      </div>

      {/* Enrollment form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enroll Student</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, or student ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--deep-blue)' }}
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">{student.studentId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedStudent && (
                <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--emerald-green-50)', borderColor: 'var(--emerald-green-200)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--emerald-green-800)' }}>{selectedStudent.name}</p>
                      <p className="text-sm" style={{ color: 'var(--emerald-green-700)' }}>{selectedStudent.email}</p>
                    </div>
                    <CheckCircle className="h-5 w-5" style={{ color: 'var(--emerald-green)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Semester and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--deep-blue)' }}
                >
                  <option value="first">First Semester</option>
                  <option value="second">Second Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="number"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--deep-blue)' }}
                />
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-4">
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course/Program</label>
              <button
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onClick={() => setIsDropdownOpen((o) => !o)}
              >
                <span className="block truncate">{!selectedCourse ? 'Choose a course/program...' : `${selectedCourse.code}`}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      placeholder="Search by program code (e.g., BSIT, CRIMINOLOGY)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredPrograms.map((p) => (
                      <button
                        type="button"
                        key={p.code}
                        onClick={() => selectProgram(p.code)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm ${selectedProgram === p.code ? 'bg-indigo-50' : ''}`}
                      >
                        <p className="font-medium text-gray-900">{p.code}</p>
                      </button>
                    ))}
                    {filteredPrograms.length === 0 && (
                      <div className="px-3 py-4 text-sm text-gray-500">No programs found</div>
                    )}
                  </div>
                  <div className="p-2 border-t text-xs text-gray-600 flex justify-end">
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected course summary */}
            {selectedCourse && (
              <div className="text-sm text-gray-700">
                Selected: <span className="font-medium">{selectedCourse.code}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleEnroll}
              disabled={!selectedStudent || !selectedProgram || enrolling}
              loading={enrolling}
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Program
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgramEnrollment;
