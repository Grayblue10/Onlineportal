
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard';
import Teachers from './pages/admin/Teachers';
import StudentEnrollment from './pages/admin/StudentEnrollment';
import TeacherAssignment from './pages/admin/TeacherAssignment';
import ProgramEnrollment from './pages/admin/ProgramEnrollment';
import TeacherDashboard from './pages/teacher/Dashboard';
import SubjectAssignment from './pages/teacher/SubjectAssignment';
import EnrolledStudents from './pages/teacher/EnrolledStudents';
import StudentGrades from './pages/student/Grades';
import StudentSubjects from './pages/student/Subjects';
import StudentProfile from './pages/student/Profile';
import TeacherClasses from './pages/teacher/Classes';
import TeacherGrades from './pages/teacher/Grades';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Route redirector based on user role
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not loading but no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but no role, redirect to login as fallback
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to the appropriate dashboard based on user role
  return <Navigate to={`/${user.role}`} replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      {/* Auth Routes */}
      <Route path="/login" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <LoginForm />
      } />
      <Route path="/register" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <RegisterForm />
      } />
      <Route path="/forgot-password" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <ForgotPassword />
      } />
      <Route path="/reset-password/:token" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <ResetPassword />
      } />
      <Route path="/reset-password" element={
        user ? <Navigate to={`/${user.role}`} replace /> : <ResetPassword />
      } />
      
      {/* Root redirect */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="enrollment" element={<StudentEnrollment />} />
        <Route path="program-enrollment" element={<ProgramEnrollment />} />
        <Route path="assignment" element={<TeacherAssignment />} />
        {/* Nested admin routes */}
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={
        <ProtectedRoute requiredRole="teacher">
          <ErrorBoundary fallbackReload={true}>
            <TeacherLayout />
          </ErrorBoundary>
        </ProtectedRoute>
      }>
        <Route index element={
          <ErrorBoundary>
            <TeacherDashboard />
          </ErrorBoundary>
        } />
        <Route path="subject-assignment" element={
          <ErrorBoundary>
            <SubjectAssignment />
          </ErrorBoundary>
        } />
        <Route path="enrolled-students" element={
          <ErrorBoundary>
            <EnrolledStudents />
          </ErrorBoundary>
        } />
        <Route path="classes" element={
          <ErrorBoundary>
            <TeacherClasses />
          </ErrorBoundary>
        } />
        <Route path="grades" element={
          <ErrorBoundary>
            <TeacherGrades />
          </ErrorBoundary>
        } />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute requiredRole="student">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ErrorBoundary>
            <StudentSubjects />
          </ErrorBoundary>
        } />
        <Route path="grades" element={
          <ErrorBoundary>
            <StudentGrades />
          </ErrorBoundary>
        } />
        <Route path="subjects" element={
          <ErrorBoundary>
            <StudentSubjects />
          </ErrorBoundary>
        } />
        <Route path="profile" element={
          <ErrorBoundary>
            <StudentProfile />
          </ErrorBoundary>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4ade80',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ef4444',
            },
          },
        }}
      />
    </div>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['admin', 'teacher', 'student']).isRequired
};

RoleBasedRedirect.propTypes = {};

export default App;