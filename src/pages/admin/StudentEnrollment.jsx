import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Users, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import api from '../../services/api';
import { debounce } from 'lodash';

const StudentEnrollment = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [semester, setSemester] = useState('first');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Schedule state
  const [schedule, setSchedule] = useState({
    days: [],
    startTime: '',
    endTime: '',
    room: ''
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        console.log('[StudentEnrollment] Searching for students:', query);
        
        const response = await api.get('/api/admin/students/search', {
          params: { query, limit: 10 }
        });
        
        console.log('[StudentEnrollment] Search results:', response.data);
        setSearchResults(response.data.data || []);
      } catch (error) {
        console.error('[StudentEnrollment] Search error:', error);
        toast.error('Failed to search students');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  // Fetch subjects and enrollment stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[StudentEnrollment] Fetching subjects and stats');
        
        const [subjectsResponse, statsResponse] = await Promise.all([
          api.get('/api/admin/subjects'),
          api.get('/api/admin/enrollment/stats', {
            params: { semester, academicYear }
          })
        ]);
        
        setSubjects(subjectsResponse.data.data || []);
        // Normalize stats payload to a consistent shape
        const rawStats = statsResponse?.data?.data ?? statsResponse?.data ?? null;
        const normalizedStats = rawStats ? {
          // Prefer classes with an assigned teacher if available to reflect assignment status accurately
          totalClasses: (
            rawStats?.overview?.classesWithTeacher ??
            rawStats?.classesWithTeacher ??
            rawStats?.overview?.totalClasses ??
            rawStats?.totalClasses ??
            rawStats?.classesCount ??
            rawStats?.classes ?? 0
          ),
          totalEnrolledStudents: (
            rawStats?.overview?.totalEnrolledStudents ??
            rawStats?.totalEnrolledStudents ??
            rawStats?.enrolledCount ??
            rawStats?.enrollments ?? 0
          )
        } : null;
        setEnrollmentStats(normalizedStats);
        
        console.log('[StudentEnrollment] Loaded subjects:', subjectsResponse.data.data?.length);
        console.log('[StudentEnrollment] Enrollment stats:', statsResponse.data.data);
      } catch (error) {
        console.error('[StudentEnrollment] Error fetching data:', error);
        toast.error('Failed to load enrollment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [semester, academicYear]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setSearchResults([]);
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  // Handle enrollment
  const handleEnroll = async () => {
    if (!selectedStudent || !selectedSubject) {
      toast.error('Please select both a student and a subject');
      return;
    }

    if (schedule.days.length === 0 || !schedule.startTime || !schedule.endTime) {
      toast.error('Please complete the schedule information');
      return;
    }

    try {
      setEnrolling(true);
      setErrorMsg('');
      console.log('[StudentEnrollment] Enrolling student:', {
        studentId: selectedStudent.id,
        subjectId: selectedSubject,
        semester,
        academicYear,
        schedule
      });

      const response = await api.post('/api/admin/students/enroll', {
        studentId: selectedStudent.id,
        subjectId: selectedSubject,
        semester,
        academicYear,
        schedule: {
          days: schedule.days,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room
        }
      });

      console.log('[StudentEnrollment] Enrollment successful:', response.data);
      
      toast.success(
        `Successfully enrolled ${selectedStudent.name} in ${response.data.data.subject.name}`
      );

      // Reset form
      setSelectedStudent(null);
      setSearchQuery('');
      setSelectedSubject('');
      setSchedule({
        days: [],
        startTime: '',
        endTime: '',
        room: ''
      });
      
      // Refresh and normalize enrollment stats
      const statsResponse = await api.get('/api/admin/enrollment/stats', {
        params: { semester, academicYear }
      });
      const rawStats = statsResponse?.data?.data ?? statsResponse?.data ?? null;
      const normalizedStats = rawStats ? {
        totalClasses: (
          rawStats?.overview?.classesWithTeacher ??
          rawStats?.classesWithTeacher ??
          rawStats?.overview?.totalClasses ??
          rawStats?.totalClasses ??
          rawStats?.classesCount ??
          rawStats?.classes ?? 0
        ),
        totalEnrolledStudents: (
          rawStats?.overview?.totalEnrolledStudents ??
          rawStats?.totalEnrolledStudents ??
          rawStats?.enrolledCount ??
          rawStats?.enrollments ?? 0
        )
      } : null;
      setEnrollmentStats(normalizedStats);

    } catch (error) {
      console.error('[StudentEnrollment] Enrollment error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to enroll student';
      setErrorMsg(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" style={{color: 'var(--deep-blue)'}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Enrollment</h1>
          <p className="text-gray-600 mt-1">Enroll students in subjects and manage class capacity</p>
        </div>
      </div>

      {/* Enrollment Statistics */}
      {enrollmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--deep-blue-100)'}}>
                <BookOpen className="h-6 w-6" style={{color: 'var(--deep-blue)'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollmentStats?.totalClasses ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--emerald-green-100)'}}>
                <Users className="h-6 w-6" style={{color: 'var(--emerald-green)'}} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollmentStats?.totalEnrolledStudents ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enrollment Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enroll Student</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Student
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, or student ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': 'var(--deep-blue)'}}
                  aria-label="Search student by name, email, or student ID"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStudentSelect(student);
                        }
                      }}
                      aria-label={`Select ${student.name} (${student.email})`}
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

              {/* Selected Student */}
              {selectedStudent && (
                <div className="mt-2 p-3 rounded-lg" style={{backgroundColor: 'var(--emerald-green-50)', borderColor: 'var(--emerald-green-200)'}}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{color: 'var(--emerald-green-800)'}}>{selectedStudent.name}</p>
                      <p className="text-sm" style={{color: 'var(--emerald-green-700)'}}>{selectedStudent.email}</p>
                    </div>
                    <CheckCircle className="h-5 w-5" style={{color: 'var(--emerald-green)'}} />
                  </div>
                </div>
              )}
            </div>

            {/* Semester and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': 'var(--deep-blue)'}}
                >
                  <option value="first">First Semester</option>
                  <option value="second">Second Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="number"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{'--tw-ring-color': 'var(--deep-blue)'}}
                />
              </div>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-4">
            {/* Policy Notice */}
            <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <p className="font-medium">Unit Limit Policy</p>
                <p>Each student can enroll up to a maximum of 30 units per semester. The system will prevent enrollments exceeding this cap.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': 'var(--deep-blue)'}}
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.code} - {subject.name} ({subject.units} units)
                  </option>
                ))}
              </select>
            </div>

            {/* Class Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Class Schedule
              </label>
              
              {/* Days Selection */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Select Days:</p>
                <div className="flex flex-wrap gap-2">
                  {['M', 'T', 'W', 'TH', 'F', 'S'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        schedule.days.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-pressed={schedule.days.includes(day)}
                    >
                      {day === 'TH' ? 'Thu' : day === 'T' ? 'Tue' : day === 'W' ? 'Wed' : day === 'S' ? 'Sat' : day === 'M' ? 'Mon' : day === 'F' ? 'Fri' : day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': 'var(--deep-blue)'}}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{'--tw-ring-color': 'var(--deep-blue)'}}
                  />
                </div>
              </div>

              {/* Room */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Room (Optional)</label>
                <input
                  type="text"
                  value={schedule.room}
                  onChange={(e) => setSchedule(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="e.g., Room 101, Lab A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                  style={{'--tw-ring-color': 'var(--deep-blue)'}}
                />
              </div>

              {/* Schedule Preview */}
              {schedule.days.length > 0 && schedule.startTime && schedule.endTime && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Schedule Preview:</p>
                  <p className="text-sm text-blue-700">
                    {schedule.days.join(', ')} • {schedule.startTime} - {schedule.endTime}
                    {schedule.room && ` • ${schedule.room}`}
                  </p>
                </div>
              )}
            </div>

            {/* Enroll Button */}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleEnroll}
              disabled={!selectedStudent || !selectedSubject || schedule.days.length === 0 || !schedule.startTime || !schedule.endTime || enrolling || (subjects.find(s => s._id === selectedSubject)?.units || 0) > 30}
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
                  Enroll Student
                </>
              )}
            </Button>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm" role="alert" aria-live="assertive">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </Card>

    </div>
  );
};

export default StudentEnrollment;
