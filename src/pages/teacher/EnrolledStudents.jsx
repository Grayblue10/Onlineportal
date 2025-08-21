import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Book, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import teacherService from '../../services/teacherService';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const EnrolledStudents = () => {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          Student enrollment in your subjects (Max: 30 per subject)
        </div>
      </div>

      {enrollmentData.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-6">
          {enrollmentData.map((classData) => (
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
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getCapacityColor(classData.currentStudents, classData.maxStudents)
                    }`}>
                      {getCapacityIcon(classData.currentStudents, classData.maxStudents)}
                      <span className="ml-1">
                        {classData.currentStudents}/{classData.maxStudents}
                      </span>
                    </div>
                    <Badge 
                      variant={classData.availableSlots > 0 ? 'success' : 'warning'}
                      className="text-xs"
                    >
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
                {classData.students.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Enrolled Students ({classData.students.length})
                    </h3>
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
                                <div className="flex items-center text-sm text-gray-500">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {student.email}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">#{index + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No students enrolled in this subject yet</p>
                  </div>
                )}

                {/* Capacity Warning */}
                {classData.currentStudents >= classData.maxStudents * 0.9 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Near Capacity Limit
                        </p>
                        <p className="text-sm text-yellow-700">
                          This class is approaching the maximum student limit of {classData.maxStudents}.
                          Only {classData.availableSlots} slots remaining.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {enrollmentData.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrollmentData.length}
                </div>
                <div className="text-sm text-gray-600">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {enrollmentData.reduce((sum, cls) => sum + cls.currentStudents, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {enrollmentData.reduce((sum, cls) => sum + cls.availableSlots, 0)}
                </div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (enrollmentData.reduce((sum, cls) => sum + cls.currentStudents, 0) /
                     enrollmentData.reduce((sum, cls) => sum + cls.maxStudents, 0)) * 100
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
