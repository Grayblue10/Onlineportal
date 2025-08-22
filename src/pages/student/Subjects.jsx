import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, Search, Filter, Eye, Award, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Input, Card, Badge, Modal } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function StudentSubjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    semester: '',
    department: ''
  });
  
  // Get unique departments for filter dropdown
  const departments = [...new Set(subjects.map(subject => subject.department).filter(Boolean))];
  
  // Get unique semesters for filter dropdown
  const semesters = [...new Set(subjects.map(subject => subject.semester).filter(Boolean))];

  useEffect(() => {
    fetchSubjects();
  }, [user]);
  
  // Handle refresh
  const handleRefresh = () => {
    console.log('[StudentSubjects] Refreshing subjects...');
    fetchSubjects(true);
  };

  const fetchSubjects = async (isRefresh = false) => {
    if (!user) return;
    
    try {
      console.log(`[StudentSubjects] ${isRefresh ? 'Refreshing' : 'Fetching'} subjects data...`);
      setLoading(true);
      setError(null);
      
      // Fetch subjects from the API
      const response = await api.get('/api/student/subjects');
      console.log('[StudentSubjects] API Response:', response.data);
      
      // Handle different response formats
      let subjectsData = [];
      
      if (response.data?.success) {
        subjectsData = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        subjectsData = response.data.subjects || [];
      }
      
      console.log(`[StudentSubjects] Processing ${subjectsData.length} subjects`);
      
      // Process and enhance subject data
      const processedSubjects = subjectsData.map((subject, index) => {
        console.log(`[StudentSubjects] Processing subject ${index + 1}:`, subject);
        
        // Helper: format time range
        const timeRange = (start, end) => {
          if (!start && !end) return null;
          return `${start || ''}${start && end ? ' - ' : ''}${end || ''}`.trim();
        };

        // Derive schedule from multiple possible fields/shapes
        let scheduleValue = null;
        // 1) Pre-formatted string fields
        scheduleValue = scheduleValue || subject.schedule || subject.classSchedule || subject.class_schedule || subject.time || subject.scheduleTime || subject.schedule_time || subject.timetable || subject.meetingTime;
        // 2) Day + Time combos
        scheduleValue = scheduleValue || (subject.scheduleDay && subject.scheduleTime ? `${subject.scheduleDay} ${subject.scheduleTime}` : null);
        scheduleValue = scheduleValue || (subject.schedule_day && subject.schedule_time ? `${subject.schedule_day} ${subject.schedule_time}` : null);
        scheduleValue = scheduleValue || (subject.schedule?.day && subject.schedule?.time ? `${subject.schedule.day} ${subject.schedule.time}` : null);
        // 3) Object with days/start/end
        if (!scheduleValue && subject.schedule && typeof subject.schedule === 'object') {
          const days = subject.schedule.days || subject.schedule.day || subject.schedule.weekday;
          const start = subject.schedule.start || subject.schedule.startTime || subject.schedule.start_time;
          const end = subject.schedule.end || subject.schedule.endTime || subject.schedule.end_time;
          const tr = timeRange(start, end);
          if (days || tr) scheduleValue = `${Array.isArray(days) ? days.join(', ') : (days || '')} ${tr || ''}`.trim();
        }
        // 3b) rawSchedule from backend
        if (!scheduleValue && subject.rawSchedule && typeof subject.rawSchedule === 'object') {
          const rdays = subject.rawSchedule.days || subject.rawSchedule.day || subject.rawSchedule.weekday;
          const rstart = subject.rawSchedule.start || subject.rawSchedule.startTime || subject.rawSchedule.start_time;
          const rend = subject.rawSchedule.end || subject.rawSchedule.endTime || subject.rawSchedule.end_time;
          const rtr = timeRange(rstart, rend);
          if (rdays || rtr) scheduleValue = `${Array.isArray(rdays) ? rdays.join(', ') : (rdays || '')} ${rtr || ''}`.trim();
        }
        // 4) schedules array
        if (!scheduleValue && Array.isArray(subject.schedules) && subject.schedules.length > 0) {
          scheduleValue = subject.schedules
            .map(it => {
              const day = it.day || it.days || it.weekday;
              const tr = timeRange(it.start || it.startTime || it.start_time, it.end || it.endTime || it.end_time);
              return [Array.isArray(day) ? day.join(', ') : (day || null), tr].filter(Boolean).join(' ');
            })
            .filter(Boolean)
            .join(', ');
        }
        // 5) enrollment/classInfo nested
        if (!scheduleValue) {
          const e = subject.enrollment || subject.assigned || subject.assignment || subject.classInfo || subject.section;
          if (e) {
            // If e.schedule is an object with days/startTime/endTime (Admin StudentEnrollment format)
            if (e.schedule && typeof e.schedule === 'object') {
              const edays = e.schedule.days || e.schedule.day || e.schedule.weekday;
              const etr = timeRange(e.schedule.startTime || e.schedule.start_time || e.schedule.start, e.schedule.endTime || e.schedule.end_time || e.schedule.end);
              const daysStr = Array.isArray(edays) ? edays.join(', ') : (edays || '');
              scheduleValue = [daysStr, etr].filter(Boolean).join(' ').trim();
            }
            // Fallbacks on enrollment root-level fields
            if (!scheduleValue) {
              scheduleValue = e.schedule || e.time || (e.day && e.time ? `${e.day} ${e.time}` : null) || timeRange(e.startTime || e.start_time, e.endTime || e.end_time);
            }
            // Array schedules under enrollment
            if (!scheduleValue && Array.isArray(e.schedules)) {
              scheduleValue = e.schedules.map(it => {
                const d = it.day || it.days;
                const tr = timeRange(it.start || it.startTime || it.start_time, it.end || it.endTime || it.end_time);
                return [Array.isArray(d) ? d.join(', ') : (d || null), tr].filter(Boolean).join(' ');
              }).filter(Boolean).join(', ');
            }
          }
        }

        // Derive room from multiple possible fields/nesting
        let roomValue = null;
        roomValue = roomValue || subject.room || subject.roomName || subject.room_name || subject.roomNumber || subject.room_number || subject.classroom || subject.class_room || subject.location || subject.venue;
        roomValue = roomValue || subject.section?.room || subject.section?.location || subject.classInfo?.room || subject.classInfo?.location;
        if (!roomValue && Array.isArray(subject.schedules) && subject.schedules.length > 0) {
          roomValue = subject.schedules.find(it => it.room || it.location)?.room || subject.schedules.find(it => it.location)?.location || null;
        }
        if (!roomValue) {
          const e = subject.enrollment || subject.assigned || subject.assignment || subject.section || subject.classInfo;
          roomValue = e?.schedule?.room || e?.room || e?.roomName || e?.room_name || e?.roomNumber || e?.classroom || e?.location || e?.venue || roomValue;
        }
        if (!roomValue && subject.rawSchedule) {
          roomValue = subject.rawSchedule.room || null;
        }
        if (!scheduleValue) {
          console.debug('[StudentSubjects] schedule unresolved for subject id:', subject.id || subject._id, 'available keys:', Object.keys(subject || {}));
        }
        if (!roomValue) {
          console.debug('[StudentSubjects] room unresolved for subject id:', subject.id || subject._id, 'available keys:', Object.keys(subject || {}));
        }

        return {
          id: subject.id || subject._id || `temp-${index}`,
          _id: subject._id || subject.id,
          name: subject.name || 'Unknown Subject',
          code: subject.code || 'N/A',
          description: subject.description || 'No description available',
          units: subject.units || 3,
          semester: subject.semester || 'first',
          department: subject.department || 'General',
          teacher: subject.teacher || { name: 'TBA', email: '' },
          teacherName: subject.teacherName || subject.teacher?.name || 'TBA',
          schedule: scheduleValue || 'Schedule TBA',
          room: roomValue || 'Room TBA',
          currentGrade: subject.currentGrade || 'N/A',
          averageScore: subject.averageScore || 0,
          completedAssignments: subject.completedAssignments || 0,
          totalAssignments: subject.totalAssignments || 0,
          nextAssignment: subject.nextAssignment || null,
          nextAssignmentDue: subject.nextAssignmentDue || null,
          isEnrolled: subject.isEnrolled !== false
        };
      });
      
      setSubjects(processedSubjects);
      
      if (processedSubjects.length > 0 && isRefresh) {
        toast.success(`Refreshed ${processedSubjects.length} subjects successfully`);
      } else if (processedSubjects.length > 0) {
        toast.success(`Loaded ${processedSubjects.length} subjects successfully`);
      }
      
    } catch (error) {
      console.error('[StudentSubjects] Error fetching subjects:', error);
      
      let errorMessage = 'Failed to load subjects';
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to view subjects.';
        } else if (status === 404) {
          errorMessage = 'Subjects endpoint not found. Please contact support.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setSubjects([]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleViewGrades = (subject) => {
    navigate(`/student/grades?subject=${subject.id}`);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-500';
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    if (grade.startsWith('D') || grade.startsWith('F')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredSubjects = subjects.filter(subject => {
    if (!subject || typeof subject !== 'object') {
      console.warn('[Subjects] Invalid subject object:', subject);
      return false;
    }
    
    const matchesSearch = !filters.search || 
      (subject.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (subject.code?.toLowerCase() || '').includes(filters.search.toLowerCase());
    const matchesSemester = !filters.semester || subject.semester === filters.semester;

    // Department filter removed from UI; do not filter by department
    return matchesSearch && matchesSemester;
  });
  
  console.log('[Subjects] Applied filters:', {
    totalSubjects: subjects.length,
    filteredSubjects: filteredSubjects.length,
    activeFilters: Object.entries(filters).filter(([key, value]) => value).length
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">View your enrolled subjects and track your progress</p>
        </div>
        <Button onClick={() => navigate('/student/grades')}>
          <Award className="w-4 h-4 mr-2" />
          View All Grades
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              disabled={loading}
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester.charAt(0).toUpperCase() + semester.slice(1)} Semester
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button 
              variant="outline"
              size="md"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-500 mb-4"></div>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading subjects</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchSubjects} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
          <p className="text-gray-600">You don't have any subjects enrolled yet or no subjects match your filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                    subject.currentGrade 
                      ? getGradeColor(subject.currentGrade).replace('bg-', 'bg-opacity-20 bg-')
                      : 'bg-student-100'
                  }`}>
                    <BookOpen className={`h-6 w-6 ${
                      subject.currentGrade 
                        ? getGradeColor(subject.currentGrade)
                        : 'text-student-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-600">{subject.code}</p>
                  </div>
                </div>
                <Badge className={getGradeColor(subject.currentGrade)}>
                  {subject.currentGrade}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  {subject.teacher?.name || subject.teacherName || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {subject.schedule || 'Schedule not available'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {subject.room || 'Room not assigned'} • {subject.units} units
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                {subject.completedAssignments !== undefined && subject.totalAssignments > 0 && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-2">Progress:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-student-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(subject.completedAssignments / subject.totalAssignments) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {subject.completedAssignments}/{subject.totalAssignments}
                    </span>
                  </div>
                )}
              </div>

              {/* Next Assignment */}
              {subject.nextAssignment && (
                <div className="mb-4 p-3 bg-student-50 rounded-lg">
                  <p className="text-sm font-medium text-student-900">Next Assignment:</p>
                  <p className="text-sm text-student-700">{subject.nextAssignment}</p>
                  <p className="text-xs text-student-600 mt-1">
                    Due: {new Date(subject.nextAssignmentDue).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewSubject(subject)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleViewGrades(subject)}
                  className="flex-1 bg-student-600 hover:bg-student-700"
                >
                  <Award className="w-4 h-4 mr-1" />
                  Grades
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Subject Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedSubject?.name}>
        {selectedSubject && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Code</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedSubject.code || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Teacher</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSubject.teacher?.name || selectedSubject.teacherName || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Schedule</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSubject.schedule || 'Schedule not available'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Room</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSubject.room || 'Room not assigned'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Current Grade</h4>
                <p className={`mt-1 text-sm font-semibold ${
                  selectedSubject.currentGrade?.startsWith('A') ? 'text-green-600' :
                  selectedSubject.currentGrade?.startsWith('B') ? 'text-blue-600' :
                  selectedSubject.currentGrade?.startsWith('C') ? 'text-yellow-600' :
                  selectedSubject.currentGrade?.startsWith('D') || selectedSubject.currentGrade?.startsWith('F') ? 'text-red-600' :
                  'text-gray-700'
                }`}>
                  {selectedSubject.currentGrade || 'No grade yet'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Average Score</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSubject.averageScore ? `${Math.round(selectedSubject.averageScore)}%` : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">
                {selectedSubject.description || 'No description available.'}
              </p>
            </div>

            {(selectedSubject.nextAssignment || selectedSubject.nextAssignmentDue) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800">
                  {selectedSubject.nextAssignment ? 'Next Assignment' : 'Upcoming Due Date'}
                </h4>
                {selectedSubject.nextAssignment && (
                  <p className="mt-1 text-sm font-medium text-blue-900">
                    {selectedSubject.nextAssignment}
                  </p>
                )}
                {selectedSubject.nextAssignmentDue && (
                  <p className="mt-1 text-xs text-blue-700">
                    Due: {new Date(selectedSubject.nextAssignmentDue).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button 
                className="bg-student-600 hover:bg-student-700"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(`/student/subjects/${selectedSubject._id || selectedSubject.id}`);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
