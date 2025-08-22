import React, { useState, useEffect } from 'react';
import { UserCheck, BookOpen, AlertTriangle, CheckCircle, Loader2, Users, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button, Card } from '../../components/ui';
import api from '../../services/api';
import adminClassService from '../../services/adminClassService';

const TeacherAssignment = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [semester, setSemester] = useState('first');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleteIfEmpty, setDeleteIfEmpty] = useState(false);

  // Fetch teachers and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[TeacherAssignment] Fetching teachers and subjects');
        
        const [teachersResponse, subjectsResponse] = await Promise.all([
          api.get('/api/admin/teachers', {
            params: { semester, academicYear }
          }),
          api.get('/api/admin/subjects')
        ]);
        
        setTeachers(teachersResponse.data.data || []);
        setSubjects(subjectsResponse.data.data || []);
        
        console.log('[TeacherAssignment] Loaded teachers:', teachersResponse.data.data?.length);
        console.log('[TeacherAssignment] Loaded subjects:', subjectsResponse.data.data?.length);
      } catch (error) {
        console.error('[TeacherAssignment] Error fetching data:', error);
        toast.error('Failed to load assignment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [semester, academicYear]);

  // Handle subject selection
  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else if (prev.length < 2) {
        return [...prev, subjectId];
      } else {
        toast.error('Teachers can only be assigned to a maximum of 2 subjects per semester');
        return prev;
      }
    });
  };

  // Handle teacher assignment
  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    try {
      setAssigning(true);
      console.log('[TeacherAssignment] Assigning teacher:', {
        teacherId: selectedTeacher,
        subjectIds: selectedSubjects,
        semester,
        academicYear
      });

      const response = await api.post('/api/admin/teachers/assign', {
        teacherId: selectedTeacher,
        subjectIds: selectedSubjects,
        semester,
        academicYear
      });

      console.log('[TeacherAssignment] Assignment successful:', response.data);
      
      const teacher = teachers.find(t => t.id === selectedTeacher);
      const assignedSubjects = subjects.filter(s => selectedSubjects.includes(s._id));
      
      toast.success(
        `Successfully assigned ${teacher?.name} to ${assignedSubjects.map(s => s.name).join(', ')}`
      );

      // Reset form
      setSelectedTeacher('');
      setSelectedSubjects([]);
      
      // Refresh teachers data
      const teachersResponse = await api.get('/api/admin/teachers', {
        params: { semester, academicYear }
      });
      setTeachers(teachersResponse.data.data || []);

    } catch (error) {
      console.error('[TeacherAssignment] Assignment error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to assign teacher';
      toast.error(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  // Get selected teacher details
  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);

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
          <h1 className="text-3xl font-bold text-gray-900">Teacher Assignment</h1>
          <p className="text-gray-600 mt-1">Assign teachers to subjects (maximum 2 per semester)</p>
        </div>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--deep-blue-100)'}}>
              <Users className="h-6 w-6" style={{color: 'var(--deep-blue)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <p className="text-2xl font-semibold text-gray-900">{teachers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--emerald-green-100)'}}>
              <CheckCircle className="h-6 w-6" style={{color: 'var(--emerald-green)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fully Assigned</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teachers.filter(t => t.currentAssignments === 2).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--golden-yellow-100)'}}>
              <AlertTriangle className="h-6 w-6" style={{color: 'var(--golden-yellow-800)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teachers.reduce((sum, t) => sum + t.availableSlots, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Assign Teacher to Subjects</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teacher Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': 'var(--deep-blue)'}}
              >
                <option value="">Choose a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.availableSlots} slots available)
                  </option>
                ))}
              </select>

              {/* Selected teacher details & unassign controls */}
              {selectedTeacher && selectedTeacherData && (
                <div className="mt-4 p-4 rounded-lg border" style={{backgroundColor: 'var(--deep-blue-50)', borderColor: 'var(--deep-blue-200)'}}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium" style={{color: 'var(--deep-blue-800)'}}>{selectedTeacherData.name}</h3>
                    <span className="text-sm" style={{color: 'var(--deep-blue-700)'}}>
                      {selectedTeacherData.currentAssignments}/2 subjects assigned
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{color: 'var(--deep-blue-700)'}}>{selectedTeacherData.email}</p>
                  {/* Delete if empty toggle */}
                  <label className="flex items-center gap-2 mb-3 text-sm" style={{color: 'var(--deep-blue-800)'}}>
                    <input
                      type="checkbox"
                      checked={deleteIfEmpty}
                      onChange={(e) => setDeleteIfEmpty(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Delete class if it has no students
                  </label>

                  {selectedTeacherData.subjects.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{color: 'var(--deep-blue-800)'}}>Current Subjects:</p>
                      <div className="flex flex-col gap-2">
                        {selectedTeacherData.subjects.map((subject, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-md border px-2 py-1">
                            <span className="text-xs font-medium" style={{color: 'var(--deep-blue-800)'}}>
                              {subject.code} - {subject.name}
                            </span>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleUnassign(subject.code)}
                            >
                              Unassign
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subjects (Maximum 2)
              </label>
              <div className="text-sm text-gray-600 mb-3">
                Selected: {selectedSubjects.length}/2 subjects
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: selectedSubjects.includes(subject._id) ? 'var(--deep-blue-50)' : 'white',
                      borderColor: selectedSubjects.includes(subject._id) ? 'var(--deep-blue-200)' : 'var(--gray-200)'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedSubjects.includes(subject._id)) {
                        e.target.style.backgroundColor = 'var(--gray-50)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedSubjects.includes(subject._id)) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                    onClick={() => handleSubjectToggle(subject._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject._id)}
                        onChange={() => handleSubjectToggle(subject._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {subject.code} - {subject.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {subject.units} units • {subject.semester} semester
                        </p>
                      </div>
                    </div>
                    {selectedSubjects.includes(subject._id) && (
                      <CheckCircle className="h-5 w-5" style={{color: 'var(--deep-blue)'}} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Assign Button */}
            <Button
              variant="success"
              size="md"
              fullWidth
              onClick={handleAssign}
              disabled={!selectedTeacher || selectedSubjects.length === 0 || assigning || selectedTeacherData?.availableSlots === 0}
              loading={assigning}
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assign Teacher
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Teacher Assignment Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Teacher Assignment Overview</h2>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    teacher.currentAssignments === 2 
                      ? 'bg-green-100' 
                      : teacher.currentAssignments === 1 
                      ? 'bg-yellow-100' 
                      : 'bg-gray-100'
                  }`}>
                    <Users className={`h-5 w-5 ${
                      teacher.currentAssignments === 2 
                        ? 'text-green-600' 
                        : teacher.currentAssignments === 1 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{teacher.name}</p>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                  {teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {subject.code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {teacher.currentAssignments}/2 subjects
                </p>
                <p className="text-xs text-gray-600">
                  {teacher.availableSlots} slots available
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TeacherAssignment;
