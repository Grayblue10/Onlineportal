import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Book, Mail, AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import teacherService from '../../services/teacherService';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const EnrolledStudents = () => {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState(''); // '', 'first', 'second'

  const fetchEnrolledStudents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[EnrolledStudents] Fetching enrolled students');
      const response = await teacherService.getEnrolledStudents();
      console.log('[EnrolledStudents] Enrollment response:', response);
      
      // Handle different response formats
      let enrollmentData = [];
      if (Array.isArray(response)) {
        enrollmentData = response;
      } else if (response && Array.isArray(response.data)) {
        enrollmentData = response.data;
      } else if (response && typeof response === 'object') {
        enrollmentData = response.enrollments || response.classes || [];
      }
      
      setEnrollmentData(enrollmentData);
    } catch (error) {
      console.error('[EnrolledStudents] Error fetching students:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load enrolled students';
      toast.error(errorMessage);
      setEnrollmentData([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchEnrolledStudents();
  }, [fetchEnrolledStudents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const getCapacityColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getCapacityIcon = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  // Normalize semester label for each class card
  const normalizeSemester = (cls) => {
    const sem = cls.semester || cls.term || 'First Semester';
    if (sem === 'Fall') return 'First Semester';
    if (sem === 'Spring') return 'Second Semester';
    return sem;
  };

  const dataWithSemester = enrollmentData.map((cls) => ({
    ...cls,
    _semester: normalizeSemester(cls),
  }));

  const semesterMatches = (semLabel) => {
    if (!semesterFilter) return true;
    if (semesterFilter === 'first') return semLabel === 'First Semester';
    if (semesterFilter === 'second') return semLabel === 'Second Semester';
    return true;
  };

  const filteredData = dataWithSemester.filter((c) => semesterMatches(c._semester));
  const firstSemData = filteredData.filter((c) => c._semester === 'First Semester');
  const secondSemData = filteredData.filter((c) => c._semester === 'Second Semester');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all students enrolled in your classes</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Student enrollment in your subjects (Max: 60 per subject)
        </div>
        <div>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500 text-sm"
          >
            <option value="">All Semesters</option>
            <option value="first">First Semester</option>
            <option value="second">Second Semester</option>
          </select>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
            <p className="text-gray-600">
              You don't have any subjects assigned yet. Please assign subjects first to see enrolled students.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* If no filter, show grouped sections with headers; otherwise show a single list */}
          {semesterFilter ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredData.map((classData) => (
                <Card key={classData._id}>
                  <div className="p-6">
                    {/* Class Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Book className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {classData.subject.name}
                          </h2>
                          <p className="text-sm text-gray-600">{classData.subject.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor(classData.currentStudents, classData.maxStudents)}`}>
                          {getCapacityIcon(classData.currentStudents, classData.maxStudents)}
                          <span className="ml-1">
                            {classData.currentStudents}/{classData.maxStudents}
                          </span>
                        </div>
                        <Badge variant={classData.availableSlots > 0 ? 'success' : 'warning'} className="text-xs">
                          {classData.availableSlots} slots available
                        </Badge>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Enrollment Capacity</span>
                        <span>{Math.round((classData.currentStudents / classData.maxStudents) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            classData.currentStudents >= classData.maxStudents * 0.9
                              ? 'bg-red-500'
                              : classData.currentStudents >= classData.maxStudents * 0.75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((classData.currentStudents / classData.maxStudents) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classData.students.map((student, index) => (
                        <div
                          key={student._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-blue-600">
                                  {student.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span className="inline-flex items-center"><Mail className="h-3 w-3 mr-1" />{student.email}</span>
                                  {typeof student.yearLevel !== 'undefined' && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] rounded-md border border-yellow-300 bg-yellow-50 text-yellow-700">
                                      <GraduationCap className="w-3 h-3 mr-1" /> Y{student.yearLevel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">#{index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {firstSemData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">First Semester</h2>
                    <span className="text-sm text-gray-500">{firstSemData.length} classes</span>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {firstSemData.map((classData) => (
                      <Card key={classData._id}>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <Book className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h2 className="text-xl font-semibold text-gray-900">{classData.subject.name}</h2>
                                <p className="text-sm text-gray-600">{classData.subject.code}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor(classData.currentStudents, classData.maxStudents)}`}>
                                {getCapacityIcon(classData.currentStudents, classData.maxStudents)}
                                <span className="ml-1">{classData.currentStudents}/{classData.maxStudents}</span>
                              </div>
                              <Badge variant={classData.availableSlots > 0 ? 'success' : 'warning'} className="text-xs">{classData.availableSlots} slots available</Badge>
                            </div>
                          </div>
                          <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Enrollment Capacity</span>
                              <span>{Math.round((classData.currentStudents / classData.maxStudents) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all duration-300 ${classData.currentStudents >= classData.maxStudents * 0.9 ? 'bg-red-500' : classData.currentStudents >= classData.maxStudents * 0.75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min((classData.currentStudents / classData.maxStudents) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classData.students.map((student, index) => (
                              <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-blue-600">{student.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{student.name}</p>
                                      <div className="flex items-center text-sm text-gray-500"><Mail className="h-3 w-3 mr-1" />{student.email}</div>
                                      {typeof student.yearLevel !== 'undefined' && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] rounded-md border border-yellow-300 bg-yellow-50 text-yellow-700">
                                          <GraduationCap className="w-3 h-3 mr-1" /> Y{student.yearLevel}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400">#{index + 1}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {classData.currentStudents >= classData.maxStudents * 0.9 && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">Near Capacity Limit</p>
                                  <p className="text-sm text-yellow-700">This class is approaching the maximum student limit of {classData.maxStudents}. Only {classData.availableSlots} slots remaining.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {secondSemData.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Second Semester</h2>
                    <span className="text-sm text-gray-500">{secondSemData.length} classes</span>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {secondSemData.map((classData) => (
                      <Card key={classData._id}>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <Book className="h-6 w-6 text-blue-600 mr-3" />
                              <div>
                                <h2 className="text-xl font-semibold text-gray-900">{classData.subject.name}</h2>
                                <p className="text-sm text-gray-600">{classData.subject.code}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCapacityColor(classData.currentStudents, classData.maxStudents)}`}>
                                {getCapacityIcon(classData.currentStudents, classData.maxStudents)}
                                <span className="ml-1">{classData.currentStudents}/{classData.maxStudents}</span>
                              </div>
                              <Badge variant={classData.availableSlots > 0 ? 'success' : 'warning'} className="text-xs">{classData.availableSlots} slots available</Badge>
                            </div>
                          </div>
                          <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Enrollment Capacity</span><span>{Math.round((classData.currentStudents / classData.maxStudents) * 100)}%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all duration-300 ${classData.currentStudents >= classData.maxStudents * 0.9 ? 'bg-red-500' : classData.currentStudents >= classData.maxStudents * 0.75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min((classData.currentStudents / classData.maxStudents) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classData.students.map((student, index) => (
                              <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-blue-600">{student.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{student.name}</p>
                                      <div className="flex items-center text-sm text-gray-500"><Mail className="h-3 w-3 mr-1" />{student.email}</div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400">#{index + 1}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {classData.currentStudents >= classData.maxStudents * 0.9 && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">Near Capacity Limit</p>
                                  <p className="text-sm text-yellow-700">This class is approaching the maximum student limit of {classData.maxStudents}. Only {classData.availableSlots} slots remaining.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {filteredData.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredData.length}
                </div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.reduce((sum, cls) => sum + cls.currentStudents, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredData.reduce((sum, cls) => sum + cls.availableSlots, 0)}
                </div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (filteredData.reduce((sum, cls) => sum + cls.currentStudents, 0) /
                     filteredData.reduce((sum, cls) => sum + cls.maxStudents, 0)) * 100
                  )}%
                </div>
                <div className="text-sm text-gray-600">Overall Capacity</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnrolledStudents;
