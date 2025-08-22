import React, { useState, useEffect } from 'react';
import { Award, BookOpen, TrendingUp, Filter, Search, Eye, Calendar, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Input, Card, Badge, Modal, MobileCardList, ResponsiveTable } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export default function StudentGrades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    semester: '',
    assessmentType: ''
  });
  const [stats, setStats] = useState({
    gpa: 0,
    totalGrades: 0,
    averageScore: 0,
    highestGrade: 0,
    subjects: []
  });
  
  // Get unique subjects for filter dropdown
  const subjects = [...new Set(grades.map(grade => grade.subject?.name).filter(Boolean))];
  
  // Get unique assessment types for filter dropdown
  const assessmentTypes = [...new Set(grades.map(grade => grade.assessmentType).filter(Boolean))];
  
  // Get unique semesters for filter dropdown
  const semesters = [...new Set(grades.map(grade => grade.semester).filter(Boolean))];

  useEffect(() => {
    fetchGrades();
  }, [filters]);

  const fetchGrades = async () => {
    if (!user) {
      console.log('[Grades] No user found, skipping fetch');
      return;
    }
    
    try {
      console.log('[Grades] Starting to fetch grades data...');
      setLoading(true);
      setError(null);
      
      // Fetch grades from the API
      const response = await api.get('/api/student/grades');
      console.log('[Grades] API Response received:', {
        success: response.data?.success,
        dataType: typeof response.data?.data,
        gradesCount: response.data?.data?.grades?.length || 0,
        hasStats: !!response.data?.data?.stats
      });
      
      // Handle different response formats
      let gradesData = [];
      let statsData = {};
      
      if (response.data?.success) {
        gradesData = response.data.data?.grades || [];
        statsData = response.data.data?.stats || {};
        console.log('[Grades] Parsed successful response:', {
          gradesCount: gradesData.length,
          statsKeys: Object.keys(statsData)
        });
      } else if (Array.isArray(response.data)) {
        gradesData = response.data;
        console.log('[Grades] Using array response format');
      } else if (response.data && typeof response.data === 'object') {
        gradesData = response.data.grades || [];
        statsData = response.data.stats || {};
        console.log('[Grades] Using object response format');
      }
      
      // Validate and set grades data
      if (!Array.isArray(gradesData)) {
        console.warn('[Grades] Invalid grades data format, using empty array');
        gradesData = [];
      }
      // Normalize grades to ensure numeric final scores are on 1.00–5.00 scale
      const normalizedGrades = gradesData.map((g) => {
        const subject = g.subject || { name: 'Unknown Subject', code: 'N/A' };
        const assessmentType = g.assessmentType || g.type || 'assignment';
        const title = g.title || g.name || 'Assessment';
        const rawScore = Number(g.score);
        const maxScore = Number(g.maxScore);
        const percentage = typeof g.percentage === 'number' ? g.percentage : (
          Number.isFinite(rawScore) && Number.isFinite(maxScore) && maxScore > 0 ? (rawScore / maxScore) * 100 : undefined
        );

        let score = rawScore;
        // If score is missing/zero but we have percentage or a 0-100 scale, map to 1.00–5.00
        if (!Number.isFinite(score) || score === 0) {
          if (Number.isFinite(maxScore) && maxScore > 5 && Number.isFinite(rawScore)) {
            // Convert from 0..maxScore to 1.00..5.00
            const pct = Math.max(0, Math.min(1, rawScore / maxScore));
            score = 5 - pct * 4;
          } else if (Number.isFinite(percentage)) {
            const pct = Math.max(0, Math.min(1, percentage / 100));
            score = 5 - pct * 4;
          } else if (assessmentType === 'final') {
            // Default final grade when nothing else is available
            score = 1.0;
          }
        }

        // Round to 2 decimals for consistency in UI
        if (Number.isFinite(score)) {
          score = Math.round(score * 100) / 100;
        }

        return {
          ...g,
          subject,
          assessmentType,
          title,
          score,
          maxScore: Number.isFinite(maxScore) ? maxScore : g.maxScore,
          percentage: Number.isFinite(percentage) ? Math.round(percentage) : g.percentage,
          gradedAt: g.gradedAt || g.updatedAt || g.createdAt
        };
      });

      setGrades(normalizedGrades);
      setStats({
        gpa: statsData.gpa || 0,
        totalGrades: statsData.totalGrades || normalizedGrades.length,
        averageScore: statsData.averageScore || 0,
        highestGrade: statsData.highestGrade || 'N/A',
        subjects: statsData.subjects || []
      });
      
      console.log('[Grades] Successfully set grades data:', {
        gradesCount: gradesData.length,
        gpa: statsData.gpa || 0,
        averageScore: statsData.averageScore || 0
      });
      
    } catch (error) {
      console.error('[Grades] Error fetching grades:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load grades';
      setError(errorMessage);
      toast.error(`Failed to load grades: ${errorMessage}`);
      setGrades([]);
      
      // Reset stats on error
      setStats({
        gpa: 0,
        totalGrades: 0,
        averageScore: 0,
        highestGrade: 'N/A',
        subjects: []
      });
    } finally {
      setLoading(false);
      console.log('[Grades] Fetch operation completed');
    }
  };

  // Mock data in case API fails or for development
  const mockGrades = [
    {
      id: 5,
      subject: { name: 'History', code: 'HIST101' },
      assessmentType: 'final',
      title: 'Final Examination',
      score: 78,
      maxScore: 100,
      percentage: 78,
      grade: 'C+',
      semester: 'first',
      academicYear: '2024-25',
      gradedAt: '2024-01-05',
      teacher: 'Mr. Brown',
      feedback: 'Good effort but needs to work on essay structure.'
    }
  ];
  
  // Note: mock data transformer removed; we now normalize real API results in fetchGrades()

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewGrade = (grade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-500';
    if (grade.startsWith('A')) return 'bg-green-500';
    if (grade.startsWith('B')) return 'bg-blue-500';
    if (grade.startsWith('C')) return 'bg-yellow-500';
    if (grade.startsWith('D') || grade.startsWith('F')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getAssessmentBadgeColor = (type) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'midterm': return 'bg-orange-100 text-orange-800';
      case 'final': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Color mapping for numeric final grades (1.00 best, 5.00 lowest)
  const getNumericGradeColor = (num) => {
    if (num === undefined || num === null) return 'bg-gray-500';
    if (num <= 1.75) return 'bg-green-500';
    if (num <= 2.25) return 'bg-blue-500';
    if (num <= 3.0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-500 mb-4"></div>
        <p className="text-gray-600">Loading your grades...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading grades</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchGrades} variant="primary" size="md">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Apply filters to grades with safe property access
  const filteredGrades = grades.filter(grade => {
    if (!grade || typeof grade !== 'object') {
      console.warn('[Grades] Invalid grade object:', grade);
      return false;
    }
    
    const matchesSearch = !filters.search || 
      (grade.subject?.name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (grade.title?.toLowerCase() || '').includes(filters.search.toLowerCase());
    const matchesSubject = !filters.subject || grade.subject?.name === filters.subject;
    const matchesSemester = !filters.semester || grade.semester === filters.semester;
    const matchesAssessmentType = !filters.assessmentType || grade.assessmentType === filters.assessmentType;
    
    return matchesSearch && matchesSubject && matchesSemester && matchesAssessmentType;
  });
  
  console.log('[Grades] Applied filters:', {
    totalGrades: grades.length,
    filteredGrades: filteredGrades.length,
    activeFilters: Object.entries(filters).filter(([key, value]) => value).length
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-1">View your academic performance and grades</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">GPA</p>
          <p className="text-2xl font-bold">
            {loading ? '--' : (stats.gpa || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Grades</p>
          <p className="text-2xl font-bold">
            {loading ? '--' : filteredGrades.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Highest Grade</p>
          <p className="text-2xl font-bold">
            {loading ? '--' : (stats.highestGrade || 'N/A')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              disabled={loading}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.assessmentType}
              onChange={(e) => setFilters({...filters, assessmentType: e.target.value})}
              disabled={loading}
            >
              <option value="">All Types</option>
              {assessmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-student-600 text-white hover:bg-student-700'
              }`}
              onClick={() => setFilters({
                search: '',
                subject: '',
                semester: '',
                assessmentType: ''
              })}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Clear Filters'}
            </button>
          </div>
        </div>
      </Card>

      {/* Mobile: stacked cards */}
      <MobileCardList>
        {filteredGrades.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No grades found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGrades.map((grade) => (
              <div key={grade._id || grade.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-student-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-student-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{grade.subject?.name}</div>
                    <div className="text-sm text-gray-500 truncate">{grade.title}</div>
                  </div>
                  <span className={`ml-3 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNumericGradeColor(grade.score)} text-white`}>
                    {typeof grade.score === 'number' ? grade.score.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <Badge className={getAssessmentBadgeColor(grade.assessmentType)}>
                    {grade.assessmentType}
                  </Badge>
                  <span className="text-gray-500">
                    {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleViewGrade(grade)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileCardList>

      {/* Desktop/Tablet: Grades Table */}
      <ResponsiveTable>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No grades found
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr 
                    key={grade._id || grade.id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => {
                      setSelectedGrade(grade);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-student-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-student-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{grade.subject.name}</div>
                          <div className="text-sm text-gray-500">{grade.subject.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{grade.title}</div>
                        <Badge className={getAssessmentBadgeColor(grade.assessmentType)}>
                          {grade.assessmentType}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          {typeof grade.score === 'number' ? grade.score.toFixed(2) : 'N/A'}
                        </span>
                        <span className={`ml-3 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getNumericGradeColor(grade.score)} text-white`}>
                          {typeof grade.score === 'number' ? (grade.score <= 3.0 ? 'Pass' : 'Fail') : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGrade(grade)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </ResponsiveTable>

      {/* Grade Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Grade Details"
        size="lg"
      >
        {selectedGrade && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-student-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-student-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedGrade.title}</h2>
                <p className="text-gray-600">{selectedGrade.subject.name} ({selectedGrade.subject.code})</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <p className="text-2xl font-semibold text-gray-900">
                  {typeof selectedGrade.score === 'number' ? selectedGrade.score.toFixed(2) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <Badge className={getNumericGradeColor(selectedGrade.score)} size="lg">
                  {typeof selectedGrade.score === 'number' ? (selectedGrade.score <= 3.0 ? 'Pass' : 'Fail') : 'N/A'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                <Badge className={getAssessmentBadgeColor(selectedGrade.assessmentType)}>
                  {selectedGrade.assessmentType}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Graded</label>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(selectedGrade.gradedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <p className="text-lg font-semibold text-gray-900">{selectedGrade.teacher}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedGrade.semester === 'first' ? 'First' : 'Second'} Semester {selectedGrade.academicYear}
                </p>
              </div>
            </div>
            
            {selectedGrade.feedback && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Feedback</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedGrade.feedback}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
