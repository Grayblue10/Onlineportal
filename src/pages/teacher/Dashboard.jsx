import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  AlertTriangle, 
  RefreshCw,
  Plus,
  Eye,
  ClipboardCheck,
  Clock,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card } from '../../components/ui';
import Spinner from '../../components/ui/Spinner';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentClasses, setRecentClasses] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      console.log('[TeacherDashboard] Fetching dashboard data...');
      
      // Fetch dashboard data in parallel
      const [dashboardResponse, classesResponse] = await Promise.allSettled([
        teacherService.getDashboard(),
        teacherService.getClasses()
      ]);
      
      // Handle dashboard data
      let dashboardStats = {
        totalClasses: 0,
        totalStudents: 0,
        totalGraded: 0,
        pendingGrades: 0,
        completedAssignments: 0
      };
      
      if (dashboardResponse.status === 'fulfilled') {
        const responseData = dashboardResponse.value;
        // Handle different response formats
        if (responseData && typeof responseData === 'object') {
          const stats = responseData.data?.stats || responseData.stats || responseData;
          dashboardStats = {
            totalClasses: stats?.totalClasses || 0,
            totalStudents: stats?.totalStudents || 0,
            totalGraded: stats?.totalGraded || 0,
            pendingGrades: stats?.pendingGrades || 0,
            completedAssignments: stats?.completedAssignments || 0
          };
        }
      } else {
        console.warn('Failed to load dashboard stats:', dashboardResponse.reason?.message || 'Unknown error');
      }
      
      setDashboardData({ stats: dashboardStats });
      
      // Handle classes data
      let loadedClasses = [];
      if (classesResponse.status === 'fulfilled') {
        const responseData = classesResponse.value;
        let classes = [];
        
        if (Array.isArray(responseData)) {
          classes = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          classes = responseData.data;
        } else if (responseData && typeof responseData === 'object') {
          classes = responseData.classes || [];
        }
        
        loadedClasses = classes.slice(0, 3).map(cls => ({
          id: cls._id || cls.id || Math.random().toString(36).substr(2, 9),
          name: cls.name || cls.className || 'Unnamed Class',
          // Handle both array and numeric students from API
          students: Array.isArray(cls?.students)
            ? cls.students.length
            : (typeof cls?.students === 'number'
                ? cls.students
                : (cls.studentCount ?? 0)),
          nextClass: cls.schedule?.nextClass 
            ? new Date(cls.schedule.nextClass).toLocaleString() 
            : 'No upcoming class'
        }));
      } else {
        console.warn('Failed to load classes:', classesResponse.reason?.message || 'Unknown error');
      }
      
      setRecentClasses(loadedClasses);
      
      // Fetch grades for the first class to get pending tasks
      let tasks = [];
      if (loadedClasses.length > 0) {
        try {
          const gradesResponse = await teacherService.getClassGrades(loadedClasses[0].id);
          const pendingGrades = gradesResponse.data?.filter(g => g.status === 'pending') || [];
          
          tasks = pendingGrades.slice(0, 4).map((grade, index) => ({
            id: grade._id || `grade-${index}`,
            task: `Grade ${grade.assignment?.name || 'assignment'} for ${grade.student?.name || 'student'}`,
            due: grade.dueDate ? 
                 (new Date(grade.dueDate).toDateString() === new Date().toDateString() ? 'Today' : 
                  new Date(grade.dueDate).toDateString() === new Date(Date.now() + 86400000).toDateString() ? 'Tomorrow' : 
                  'This Week') : 'No due date',
            priority: grade.priority || 'medium'
          }));
        } catch (error) {
          console.warn('Failed to load grades, using empty tasks', error);
        }
      }
      
      setUpcomingTasks(tasks);
      
      if (isRefresh) {
        toast.success('Dashboard data refreshed');
      }
      
    } catch (error) {
      console.error('[TeacherDashboard] Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // Handle refresh
  const handleRefresh = () => {
    teacherService.clearCache();
    fetchDashboardData(true);
  };

  const handleRetry = async () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    console.log(`[TeacherDashboard] Retrying... attempt ${newRetryCount}`);
    await fetchDashboardData(true);
  };

  // Remove duplicate useEffect - already handled above

  // Stats cards data
  const stats = dashboardData?.stats || {
    totalStudents: 0,
    totalClasses: 0,
    pendingGrades: 0,
    completedAssignments: 0
  };

  const statCards = [
    {
      title: 'My Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/teacher/classes')
    },
    {
      title: 'My Classes',
      value: stats.totalClasses || 0,
      icon: BookOpen,
      color: 'bg-green-500',
      onClick: () => navigate('/teacher/classes')
    },
    {
      title: 'Pending Grades',
      value: stats.pendingGrades || 0,
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => navigate('/teacher/grades')
    },
    {
      title: 'Completed Tasks',
      value: stats.completedAssignments || 0,
      icon: CheckCircle,
      color: 'bg-teacher-500',
      onClick: () => navigate('/teacher/grades')
    }
  ];

  // Render loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={handleRetry}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your classes today.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/teacher/grades')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <ClipboardCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalGraded || 0}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Classes */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/teacher/classes')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentClasses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No classes assigned yet</p>
            ) : (
              recentClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teacher-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teacher-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{classItem.name}</p>
                      <p className="text-sm text-gray-500">{classItem.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next Class</p>
                    <p className="text-xs text-gray-500">{classItem.nextClass}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default TeacherDashboard;