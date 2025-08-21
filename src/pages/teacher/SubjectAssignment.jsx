import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Book, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import teacherService from '../../services/teacherService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

const SubjectAssignment = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canSelfAssign, setCanSelfAssign] = useState(true);
  const [assignBlockReason, setAssignBlockReason] = useState('');

  const fetchAvailableSubjects = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[SubjectAssignment] Fetching available subjects');
      const response = await teacherService.getAvailableSubjects();
      console.log('[SubjectAssignment] Subjects response:', response);
      setSubjects(response.data || []);
      const canAssign = response?.meta?.canSelfAssign !== false; // default true
      setCanSelfAssign(canAssign);
      setAssignBlockReason(response?.meta?.reason || '');
    } catch (error) {
      console.error('[SubjectAssignment] Error fetching subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSubjects();
  }, [fetchAvailableSubjects]);

  const handleSubjectToggle = (subjectId, maxSelectable) => {
    if (!canSelfAssign) {
      toast.error(assignBlockReason || 'Subject assignment is disabled. Please contact admin.');
      return;
    }
    if (maxSelectable <= 0) {
      toast.error('You have reached the maximum allowed assigned subjects.');
      return;
    }
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else if (prev.length < maxSelectable) {
        return [...prev, subjectId];
      } else {
        toast.error(`You can only select ${maxSelectable} more subject${maxSelectable > 1 ? 's' : ''}`);
        return prev;
      }
    });
  };

  const handleAssignSubjects = async (maxSelectable) => {
    if (!canSelfAssign) {
      toast.error(assignBlockReason || 'Subjects already assigned by admin. Contact admin for changes.');
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }
    if (maxSelectable <= 0) {
      toast.error('You already have the maximum allowed assigned subjects.');
      return;
    }
    if (selectedSubjects.length > maxSelectable) {
      toast.error(`You can only assign ${maxSelectable} more subject${maxSelectable > 1 ? 's' : ''}`);
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('[SubjectAssignment] Assigning subjects:', selectedSubjects);
      await teacherService.assignSubjects(selectedSubjects);
      toast.success('Subjects assigned successfully');
      // Refresh the list after assignment
      await fetchAvailableSubjects();
      setSelectedSubjects([]);
    } catch (error) {
      console.error('[SubjectAssignment] Error assigning subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to assign subjects');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const assignedSubjects = subjects.filter(subject => subject.isAssigned);
  const availableSubjects = subjects.filter(subject => !subject.isAssigned);
  const assignedCount = assignedSubjects.length;
  const maxTotal = 2;
  const remainingSlots = Math.max(0, maxTotal - assignedCount);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subject Assignment</h1>
        <div className="text-sm text-gray-600">
          {remainingSlots > 0
            ? `You can select up to ${remainingSlots} more subject${remainingSlots > 1 ? 's' : ''} (max ${maxTotal})`
            : `You have reached the maximum of ${maxTotal} assigned subjects.`}
        </div>
      </div>

      {!canSelfAssign && (
        <Card>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Subject assignment is disabled</p>
                <p className="text-sm">{assignBlockReason || 'Subjects have been assigned by an admin. Please contact the administrator for changes.'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Currently Assigned Subjects */}
      {assignedSubjects.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Currently Assigned Subjects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className="border border-green-200 bg-green-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Book className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">{subject.code}</p>
                        {subject.description && (
                          <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{subject.studentCount}/30</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Available Subjects */}
      {availableSubjects.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              Available Subjects
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${remainingSlots === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              {availableSubjects.map((subject) => (
                <div
                  key={subject._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSubjects.includes(subject._id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSubjectToggle(subject._id, remainingSlots)}
                  aria-disabled={!canSelfAssign || remainingSlots === 0}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Book className={`h-5 w-5 mr-3 ${
                        selectedSubjects.includes(subject._id) ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600">{subject.code}</p>
                        {subject.description && (
                          <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject._id)}
                        onChange={() => handleSubjectToggle(subject._id, remainingSlots)}
                        disabled={!canSelfAssign || remainingSlots === 0}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSubjects.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {selectedSubjects.length} selected (remaining allowed: {remainingSlots})
                </div>
                <Button
                  variant="success"
                  size="md"
                  onClick={() => handleAssignSubjects(remainingSlots)}
                  disabled={submitting || !canSelfAssign || remainingSlots === 0}
                  loading={submitting}
                >
                  {submitting ? 'Assigning...' : 'Assign Selected Subjects'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {availableSubjects.length === 0 && assignedSubjects.length === 0 && (
        <Card>
          <div className="p-6 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Available</h3>
            <p className="text-gray-600">There are no subjects available for assignment at this time.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubjectAssignment;
