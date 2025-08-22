import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, BookOpen, Calendar, Clock, Search, 
  Filter, Eye, Edit, Plus, Loader2, RefreshCw 
} from 'lucide-react';
import { Button, Input, Card, Badge, Modal, MobileCardList, ResponsiveTable } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

export default function TeacherClasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [modalStudents, setModalStudents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    semester: ''
  });

  const fetchClasses = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      console.log('[TeacherClasses] Fetching classes for user:', user?.id);
      
      const response = await teacherService.getClasses();
      console.log('[TeacherClasses] Raw response:', response);
      
      // Handle different response formats with better error checking
      let classesData = [];
      if (response && response.success && Array.isArray(response.data)) {
        classesData = response.data;
        console.log('[TeacherClasses] Using response.data format');
      } else if (Array.isArray(response)) {
        classesData = response;
        console.log('[TeacherClasses] Using direct array format');
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        classesData = response.data;
        console.log('[TeacherClasses] Using nested data format');
      } else {
        console.warn('[TeacherClasses] Unexpected response format:', typeof response, response);
        classesData = [];
      }
      
      console.log(`[TeacherClasses] Processing ${classesData.length} classes`);
      
      if (classesData.length === 0 && !isRefresh) {
        console.log('[TeacherClasses] No classes found - teacher may need to assign subjects first');
        toast.info('No classes found. Please assign subjects first to create classes.');
      }
      
      // Process and enhance class data with better error handling
      const processedClasses = classesData.map((cls, index) => {
        console.log(`[TeacherClasses] Processing class ${index + 1}:`, cls);
        
        // Ensure required fields exist with safe defaults
        const safeClass = {
          ...cls,
          id: cls.id || cls._id || `temp-${index}`,
          name: cls.name || `Class ${index + 1}`,
          code: cls.code || cls.subject?.code || 'N/A',
          subject: typeof cls.subject === 'string' ? cls.subject : cls.subject?.name || 'Unknown Subject',
          subjectId: typeof cls.subject === 'object' ? (cls.subject._id || cls.subject.id) : (cls.subjectId || undefined),
          schedule: typeof cls.schedule === 'string' ? cls.schedule : (Array.isArray(cls.schedule?.days) ? cls.schedule.days.join(', ') : 'TBD'),
          room: cls.room || cls.schedule?.room || 'TBD',
          students: typeof cls.students === 'number' ? cls.students : (Array.isArray(cls.students) ? cls.students.length : 0),
          semester: (() => {
            const sem = cls.semester || cls.term || 'First Semester';
            if (sem === 'Fall') return 'First Semester';
            if (sem === 'Spring') return 'Second Semester';
            return sem;
          })(),
          academicYear: cls.academicYear || '2024-2025',
          description: cls.description || 'No description available',
          isActive: cls.isActive !== undefined ? cls.isActive : true,
          status: cls.status || (cls.isActive !== false ? 'active' : 'inactive'),
          nextClass: cls.nextClass || calculateNextClass(cls.schedule),
          credits: cls.credits || 3,
        };
        
        console.log(`[TeacherClasses] Processed class:`, safeClass);
        return safeClass;
      });
      
      setClasses(processedClasses);
      console.log(`[TeacherClasses] Successfully loaded ${processedClasses.length} classes`);
      
      if (processedClasses.length > 0 && isRefresh) {
        toast.success(`Refreshed ${processedClasses.length} classes successfully`);
      } else if (processedClasses.length > 0 && !isRefresh) {
        toast.success(`Loaded ${processedClasses.length} classes successfully`);
      }
      
    } catch (error) {
      console.error('[TeacherClasses] Error fetching classes:', error);
      console.error('[TeacherClasses] Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to load classes';
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          console.warn('[TeacherClasses] Authentication error - redirecting to login may be needed');
        } else if (status === 403) {
          errorMessage = 'You do not have permission to view classes.';
        } else if (status === 404) {
          errorMessage = 'Classes endpoint not found. Please contact support.';
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
      setClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);
  
  // Helper function to calculate next class time
  const calculateNextClass = (schedule) => {
    if (!schedule) return null;
    // This is a simplified example - in a real app, you'd parse the schedule
    // and calculate the next occurrence based on current date/time
    return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  };
  
  // Fetch classes when component mounts or filters change
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);
  
  // Handle class refresh
  const handleRefresh = () => {
    console.log('[TeacherClasses] Refreshing classes...');
    teacherService.clearCache('teacher_classes');
    fetchClasses(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewClass = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
    // Load enrolled students for this class
    setModalLoading(true);
    setModalStudents([]);
    teacherService.getClassStudents(classItem.id)
      .then((res) => {
        const data = res?.data || res || [];
        setModalStudents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('[TeacherClasses] Failed to load class students:', err);
        toast.error('Failed to load enrolled students');
      })
      .finally(() => setModalLoading(false));
  };

  const handleGradeClass = (classItem) => {
    const subj = classItem.subjectId ? `&subject=${classItem.subjectId}` : '';
    navigate(`/teacher/grades?class=${classItem.id}${subj}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Apply filters to classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         cls.code.toLowerCase().includes(filters.search.toLowerCase());
    const matchesSemester = !filters.semester || cls.semester === filters.semester;
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your teaching schedule and class details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            variant="secondary" 
            size="md"
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              name="search"
              placeholder="Search classes..."
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
          >
            <option value="">All Semesters</option>
            <option value="First Semester">First Semester</option>
            <option value="Second Semester">Second Semester</option>
          </select>
        </div>
      </Card>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teacher-600"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
          <p className="text-gray-600 mb-4">No classes match your current filters. Try clearing the search or semester filters.</p>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/teacher/subjects/assign')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Subjects
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-teacher-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-teacher-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">{classItem.code}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(classItem.status)}>
                  {classItem.status}
                </Badge>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {classItem.students} students
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {classItem.schedule}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Next: {classItem.nextClass ? new Date(classItem.nextClass).toLocaleDateString() : 'TBD'}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {classItem.description}
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewClass(classItem)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleGradeClass(classItem)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Grade
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Class Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Class Details"
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teacher-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-teacher-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedClass.name}</h2>
                <p className="text-gray-600">{selectedClass.code} • {selectedClass.semester}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
                <p className="text-lg font-semibold text-gray-900">{selectedClass.students}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <p className="text-lg font-semibold text-gray-900">{selectedClass.room}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <p className="text-lg font-semibold text-gray-900">{selectedClass.schedule}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge className={getStatusColor(selectedClass.status)}>
                  {selectedClass.status}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Students</label>
              {modalLoading ? (
                <div className="text-sm text-gray-500">Loading students...</div>
              ) : modalStudents.length === 0 ? (
                <div className="text-sm text-gray-500">No enrolled students found.</div>
              ) : (
                <>
                  {/* Mobile list */}
                  <MobileCardList>
                    <div className="divide-y divide-gray-200">
                      {modalStudents.map((st) => (
                        <div key={st._id} className="p-3 flex items-center justify-between">
                          <div className="min-w-0 mr-3">
                            <div className="text-sm font-medium text-gray-900 truncate">{st.firstName} {st.lastName}</div>
                            <div className="text-xs text-gray-500 truncate">{st.studentId}</div>
                          </div>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => {
                              setIsModalOpen(false);
                              const subj = selectedClass.subjectId ? `&subject=${selectedClass.subjectId}` : '';
                              navigate(`/teacher/grades?class=${selectedClass.id}${subj}&student=${st._id}`);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Grade
                          </Button>
                        </div>
                      ))}
                    </div>
                  </MobileCardList>

                  {/* Desktop/tablet table */}
                  <ResponsiveTable>
                    <table className="min-w-[520px] text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-600 font-medium">Student</th>
                          <th className="text-left px-3 py-2 text-gray-600 font-medium">ID</th>
                          <th className="text-right px-3 py-2 text-gray-600 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalStudents.map((st) => (
                          <tr key={st._id} className="border-t">
                            <td className="px-3 py-2 text-gray-900">{st.firstName} {st.lastName}</td>
                            <td className="px-3 py-2 text-gray-600">{st.studentId}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                size="xs"
                                variant="primary"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  const subj = selectedClass.subjectId ? `&subject=${selectedClass.subjectId}` : '';
                                  navigate(`/teacher/grades?class=${selectedClass.id}${subj}&student=${st._id}`);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Grade
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ResponsiveTable>
                </>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  handleGradeClass(selectedClass);
                }}
              >
                Manage Grades
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
);}
