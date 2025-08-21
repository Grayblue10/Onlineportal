import React, { useState, useEffect } from 'react';
import { Award, BookOpen, TrendingUp, Calendar, AlertCircle, RefreshCw, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import Spinner from '../../components/ui/Spinner';
import { Button } from '../../components/ui';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const StatCard = ({ title, value, icon: Icon, color, loading = false, onClick }) => (
  <div 
    className={`card h-full ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center h-full">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="h-8 w-16 mt-1">
            <Spinner size="sm" color="primary" />
          </div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const GradeItem = ({ subject, grade, score, date }) => {
  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-500';
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    if (grade.startsWith('D') || grade.startsWith('F')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${getGradeColor(grade)}`}>
          {grade || 'N/A'}
        </div>
        <div>
          <p className="font-medium text-gray-900">{subject || 'N/A'}</p>
          <p className="text-sm text-gray-600">{date || 'N/A'}</p>
        </div>
      </div>
      <span className="font-semibold text-gray-900">{score || 'N/A'}</span>
    </div>
  );
};

const DashboardContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSubjects: 0
    },
    upcomingClasses: [],
    announcements: []
  });

  const fetchDashboardData = async (isRefresh = false) => {
    if (!user) {
      console.warn('No user found, skipping dashboard data fetch');
      return;
    }
    
    try {
      console.log(`[Dashboard] ${isRefresh ? 'Refreshing' : 'Fetching'} dashboard data for user:`, user.id);
      
      // Only show loading spinner on initial load, not on refresh
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);
      
      const response = await api.get('/api/student/dashboard');
      console.log('[Dashboard] API Response:', {
        status: response.status,
        data: response.data?.data ? 'Data received' : 'No data',
        hasStats: !!response.data?.data?.stats,
        upcomingClassesCount: response.data?.data?.upcomingClasses?.length || 0,
        announcementsCount: response.data?.data?.announcements?.length || 0
      });
      
      if (response.data?.success && response.data.data) {
        const { stats = {}, upcomingClasses = [], announcements = [] } = response.data.data;
        
        // Log data summary
        console.log('[Dashboard] Data summary:', {
          totalSubjects: stats?.totalSubjects || 0,
          upcomingClassesCount: upcomingClasses.length,
          announcementsCount: announcements.length
        });
        
        // Format and validate data before setting state
        const formattedData = {
          stats: {
            totalSubjects: Number(stats?.totalSubjects) || 0
          },
          upcomingClasses: Array.isArray(upcomingClasses) ? upcomingClasses : [],
          announcements: Array.isArray(announcements) ? announcements : []
        };
        
        setDashboardData(formattedData);
        
        // Show success toast on refresh
        if (isRefresh) {
          toast.success('Dashboard data refreshed');
        }
      } else {
        const errorMsg = response.data?.message || 'Invalid response format from server';
        console.error('[Dashboard] Failed to fetch data:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error);
      
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        // Provide more specific error messages based on status code
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view this dashboard.';
        } else if (error.response.status === 404) {
          errorMessage = 'Dashboard endpoint not found. Please contact support.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      
      // Only show error toast if it's not a refresh (to avoid duplicate toasts)
      if (!isRefresh) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const buildSuggestions = () => {
    const suggestions = [];
    const totalSubjects = dashboardData?.stats?.totalSubjects || 0;
    const hasUpcoming = (dashboardData?.upcomingClasses || []).length > 0;
    const hasAnnouncements = (dashboardData?.announcements || []).length > 0;

    if (totalSubjects === 0) {
      suggestions.push({
        title: 'No subjects yet',
        description: 'Browse available subjects and enroll to get started.',
        action: 'View Subjects',
        to: '/student/subjects',
        icon: BookOpen,
      });
    } else {
      suggestions.push({
        title: 'Review your grades',
        description: 'Track progress and identify areas to improve.',
        action: 'Go to My Grades',
        to: '/student/grades',
        icon: Award,
      });
    }

    if (hasUpcoming) {
      suggestions.push({
        title: 'Upcoming classes',
        description: 'Check your schedule so you never miss a class.',
        action: 'View Schedule',
        to: '/student/subjects',
        icon: Calendar,
      });
    }

    if (hasAnnouncements) {
      suggestions.push({
        title: 'New announcements',
        description: 'See important updates from your instructors.',
        action: 'View Announcements',
        to: '/student/subjects',
        icon: AlertCircle,
      });
    }

    // Always include profile completeness prompt
    suggestions.push({
      title: 'Update your profile',
      description: 'Keep your information up to date for a smoother experience.',
      action: 'Edit Profile',
      to: '/student/profile',
      icon: User,
    });

    return suggestions;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Loading your dashboard</p>
          <p className="text-gray-500 mt-1">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
        <p className="text-gray-600 mb-6">
          {error || 'An unexpected error occurred while loading your dashboard data.'}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button 
            onClick={() => fetchDashboardData()} 
            variant="primary"
            className="inline-flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">
            {isRefreshing ? 'Updating...' : ''}
          </span>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-student-600 hover:bg-student-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            aria-label="Refresh dashboard"
          >
            <RefreshCw 
              className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6">
        <StatCard 
          title="Total Subjects" 
          value={dashboardData.stats.totalSubjects} 
          icon={BookOpen} 
          color="bg-blue-500"
          loading={isLoading}
          onClick={() => navigate('/student/subjects')}
        />
      </div>

      {/* Suggested for you */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Suggested for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildSuggestions().map((s, idx) => (
            <div key={idx} className="card p-4 flex items-start justify-between">
              <div className="flex items-start">
                <div className="mr-3 p-2 rounded-md bg-gray-100">
                  <s.icon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => navigate(s.to)}>{s.action}</Button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

const StudentDashboard = () => (
  <ErrorBoundary>
    <DashboardContent />
  </ErrorBoundary>
);

export default StudentDashboard;