import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Save, FileText, Users, Award, Calculator, Loader2 } from 'lucide-react';
import { Button, Input, Card, Modal, Badge, Select, MobileCardList, ResponsiveTable } from '../../components/ui';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import teacherService from '../../services/teacherService';

export default function TeacherGrades() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // Subjects removed from UI; subject will be derived from selected class on backend
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    class: searchParams.get('class') || '',
    semester: ''
  });
  const studentFromQuery = searchParams.get('student') || '';

  const [gradeFormData, setGradeFormData] = useState({
    studentId: '',
    classId: '',
    subjectCode: '',
    assessmentType: 'final',
    title: 'Final Grade',
    maxScore: 5,
    score: 1.0,
    semester: 'first',
    academicYear: '2024-25'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      fetchGrades();
    }
  }, [filters, classes]);

  // Auto-filter students list by selected class (from filters or form)
  useEffect(() => {
    const classId = gradeFormData.classId || filters.class;
    if (classId) {
      setStudentsLoading(true);
      teacherService.getClassStudents(classId)
        .then((res) => {
          const data = res?.data || res || [];
          setFilteredStudents(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error('[TeacherGrades] Failed to load class students:', error);
          setFilteredStudents([]);
        })
        .finally(() => setStudentsLoading(false));
    } else {
      setFilteredStudents(students);
    }
  }, [gradeFormData.classId, filters.class, students]);

  // If current selected student is not part of the filtered list, clear it
  useEffect(() => {
    if (!gradeFormData.studentId) return;
    const exists = filteredStudents.some(s => s._id === gradeFormData.studentId);
    if (!exists) {
      setGradeFormData(prev => ({ ...prev, studentId: '' }));
    }
  }, [filteredStudents]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[TeacherGrades] Fetching initial data...');
      
      // Fetch data in parallel using teacherService
      const [classesResponse, studentsResponse, subjectsResponse] = await Promise.allSettled([
        teacherService.getClasses(),
        teacherService.getStudents(),
        teacherService.getAssignedSubjects()
      ]);
      
      // Handle classes response
      let classesList = [];
      if (classesResponse.status === 'fulfilled') {
        const rawClasses = classesResponse.value?.data ?? classesResponse.value;
        classesList = Array.isArray(rawClasses) ? rawClasses : (Array.isArray(rawClasses?.data) ? rawClasses.data : []);
        setClasses(classesList);
      } else {
        console.error('[TeacherGrades] Error fetching classes:', classesResponse.reason);
        toast.error('Failed to load classes');
      }
      
      // Handle subjects response (fallback to unique subjects from classes if failed)
      if (subjectsResponse.status === 'fulfilled') {
        const raw = subjectsResponse.value?.data ?? subjectsResponse.value;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
        setSubjects(list);
      } else {
        console.warn('[TeacherGrades] Subjects API unavailable, deriving from classes');
        const unique = [...new Map((classesList || [])
          .filter(c => c.subject)
          .map(c => [c.subject.code || c.subject.name, c.subject])
        ).values()];
        setSubjects(unique);
      }
      
      // Handle students response
      if (studentsResponse.status === 'fulfilled') {
        const rawStudents = studentsResponse.value?.data ?? studentsResponse.value;
        const studentsList = Array.isArray(rawStudents) ? rawStudents : (Array.isArray(rawStudents?.data) ? rawStudents.data : []);
        setStudents(studentsList);
      } else {
        console.warn('[TeacherGrades] getStudents() failed, attempting fallback to getEnrolledStudents()', studentsResponse.reason);
        try {
          const enrolled = await teacherService.getEnrolledStudents();
          const list = Array.isArray(enrolled) ? enrolled : (Array.isArray(enrolled?.data) ? enrolled.data : []);
          setStudents(list);
        } catch (fallbackError) {
          console.error('[TeacherGrades] Fallback getEnrolledStudents() failed:', fallbackError);
          toast.error('Failed to load students');
        }
      }
      
    } catch (error) {
      console.error('[TeacherGrades] Error in fetchInitialData:', error);
      toast.error('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchGrades = useCallback(async () => {
    // Allow fetching by subject alone; class is optional
    try {
      setLoading(true);
      console.log('[TeacherGrades] Fetching grades with filters:', filters);
      
      const response = await teacherService.getGrades({
        classId: filters.class || undefined,
        subjectCode: filters.subject || undefined,
        semester: filters.semester || undefined,
        search: filters.search || undefined
      });
      
      // Robustly parse API response
      const raw = response?.data ?? response;
      const items = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      // Ensure only final grades are displayed and compute percentage if missing
      const processed = items
        .filter(g => (g.assessmentType || 'final') === 'final')
        .map(g => ({
          ...g,
          percentage: typeof g.percentage === 'number' && !Number.isNaN(g.percentage)
            ? g.percentage
            : (g.maxScore ? Math.round(((g.score || 0) / g.maxScore) * 100) : 0)
        }));

      // Deduplicate by student+subject(or class)+semester, keep most recent by updatedAt/gradedAt
      const dedupMap = new Map();
      for (const g of processed) {
        const key = [
          g.student?._id || g.student?.id || g.student,
          // prefer subject code/name, fallback to class id
          g.subject?.code || g.subject?._id || g.subject?.name || g.class?._id || g.class?.id || g.class,
          g.semester
        ].join('|');
        const existing = dedupMap.get(key);
        const gTime = new Date(g.updatedAt || g.gradedAt || 0).getTime();
        const eTime = new Date(existing?.updatedAt || existing?.gradedAt || 0).getTime();
        if (!existing || gTime >= eTime) {
          dedupMap.set(key, g);
        }
      }
      setGrades([...dedupMap.values()]);
      console.log('[TeacherGrades] Grades loaded:', processed.length);
      
    } catch (error) {
      console.error('[TeacherGrades] Error fetching grades:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load grades';
      console.error('[TeacherGrades] Error details:', errorMessage);
      toast.error(errorMessage);
      setGrades([]);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        console.log('[TeacherGrades] Unauthorized, redirecting to login...');
        // You might want to implement a redirect to login here
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setGradeFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields (subject is derived from class on backend)
    if (!gradeFormData.studentId || !gradeFormData.classId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      // Derive subject from selected class (for UI and to send along)
      const selectedClass = classes.find(c => c._id === gradeFormData.classId);
      const subjectFromClass = selectedClass?.subject ? {
        name: selectedClass.subject.name || 'Unknown Subject',
        code: selectedClass.subject.code || 'N/A'
      } : undefined;
      // Force backend-required fields for final overall grading
      const payload = {
        ...gradeFormData,
        assessmentType: 'final',
        title: 'Final Grade',
        maxScore: 5,
        // Ensure score is within 1.0 - 5.0 in 0.25 increments
        score: Math.max(1, Math.min(5, Math.round((gradeFormData.score || 1) * 4) / 4)),
        // Include subject for clarity (backend embeds from class but this keeps API explicit)
        ...(subjectFromClass ? { subject: subjectFromClass } : {})
      };
      
      if (isEditing) {
        // Update existing grade (support _id or id)
        const updateId = currentGrade?._id || currentGrade?.id;
        if (!updateId) throw new Error('Missing grade id for update');
        console.log('[Grades] Updating grade:', { id: updateId, data: payload });
        try {
          await teacherService.updateGrade(updateId, payload);
        } catch (err) {
          // Fallback for servers that update via /grades/student/:studentId or when not authorized to update by id (403)
          const status = err?.response?.status;
          if (status === 404 || status === 405 || status === 403) {
            console.warn(`[Grades] updateGrade failed with ${status}, falling back to updateStudentGradeByStudentId`);
            // Transform payload for backend variant: subject as ID and grade 0-100
            const selectedClass = classes.find(c => c._id === gradeFormData.classId);
            let subjectId = selectedClass?.subject?._id;
            // Fallbacks to resolve subjectId if not embedded on class
            if (!subjectId) {
              // 1) Try from selected subject dropdown value
              if (gradeFormData.subjectCode) {
                const byDropdown = (subjects || []).find(s => s._id === gradeFormData.subjectCode || s.code === gradeFormData.subjectCode || s.name === gradeFormData.subjectCode);
                subjectId = byDropdown?._id || subjectId;
              }
              // 2) Try matching class code/name against subjects list
              if (!subjectId && selectedClass) {
                const byClass = (subjects || []).find(s => (s.code && s.code === (selectedClass.code || selectedClass.subject?.code)) || s.name === (selectedClass.subject?.name || selectedClass.subject));
                subjectId = byClass?._id || subjectId;
              }
              // 3) Try from current grade's subject details
              if (!subjectId && currentGrade?.subject) {
                const byCurrent = (subjects || []).find(s => s._id === currentGrade.subject._id || s.code === currentGrade.subject.code || s.name === currentGrade.subject.name);
                subjectId = byCurrent?._id || currentGrade?.subject?._id || subjectId;
              }
            }
            // If still not resolvable, abort with a clear message
            if (!subjectId) {
              toast.error('Could not resolve a valid Subject. Please select the Subject from the dropdown and try again.');
              setLoading(false);
              return;
            }
            const score1to5 = Math.max(1, Math.min(5, Number(gradeFormData.score) || 1));
            const gradePercent = Math.round(((5 - score1to5) / 4) * 100);
            const altPayload = {
              subject: subjectId, // backend expects subject MongoId
              grade: gradePercent, // 0-100 scale
              semester: gradeFormData.semester,
              comments: '',
              isFinal: true
            };
            await teacherService.updateStudentGradeByStudentId(gradeFormData.studentId, altPayload);
            // Best-effort: delete the old grade doc to avoid duplicates in listings
            if (updateId) {
              try {
                await teacherService.deleteGrade(updateId);
              } catch (delErr) {
                console.warn('[Grades] Failed to delete legacy grade after fallback update:', delErr?.response?.data || delErr?.message);
              }
            }
          } else {
            throw err;
          }
        }
        toast.success('Grade updated successfully');
      } else {
        // Create new grade
        console.log('[Grades] Creating new grade:', payload);
        await teacherService.createGrade(payload);
        toast.success('Grade added successfully');
      }
      
      // Clear cache and refresh data
      teacherService.clearCache();
      await fetchGrades();
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Error saving grade:', error);
      
      let errorMessage = 'Failed to save grade';
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
        
        if (error.response.status === 401) {
          // Handle unauthorized
          errorMessage = 'Session expired. Please log in again.';
          // You might want to redirect to login here
        } else if (error.response.status === 400) {
          // Handle validation errors
          const validationErrors = error.response.data?.errors;
          if (validationErrors) {
            errorMessage = Object.values(validationErrors).join('\n');
          }
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (grade) => {
    setCurrentGrade(grade);
    // Convert prior 0-100 style to 1.0-5.0 if needed
    let score = grade.score;
    if (grade.maxScore && grade.maxScore > 5) {
      const pct = Math.max(0, Math.min(1, (grade.score || 0) / grade.maxScore));
      // Map 100% -> 1.0, 0% -> 5.0 linearly
      const mapped = 5 - pct * 4; // 1.0 to 5.0
      score = Math.round(mapped * 4) / 4;
    }
    setGradeFormData({
      studentId: grade.student._id,
      classId: grade.class._id,
      subjectCode: grade.subject?.code || '',
      assessmentType: 'final',
      title: 'Final Grade',
      maxScore: 5,
      score: score ?? 1.0,
      semester: grade.semester,
      academicYear: grade.academicYear
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
      try {
        setLoading(true);
        await teacherService.deleteGrade(id);
        toast.success('Grade deleted successfully');
        await fetchGrades();
      } catch (error) {
        console.error('Error deleting grade:', error);
        
        if (error.response?.status === 401) {
          toast.error('Please log in to delete grades');
        } else {
          toast.error('Failed to delete grade');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setGradeFormData({
      studentId: '',
      classId: '',
      subjectCode: '',
      assessmentType: 'final',
      title: 'Final Grade',
      maxScore: 5,
      score: 1.0,
      semester: 'first',
      academicYear: '2024-25'
    });
    setCurrentGrade(null);
    setIsEditing(false);
  };

  const openNewGradeModal = () => {
    // Reset then apply defaults from filters and URL
    resetForm();
    setGradeFormData(prev => ({
      ...prev,
      subjectCode: filters.subject || prev.subjectCode,
      classId: filters.class || prev.classId,
      studentId: studentFromQuery || prev.studentId,
      assessmentType: 'final',
      title: 'Final Grade'
    }));
    setIsModalOpen(true);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grades Management</h1>
          <p className="text-gray-600 mt-1">Add and manage student grades for your classes</p>
        </div>
        <Button variant="primary" size="md" onClick={openNewGradeModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Grade
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              name="search"
              placeholder="Search students or assessments..."
              className="pl-10"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
          >
            <option value="">All Subjects</option>
            {(subjects && subjects.length > 0
              ? subjects
              : [...new Map(classes.filter(c => c.subject).map(c => [c.subject.code || c.subject.name, c.subject])).values()]
            ).map(subj => (
              <option key={subj.code || subj._id || subj.name} value={subj.code || subj._id || subj.name}>
                {subj.name}{subj.code ? ` (${subj.code})` : ''}
              </option>
            ))}
          </select>
          
          <select
            name="class"
            value={filters.class}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
          </select>
          
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
          >
            <option value="">All Semesters</option>
            <option value="first">First Semester</option>
            <option value="second">Second Semester</option>
          </select>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setFilters({ search: '', subject: '', class: '', semester: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Grades Table */}
      {/* Enrolled students for selected class */}
      {filters.class && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Students</h3>
            {studentsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          </div>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-gray-500">No enrolled students found for this class.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredStudents.map(s => (
                <button
                  type="button"
                  key={s._id}
                  onClick={() => setGradeFormData(prev => ({ ...prev, studentId: s._id }))}
                  className={`flex items-center justify-between px-3 py-2 rounded border text-left transition ${
                    gradeFormData.studentId === s._id
                      ? 'border-teacher-400 ring-2 ring-teacher-200 bg-teacher-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</div>
                    <div className="text-xs text-gray-500">{s.studentId}</div>
                  </div>
                  {gradeFormData.studentId === s._id && (
                    <Badge className="bg-teacher-100 text-teacher-800">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Mobile: stacked cards */}
      <MobileCardList>
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : grades.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">No grades found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {grades.map((grade) => (
              <div key={grade._id || grade.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teacher-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-teacher-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {grade.student.firstName} {grade.student.lastName}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{grade.student.studentId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{Number(grade.score).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">(1.00–5.00)</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <Badge className={getAssessmentBadgeColor(grade.assessmentType)}>
                    {grade.assessmentType}
                  </Badge>
                  <span className="text-gray-500">{grade.title}</span>
                  <span className="text-gray-500">• {grade.class.name}</span>
                  <span className="text-gray-500">• {grade.subject.name}</span>
                  <span className="text-gray-500">{new Date(grade.gradedAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(grade)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(grade._id || grade.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </MobileCardList>

      {/* Desktop/Tablet: table */}
      <ResponsiveTable>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No grades found
                  </td>
                </tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade._id || grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teacher-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-teacher-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {grade.student.firstName} {grade.student.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{grade.student.studentId}</div>
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
                      <div className="text-sm text-gray-900">{grade.class.name}</div>
                      <div className="text-sm text-gray-500">{grade.subject.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calculator className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-900">
                          {Number(grade.score).toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">(1.00–5.00)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grade.gradedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(grade)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(grade._id || grade.id)}
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

      {/* Add/Edit Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title={`${isEditing ? 'Edit' : 'Add New'} Final Grade`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <select
                name="studentId"
                value={gradeFormData.studentId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
                disabled={loading || studentsLoading}
              >
                <option value="">Select Student</option>
                {filteredStudents.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </option>
                ))}
              </select>
              {!!(gradeFormData.classId || filters.class) && (
                <p className="mt-1 text-xs text-gray-500">{studentsLoading ? 'Loading students for selected class...' : `Showing ${filteredStudents.length} enrolled student(s) in this class`}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="classId"
                value={gradeFormData.classId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
                disabled={loading}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
              </select>
            </div>
            
            {/* Subject dropdown (filters available classes) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subjectCode"
                value={gradeFormData.subjectCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
                disabled={loading}
              >
                <option value="">Select Subject</option>
                {(subjects && subjects.length > 0
                  ? subjects
                  : [...new Map(classes.filter(c => c.subject).map(c => [c.subject.code || c.subject.name, c.subject])).values()]
                ).map(subj => (
                  <option key={subj.code || subj._id || subj.name} value={subj.code || subj._id || subj.name}>
                    {subj.name}{subj.code ? ` (${subj.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                name="semester"
                value={gradeFormData.semester}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teacher-500"
                disabled={loading}
              >
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
              </select>
            </div>
            
            <Input
              label="Final Grade (1.00 – 5.00)"
              name="score"
              type="number"
              step="0.25"
              value={gradeFormData.score}
              onChange={handleInputChange}
              required
              min="1"
              max="5"
              disabled={loading}
            />
            
            {/* Notes removed from form */}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="success"
              loading={loading}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Grade' : 'Add Grade'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
