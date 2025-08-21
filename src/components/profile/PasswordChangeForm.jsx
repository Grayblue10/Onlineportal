import React, { useState } from 'react';
import { changePassword } from '../../services/userService';
import { toast } from 'react-hot-toast';
import Form from '../forms/Form';
import FormInput from '../forms/FormInput';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordChangeForm = ({ userId, onSuccess }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (data) => {
    try {
      await changePassword(userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Password changed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
      throw error; // Let the form handle the error state
    }
  };

  return (
    <Form
      schema="changePassword"
      onSubmit={handleSubmit}
      submitText="Change Password"
      className="space-y-4"
      defaultValues={{
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }}
    >
      <div className="relative">
        <FormInput
          name="currentPassword"
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          placeholder="Enter your current password"
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
        >
          {showCurrentPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <FormInput
          name="newPassword"
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          placeholder="Enter your new password"
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          onClick={() => setShowNewPassword(!showNewPassword)}
        >
          {showNewPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <FormInput
          name="confirmPassword"
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your new password"
          leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
          required
          validation={{
            validate: (value, { getValues }) => 
              value === getValues('newPassword') || 'Passwords do not match'
          }}
        />
        <button
          type="button"
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </Form>
  );
};

export default PasswordChangeForm;
