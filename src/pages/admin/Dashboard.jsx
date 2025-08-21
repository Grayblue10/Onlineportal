import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button, Input, Card, Modal, Select } from '../../components/ui';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    description: '',
    units: 3,
    semester: 'first',
    department: '',
    isActive: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin dashboard data...');
        
        // Fetch dashboard stats from backend
        const response = await api.get('/api/admin/dashboard');
        console.log('Dashboard API response:', response.data);
        setDashboardData(response.data?.data || {});
        
        await fetchSubjects();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Fallback to empty data
        setDashboardData({
          systemStats: {
            totalUsers: 0,
            totalTeachers: 0,
            totalStudents: 0,
            activeUsers: 0,
            recentRegistrations: 0
          },
          recentUsers: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/admin/subjects');
      setSubjects(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Use empty array if API fails
      setSubjects([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  const stats = dashboardData?.stats || dashboardData?.systemStats || {};
  const normalizedQuery = subjectSearch.trim().toLowerCase();
  const filteredSubjects = normalizedQuery
    ? subjects.filter(s => {
        const name = (s.name || '').toLowerCase();
        const code = (s.code || '').toLowerCase();
        const dept = (s.department || '').toLowerCase();
        return name.includes(normalizedQuery) || code.includes(normalizedQuery) || dept.includes(normalizedQuery);
      })
    : subjects;
  const displaySubjects = normalizedQuery ? filteredSubjects : subjects.slice(0, 5);

  const handleSubjectInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubjectFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEditingSubject) {
        await api.put(`/api/admin/subjects/${currentSubject._id}`, subjectFormData);
        toast.success('Subject updated successfully');
      } else {
        await api.post('/api/admin/subjects', subjectFormData);
        toast.success('Subject created successfully');
      }
      
      setIsSubjectModalOpen(false);
      await fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditingSubject ? 'update' : 'create'} subject`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubject = (subject) => {
    setCurrentSubject(subject);
    setSubjectFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      units: subject.units,
      semester: subject.semester || 'first',
      department: subject.department || '',
      isActive: subject.isActive !== false
    });
    setIsEditingSubject(true);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        setLoading(true);
        await api.delete(`/admin/subjects/${id}`);
        toast.success('Subject deleted successfully');
        await fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error(error.response?.data?.message || 'Failed to delete subject');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetSubjectForm = () => {
    setSubjectFormData({
      name: '',
      code: '',
      description: '',
      units: 3,
      semester: 'first',
      department: '',
      isActive: true
    });
    setCurrentSubject(null);
    setIsEditingSubject(false);
  };

  const openNewSubjectModal = () => {
    resetSubjectForm();
    setIsSubjectModalOpen(true);
  };

  const statCards = [
    {
      title: 'Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/users?role=student')
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers || 0,
      icon: BookOpen,
      color: 'bg-teacher-500',
      onClick: () => navigate('/admin/teachers')
    },
    {
      title: 'Subjects',
      value: subjects.length || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      onClick: undefined
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.onClick}>
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Subjects Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Subjects</h3>
            <Button size="sm" onClick={openNewSubjectModal}>
              Create Subject
            </Button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              placeholder="Search subjects by name, code, or department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-3">
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No subjects created yet</p>
            ) : filteredSubjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No subjects match your search</p>
            ) : (
              displaySubjects.map((subject) => (
                <div key={subject._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                    <p className="text-xs text-gray-500">{subject.code} • {subject.units} units</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSubject(subject)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Subjects</span>
              <span className="font-semibold text-primary-600">
                {subjects.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Subjects</span>
              <span className="font-semibold text-green-600">
                {subjects.filter(s => s.isActive).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Health</span>
              <span className="text-green-600 font-semibold">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-primary-600 font-semibold">99.9%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => !loading && setIsSubjectModalOpen(false)}
        title={`${isEditingSubject ? 'Edit' : 'Create New'} Subject`}
        size="lg"
      >
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="subject-name"
              label="Subject Name"
              name="name"
              value={subjectFormData.name}
              onChange={handleSubjectInputChange}
              required
              placeholder="e.g., Mathematics"
              disabled={loading}
            />
            
            <Input
              id="subject-code"
              label="Subject Code"
              name="code"
              value={subjectFormData.code}
              onChange={handleSubjectInputChange}
              required
              placeholder="e.g., MATH101"
              disabled={loading}
            />
            
            <Input
              id="subject-units"
              label="Units"
              name="units"
              type="number"
              value={subjectFormData.units}
              onChange={handleSubjectInputChange}
              required
              min="0.5"
              max="10"
              step="0.5"
              disabled={loading}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                name="semester"
                value={subjectFormData.semester}
                onChange={handleSubjectInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
              </select>
            </div>
            
            <Input
              id="subject-department"
              label="Department"
              name="department"
              value={subjectFormData.department}
              onChange={handleSubjectInputChange}
              placeholder="e.g., Computer Science"
              disabled={loading}
            />
            
            <div className="md:col-span-2">
              <Input
                id="subject-description"
                label="Description"
                name="description"
                value={subjectFormData.description}
                onChange={handleSubjectInputChange}
                textarea
                rows={3}
                placeholder="Brief description of the subject..."
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2 md:col-span-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={subjectFormData.isActive}
                onChange={handleSubjectInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Subject
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubjectModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={loading}
            >
              {isEditingSubject ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;