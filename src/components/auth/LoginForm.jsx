import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import tracLogo from '../../assets/images/traclogo.png';
import backgroundImage from '../../assets/images/backgroundimage.jpeg';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      // Clear any previous manual errors so validation can pass
      clearErrors(['email', 'password', 'form']);
      setLoading(true);
      // Clear any existing form errors
      setError('form', { type: 'manual', message: '' });
      
      const result = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password
      });
      
      if (!result?.user?.role) {
        throw new Error('Invalid response from server');
      }
      
      // Clear form errors on successful login
      setError('form', { type: 'manual', message: '' });
      toast.success('Login successful! Redirecting...');
      
      // Add a small delay to ensure auth state is properly updated
      setTimeout(() => {
        let redirectPath = from;
        if (from === '/' || from === '/login') {
          redirectPath = `/${result.user.role}`;
        }
        
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message || '';
      const derivedMessage =
        status === 401 ? (serverMsg || 'Incorrect password') :
        status === 404 ? (serverMsg || 'Account not found') :
        status === 403 ? 'Account not verified' :
        serverMsg || 'Failed to sign in';

      setError('form', { type: 'manual', message: derivedMessage });

      // Field-level hints using status/message
      if (status === 401 || /(invalid email or password|incorrect password)/i.test(derivedMessage)) {
        setError('password', { type: 'manual', message: 'Incorrect password' });
      } else if (status === 404 || /account not found/i.test(derivedMessage)) {
        setError('email', { type: 'manual', message: 'No account found with this email' });
      } else if (status === 403 || /not verified/i.test(derivedMessage)) {
        setError('email', { type: 'manual', message: 'Your account is not verified' });
      }

      toast.error(derivedMessage);
    } finally {
      setLoading(false);
    }
  };

  // Watchdog: prevent indefinite loading in case of network hang
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        // Failsafe to stop spinner and notify user
        setLoading(false);
        toast.error('Login is taking longer than expected. Please try again.');
      }, 15000); // 15s watchdog
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, toast]);

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
              <img src={tracLogo} alt="TRAC Logo" className="h-16 md:h-20 w-auto mb-4 mx-auto" />
              <GraduationCap className="h-12 w-12 mb-6 mx-auto" />
              <h2 className="text-xl font-bold mb-2 text-center">Welcome to Online Portal</h2>
              <p className="text-center opacity-90">Sign in to continue your academic journey</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
              <p className="text-gray-600 mt-2">Access your university account</p>
            </div>

            {/* Form-level banner removed per request; toasts will display errors */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="name@gmail.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    onInput={() => clearErrors(['email', 'form'])}
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
                    className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    onInput={() => clearErrors(['password', 'form'])}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#800000] hover:bg-[#660000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#800000]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;