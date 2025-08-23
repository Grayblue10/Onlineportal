import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, CheckCircle, ArrowLeft, Lock, Mail, Hash, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import tracLogo from '../../assets/images/traclogo.png';
import backgroundImage from '../../assets/images/backgroundimage.jpeg';

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Administrator' },
];

const RegisterForm = () => {
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    }
  });

  const password = watch('password');
  const selectedRole = watch('role');
  
  const onSubmit = async (data) => {
    try {
      setFormError(null);
      const userData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: (data.role || 'student').toLowerCase()
      };
      
      const response = await registerUser(userData);
      
      if (response) {
        setFormSuccess(true);
        toast.success('Registration successful! Please verify your email.');
        reset();
        
        setTimeout(() => {
          const redirectPath = 
            response.user?.role === 'admin' ? '/admin/dashboard' :
            response.user?.role === 'teacher' ? '/teacher/dashboard' :
            response.user?.role === 'student' ? '/student/dashboard' :
            '/';
          navigate(redirectPath, { replace: true });
        }, 1500);
      }
    } catch (error) {
      // Provide specific, user-friendly message for admin registration cap
      const respMsg = error?.response?.data?.message || '';
      const plainMsg = error?.message || '';
      const combinedMsg = `${respMsg} ${plainMsg}`.toLowerCase();
      const isAdminCap = (error?.response?.status === 403) ||
        combinedMsg.includes('admin registration limit') ||
        combinedMsg.includes('only two admins');

      if (isAdminCap) {
        const msg = 'Administrator registrations are limited to two accounts. Please contact an existing admin to create your access or register as Teacher/Student.';
        setFormError({ message: msg });
        toast.error(msg);
        return;
      }

      // Specific handling for already-existing user/email (may come as 409 or 400 with message)
      const isEmailExists = (error?.response?.status === 409) ||
        combinedMsg.includes('user already exists') ||
        combinedMsg.includes('email already exists') ||
        combinedMsg.includes('email already registered') ||
        combinedMsg.includes('already exists with this email');

      if (isEmailExists) {
        const msg = 'Email already registered. Please log in or use a different email.';
        setFormError({ message: msg });
        toast.error(msg);
        return;
      }

      const errorMessage =
        // Prefer server message when available
        error.response?.data?.message ||
        (error.response?.status === 409 ? 'Email already registered' :
        error.message || 'Failed to register');

      setFormError({ message: errorMessage });
      toast.error(errorMessage);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <div className="animate-pulse flex justify-center mb-6">
            <GraduationCap className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating your account</h2>
          <p className="text-gray-600">We're setting things up for you...</p>
          <div className="mt-6">
            <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Illustration Side */}
          <div
            className="hidden md:block md:w-1/2 p-10 text-white"
            style={{ background: 'linear-gradient(to bottom, #800000, #4d0000)' }}
          >
            <div className="flex flex-col h-full justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <GraduationCap className="h-10 w-10" />
                  <img src={tracLogo} alt="TRAC Logo" className="h-14 w-auto" />
                </div>
                <h2 className="text-lg font-bold mb-1 leading-tight">Join Our Academic Community</h2>
                <p className="opacity-90 text-xs leading-snug">Register to access courses, grades, and university resources</p>
              </div>
              <div className="mt-6 space-y-2 max-w-xs mx-auto">
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Access all university services</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Track your academic progress</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Connect with faculty and peers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
              <p className="text-gray-600 mt-2">Join our university platform today</p>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">{formError.message}</p>
                  </div>
                </div>
              </div>
            )}

            {formSuccess && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Registration successful! Redirecting...</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                      placeholder="First name"
                      disabled={isSubmitting}
                      {...register('firstName', { required: 'First name is required' })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                      placeholder="Last name"
                      disabled={isSubmitting}
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                    placeholder="name@gmail.com"
                    disabled={isSubmitting}
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                    placeholder="Enter a strong password"
                    disabled={isSubmitting}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                    placeholder="Re-enter your password"
                    disabled={isSubmitting}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                  disabled={isSubmitting}
                  {...register('role')}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedRole === 'admin' && (
                  <p className="mt-2 text-xs text-amber-600">
                    Note: Administrator registrations are limited to two accounts. If both admin seats are used, please contact an existing admin.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#800000] hover:bg-[#660000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-3 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;