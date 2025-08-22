import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button, Input, Card, Modal, Badge, ResponsiveTable, MobileCardList } from '../../components/ui';
import { 
  Search, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Hash,
  UserCheck,
  UserX,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Teachers() {
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: ''
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    employeeId: '',
    contactNumber: '',
    address: '',
    isActive: true
  });
  
  const navigate = useNavigate();

  // Fetch all teachers once on mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Recompute filtered list when filters or allTeachers change
  useEffect(() => {
    const q = (filters.search || '').toLowerCase();
    const filtered = allTeachers.filter(teacher => {
      const fullName = (teacher.fullName || '').toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      const employeeId = String(teacher.employeeId || '');
      const matchesSearch = !q || fullName.includes(q) || email.includes(q) || employeeId.includes(q);
      const matchesStatus = filters.isActive === '' || teacher.isActive === (filters.isActive === 'true');
      return matchesSearch && matchesStatus;
    });
    setTeachers(filtered);
  }, [filters, allTeachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users?role=teacher');
      const data = response.data?.data || [];
      setAllTeachers(data);
      // initial filter apply
      const q = (filters.search || '').toLowerCase();
      const filtered = data.filter(teacher => {
        const fullName = (teacher.fullName || '').toLowerCase();
        const email = (teacher.email || '').toLowerCase();
        const employeeId = String(teacher.employeeId || '');
        const matchesSearch = !q || fullName.includes(q) || email.includes(q) || employeeId.includes(q);
        const matchesStatus = filters.isActive === '' || teacher.isActive === (filters.isActive === 'true');
        return matchesSearch && matchesStatus;
      });
      setTeachers(filtered);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEditing) {
        // Don't update password if it's empty
        const { password, ...updateData } = formData;
        if (!password) {
          delete updateData.password;
        }
        await api.put(`/api/admin/users/${currentTeacher._id}`, updateData);
        toast.success('Teacher updated successfully');
      } else {
        // For new teacher, password is required
        if (!formData.password) {
          toast.error('Password is required');
          return;
        }
        await api.post('/api/admin/users', { ...formData, role: 'teacher' });
        toast.success('Teacher created successfully');
      }
      
      setIsModalOpen(false);
      // Refresh the teachers list
      await fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} teacher`);
    } finally {
      setLoading(false);
    }
  };

  // Editing is disabled per requirements; keep function but no-op
  const handleEdit = () => {
    return;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        setLoading(true);
        await api.delete(`/api/admin/users/${id}`);
        toast.success('Teacher deleted successfully');
        // Refresh the teachers list
        await fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error(error.response?.data?.message || 'Failed to delete teacher');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      employeeId: '',
      contactNumber: '',
      address: '',
      isActive: true
    });
    setCurrentTeacher(null);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Teachers Management</h1>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="teacher-search"
              type="text"
              name="search"
              placeholder="Search by name, email, or ID..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Mobile: stacked cards */}
      <MobileCardList>
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : teachers.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No teachers found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teacher-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-teacher-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{teacher.fullName}</div>
                    <div className="text-sm text-gray-500 truncate">{teacher.email}</div>
                  </div>
                  <Badge variant={teacher.isActive ? 'success' : 'danger'}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium mr-1">Employee ID:</span>
                    {teacher.employeeId}
                  </div>
                  {teacher.contactNumber && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {teacher.contactNumber}
                    </div>
                  )}
                  {teacher.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{teacher.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(teacher._id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    title="Delete teacher"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileCardList>

      {/* Desktop/Tablet: Teachers Table */}
      <ResponsiveTable>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teacher-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-teacher-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {teacher.contactNumber && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            {teacher.contactNumber}
                          </div>
                        )}
                        {teacher.address && (
                          <div className="flex items-start mt-1">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500 line-clamp-1">{teacher.address}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-gray-400" />
                        {teacher.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={teacher.isActive ? 'success' : 'danger'}
                        className="inline-flex items-center"
                      >
                        {teacher.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher._id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Delete teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </ResponsiveTable>

      {/* Add/Edit Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title={`${isEditing ? 'Edit' : 'Add New'} Teacher`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="teacher-full-name"
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="John Doe"
              icon={User}
              disabled={loading}
            />
            
            <Input
              id="teacher-employee-id"
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
              placeholder="EMP-001"
              icon={Hash}
              disabled={loading}
            />
            
            <Input
              id="teacher-email"
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="teacher@example.com"
              icon={Mail}
              disabled={loading}
            />
            
            {!isEditing && (
              <Input
                id="teacher-password"
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
                placeholder="••••••••"
                helpText={isEditing ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                disabled={loading}
              />
            )}
            
            <Input
              id="teacher-contact-number"
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
              icon={Phone}
              disabled={loading}
            />
            
            <div className="md:col-span-2">
              <Input
                id="teacher-address"
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, Country"
                icon={MapPin}
                disabled={loading}
                textarea
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2 md:col-span-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-teacher-600 focus:ring-teacher-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Teacher
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              className="bg-teacher-600 hover:bg-teacher-700"
              disabled={loading}
            >
              {isEditing ? 'Update Teacher' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
