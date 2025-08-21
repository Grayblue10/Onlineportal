import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Form from '../../components/forms/Form';
import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import { resetPassword as resetPasswordService } from '../../services/authService';

const ResetPassword = () => {
  const { token: tokenFromParams } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const token = useMemo(() => {
    if (tokenFromParams) return tokenFromParams;
    const qs = new URLSearchParams(location.search);
    return qs.get('token') || '';
  }, [tokenFromParams, location.search]);

  const handleSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset link. Token is missing.');
      return;
    }
    console.log('Password reset attempt started', { token });
    try {
      console.log('Sending password reset request...');
      await resetPasswordService(token, data.password);
      console.log('Password reset successful');
      setIsSuccess(true);
      toast.success('Password has been reset successfully!');
      setTimeout(() => {
        console.log('Redirecting to login page...');
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        validationErrors: error.response?.data?.errors,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error.response?.data?.errors?.password) {
        errorMessage = error.response.data.errors.password[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'The password reset link has expired or is invalid. Please request a new one.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. You will be redirected to the login page shortly.
          </p>
          <Button
            className="w-full justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        <Form
          schema="resetPassword"
          onSubmit={handleSubmit}
          submitText="Reset Password"
          className="space-y-6"
          submitButtonClassName="w-full justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FormInput
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            autoComplete="new-password"
            required
          />

          <FormInput
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            autoComplete="new-password"
            required
          />
        </Form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;